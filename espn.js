/**
 * GLOBAL FOOTBALL
 * ESPN 주요 5대 리그 스코어보드 수집 (API 없이 HTML 페이지만 사용)
 *
 * - 리그별 공개 스코어보드 HTML을 한 번씩 요청합니다 (총 5회, 재시도 없음).
 * - 최근 7일 범위를 조회해 주말 경기 결과도 놓치지 않도록 합니다.
 * - 날짜는 URL 경로 대신 ESPN이 제공하는 dates 쿼리로 전달합니다.
 * - 페이지에 포함된 데이터(window['__espnfitt__'])를 읽습니다.
 *   ESPN이 구조를 바꾸면 diagnoseEspn() 로그로 원인을 확인하세요.
 */

const ESPN_URL = "https://www.espn.com/soccer/scoreboard";

const ESPN_MAJOR_LEAGUE_CODES = ["eng.1", "esp.1", "ger.1", "ita.1", "fra.1"];
const ESPN_LOOKBACK_DAYS = 7;

// ESPN 리그 코드 → 사이트 표시용 리그 이름
const ESPN_LEAGUES = {
  "eng.1": "EPL",
  "esp.1": "La Liga",
  "ger.1": "Bundesliga",
  "ita.1": "Serie A",
  "fra.1": "Ligue 1",
  "uefa.champions": "UCL",
  "uefa.europa": "UEL",
};

// 코드를 못 찾을 때 리그 이름으로 보조 매칭 (소문자)
const ESPN_LEAGUE_NAMES = {
  "english premier league": "EPL",
  "spanish laliga": "La Liga",
  "german bundesliga": "Bundesliga",
  "italian serie a": "Serie A",
  "french ligue 1": "Ligue 1",
  "uefa champions league": "UCL",
  "uefa europa league": "UEL",
};

const SHEET_COLUMNS = 11; // A~J 기존 10열 + K열(game_id)

/* =========================================
   메인: 수집 → 시트 저장
========================================= */

function collectEspnResults() {
  const sheet = prepareMatchSheet_();
  const dateRange = getEspnDateRange_();
  const targets = [];

  ESPN_MAJOR_LEAGUE_CODES.forEach((leagueCode) => {
    const url = buildEspnLeagueUrl_(leagueCode, dateRange);
    const parsed = parseEspnHtml_(fetchEspnHtml_(url));
    const leagueKey = ESPN_LEAGUES[leagueCode];
    const matches = parsed.matches.filter((m) => m.leagueKey === leagueKey);

    Logger.log(leagueKey + " 페이지 경기: " + matches.length);
    matches.forEach((match) => {
      targets.push({ ...match, sourceUrl: url });
    });
  });

  Logger.log("수집 기간: " + dateRange.start + " ~ " + dateRange.end);
  Logger.log("저장 대상 경기: " + targets.length);

  const result = upsertEspnMatches_(sheet, targets);

  Logger.log("ESPN 수집 완료!");
  Logger.log("새로 추가: " + result.added + " / 갱신: " + result.updated);
}

/* =========================================
   페이지 요청 (재시도 없음)
========================================= */

function getEspnDateRange_() {
  const timeZone = Session.getScriptTimeZone();
  const today = new Date();
  const start = new Date(
    today.getTime() - ESPN_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );

  return {
    start: Utilities.formatDate(start, timeZone, "yyyyMMdd"),
    end: Utilities.formatDate(today, timeZone, "yyyyMMdd"),
  };
}

function buildEspnLeagueUrl_(leagueCode, dateRange) {
  return (
    ESPN_URL +
    "/_/league/" +
    leagueCode +
    "?dates=" +
    dateRange.start +
    "-" +
    dateRange.end
  );
}

function fetchEspnHtml_(url) {
  const requestUrl = url || ESPN_URL;
  const response = UrlFetchApp.fetch(requestUrl, {
    method: "get",
    headers: {
      "User-Agent":
        "GlobalFootballDemo/1.0 (personal non-commercial portfolio project)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    muteHttpExceptions: true,
    followRedirects: true,
  });

  const code = response.getResponseCode();

  if (code !== 200) {
    // 원인 파악용으로 응답 앞부분을 로그에 남김 (재시도는 하지 않음)
    Logger.log(
      "응답 앞부분: " +
        response.getContentText("UTF-8").substring(0, 300).replace(/\s+/g, " "),
    );
    throw new Error(
      "ESPN 페이지 요청 실패 (" +
        requestUrl +
        "): HTTP " +
        code +
        " (재시도하지 않습니다)",
    );
  }

  return response.getContentText("UTF-8");
}

/* =========================================
   HTML → 경기 목록
========================================= */

function parseEspnHtml_(html) {
  const json = extractEspnJson_(html);

  if (!json) {
    throw new Error(
      "페이지에서 경기 데이터를 찾지 못했습니다. diagnoseEspn() 로그를 확인하세요.",
    );
  }

  const events = [];
  collectEspnEvents_(json, null, events, 0);

  const matches = events
    .map((item) => parseEspnEvent_(item.evt, item.ctx))
    .filter((m) => m !== null);

  // 같은 경기가 중복으로 잡힌 경우 제거
  const seen = {};
  const unique = matches.filter((m) => {
    if (seen[m.gameId]) return false;
    seen[m.gameId] = true;
    return true;
  });

  const leaguesSeen = [];
  unique.forEach((m) => {
    const label = m.leagueName || m.leagueSlug || "(알 수 없음)";
    if (leaguesSeen.indexOf(label) === -1) leaguesSeen.push(label);
  });

  return { matches: unique, leaguesSeen: leaguesSeen };
}

// window['__espnfitt__'] = {...}; 에서 JSON 객체를 꺼냄
function extractEspnJson_(html) {
  const marker = /window\[['"]__espnfitt__['"]\]\s*=\s*/.exec(html);
  if (!marker) return null;

  const start = html.indexOf("{", marker.index + marker[0].length);
  if (start === -1) return null;

  // 문자열 안의 중괄호는 무시하고, 중괄호 짝이 맞는 지점까지 읽기
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(html.substring(start, i + 1));
      }
    }
  }

  return null;
}

// JSON 전체를 훑어 competitors 배열이 있는 객체(=경기)를 모두 수집
function collectEspnEvents_(node, ctx, out, depth) {
  if (!node || typeof node !== "object" || depth > 14) return;

  if (Array.isArray(node)) {
    node.forEach((item) => {
      if (item && typeof item === "object" && Array.isArray(item.competitors)) {
        out.push({ evt: item, ctx: ctx });
      } else {
        collectEspnEvents_(item, ctx, out, depth + 1);
      }
    });
    return;
  }

  // 리그 정보를 담은 상위 객체가 있으면 하위 경기에 전달
  let nextCtx = ctx;
  const slug = typeof node.slug === "string" ? node.slug : "";
  const rawName = node.name || node.displayName || "";
  const name = typeof rawName === "string" ? rawName : "";
  if (slug || name) {
    nextCtx = {
      slug: slug || (ctx ? ctx.slug : ""),
      name: name || (ctx ? ctx.name : ""),
    };
  }

  Object.keys(node).forEach((key) => {
    collectEspnEvents_(node[key], nextCtx, out, depth + 1);
  });
}

function parseEspnEvent_(evt, ctx) {
  const comps = evt.competitors;
  if (!Array.isArray(comps) || comps.length < 2) return null;

  let home = comps.find((c) => c && (c.isHome === true || c.homeAway === "home"));
  let away = comps.find((c) => c && (c.isHome === false || c.homeAway === "away"));

  // 구분 정보가 없으면 ESPN 축구 표기 순서(원정, 홈)를 따름
  if (!home || !away || home === away) {
    away = comps[0];
    home = comps[1];
  }

  const homeTeam = espnTeamName_(home);
  const awayTeam = espnTeamName_(away);
  if (!homeTeam || !awayTeam) return null;

  // 상태
  const st = evt.status || {};
  const state = String(
    st.state || (st.type && st.type.state) || "",
  ).toLowerCase();
  const detail = String(st.detail || st.description || st.shortDetail || "");

  let status;
  if (/postponed|cancel|abandon|suspend/i.test(detail)) {
    status = "연기/취소";
  } else if (state === "post" || evt.completed === true) {
    status = "완료";
  } else if (state === "pre") {
    status = "예정";
  } else if (state === "in") {
    status = "진행중";
  } else {
    status = detail || "확인 필요";
  }

  const showScore = status === "완료" || status === "진행중";
  const homeScore = showScore ? espnScore_(home) : "";
  const awayScore = showScore ? espnScore_(away) : "";

  // 날짜/시간 (한국 시간)
  const kst = toKst_(evt.date);

  // 리그
  const league = resolveEspnLeague_(evt);

  const gameId = evt.id
    ? "espn-" + String(evt.id)
    : ["espn", kst.date, homeTeam, awayTeam].join("|");

  return {
    gameId: gameId,
    leagueKey: league.key,
    leagueName: league.name,
    leagueSlug: league.slug,
    date: kst.date,
    time: kst.time,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    homeScore: homeScore,
    awayScore: awayScore,
    status: status,
  };
}

function espnTeamName_(c) {
  if (!c) return "";
  return String(
    c.displayName ||
      c.name ||
      c.shortDisplayName ||
      (c.team && (c.team.displayName || c.team.name)) ||
      "",
  ).trim();
}

function espnScore_(c) {
  let s = c ? c.score : "";
  if (s && typeof s === "object") s = s.displayValue || s.value;
  if (s === undefined || s === null) return "";
  s = String(s).trim();
  return s === "" ? "" : Number(s) >= 0 ? Number(s) : s;
}

function resolveEspnLeague_(evt) {
  // 경기 객체 자신의 리그 정보만 사용 (상위 객체 정보는 엉뚱한 리그로 오인될 수 있음)
  const values = [];

  function add(v) {
    if (v && typeof v === "object") {
      add(v.slug);
      add(v.name);
      add(v.displayName);
      add(v.abbrev);
      return;
    }
    if (typeof v === "string" && v.trim()) values.push(v.trim());
  }

  add(evt.lg);
  add(evt.leagueSlug);
  add(evt.league);
  add(evt.leagueName);

  let key = "";
  values.forEach((v) => {
    if (!key) key = ESPN_LEAGUES[v] || ESPN_LEAGUE_NAMES[v.toLowerCase()] || "";
  });

  const slug = values.find((v) => ESPN_LEAGUES[v]) || "";
  const name = values.find((v) => !ESPN_LEAGUES[v]) || values[0] || "";

  return { key: key, name: name, slug: slug };
}

// ISO 시각(UTC) → 한국 시간 날짜/시간 문자열
function toKst_(iso) {
  const t = Date.parse(iso);
  if (isNaN(t)) return { date: "", time: "" };

  const d = new Date(t + 9 * 60 * 60 * 1000);
  const p = (n) => String(n).padStart(2, "0");

  return {
    date: d.getUTCFullYear() + "-" + p(d.getUTCMonth() + 1) + "-" + p(d.getUTCDate()),
    time: p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()),
  };
}

/* =========================================
   시트 저장 (game_id 기준: 있으면 갱신, 없으면 추가)
========================================= */

function prepareMatchSheet_() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

  if (!sheet) {
    throw new Error("경기정보 시트를 찾을 수 없습니다.");
  }

  if (sheet.getMaxColumns() < SHEET_COLUMNS) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      SHEET_COLUMNS - sheet.getMaxColumns(),
    );
  }

  if (!String(sheet.getRange(1, SHEET_COLUMNS).getValue()).trim()) {
    sheet.getRange(1, SHEET_COLUMNS).setValue("game_id");
  }

  return sheet;
}

function upsertEspnMatches_(sheet, matches) {
  return upsertMatches_(sheet, matches);
}

function upsertMatches_(sheet, matches) {
  const lastRow = sheet.getLastRow();

  const rowById = {};
  const rowByFixture = {};
  const rowsWithResults = {};
  if (lastRow > 1) {
    sheet
      .getRange(2, 1, lastRow - 1, SHEET_COLUMNS)
      .getValues()
      .forEach((row, i) => {
        const sheetRow = i + 2;
        const id = String(row[10] || "").trim();
        if (id) rowById[id] = sheetRow;
        if (
          String(row[7]).trim() === "완료" ||
          (row[5] !== "" && row[6] !== "")
        ) {
          rowsWithResults[sheetRow] = true;
        }
        if (row[0] && row[3] && row[4]) {
          rowByFixture[
            matchFixtureKey_(row[0], row[1], row[3], row[4])
          ] = sheetRow;
        }
      });
  }

  const collectedAt = new Date();
  const newRows = [];
  const newRowById = {};
  const newRowByFixture = {};
  const updatedRows = {};
  let updated = 0;

  matches.forEach((m) => {
    const row = [
      m.leagueKey,
      m.date,
      m.time,
      m.homeTeam,
      m.awayTeam,
      m.homeScore,
      m.awayScore,
      m.status,
      m.sourceUrl || ESPN_URL,
      collectedAt,
      m.gameId,
    ];

    const fixtureKey = matchFixtureKey_(
      m.leagueKey,
      m.date,
      m.homeTeam,
      m.awayTeam,
    );
    const existingRow =
      rowById[m.gameId] || rowByFixture[fixtureKey];
    if (existingRow) {
      const r = existingRow;
      if (m.status === "예정" && rowsWithResults[r]) return;
      sheet.getRange(r, 2, 1, 2).setNumberFormat("@");
      updatedRows[r] = row;
      rowById[m.gameId] = r;
      rowByFixture[fixtureKey] = r;
    } else if (
      newRowById[m.gameId] !== undefined ||
      newRowByFixture[fixtureKey] !== undefined
    ) {
      const index =
        newRowById[m.gameId] !== undefined
          ? newRowById[m.gameId]
          : newRowByFixture[fixtureKey];
      if (m.status === "예정" && newRows[index][7] === "완료") return;
      newRows[index] = row;
      newRowById[m.gameId] = index;
      newRowByFixture[fixtureKey] = index;
    } else {
      const index = newRows.length;
      newRows.push(row);
      newRowById[m.gameId] = index;
      newRowByFixture[fixtureKey] = index;
    }
  });

  Object.keys(updatedRows).forEach((rowNumber) => {
    const r = Number(rowNumber);
    sheet.getRange(r, 1, 1, SHEET_COLUMNS).setValues([updatedRows[rowNumber]]);
    updated++;
  });

  if (newRows.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    // 날짜/시간이 Date 값으로 자동 변환되지 않도록 텍스트 서식 지정
    sheet.getRange(startRow, 2, newRows.length, 2).setNumberFormat("@");
    sheet.getRange(startRow, 1, newRows.length, SHEET_COLUMNS).setValues(newRows);
  }

  return { added: newRows.length, updated: updated };
}

/* =========================================
   점검용: 페이지 구조가 달라졌을 때 로그로 확인
========================================= */

function diagnoseEspn() {
  const html = fetchEspnHtml_();

  Logger.log("HTML 길이: " + html.length);
  Logger.log(
    "__espnfitt__ 포함 여부: " + /__espnfitt__/.test(html),
  );

  let json = null;
  try {
    json = extractEspnJson_(html);
  } catch (e) {
    Logger.log("JSON 파싱 오류: " + e.message);
    return;
  }

  if (!json) {
    Logger.log("경기 데이터 JSON을 찾지 못했습니다.");
    Logger.log("HTML 앞부분: " + html.substring(0, 1000));
    return;
  }

  Logger.log("JSON 최상위 키: " + Object.keys(json).join(", "));

  const events = [];
  collectEspnEvents_(json, null, events, 0);
  Logger.log("경기 객체 수: " + events.length);

  if (events.length > 0) {
    const first = events[0].evt;
    Logger.log("첫 경기 키: " + Object.keys(first).join(", "));
  }

  // 리그 값 분포 (리그 분류가 맞는지 확인용)
  const leagueCounts = {};
  events.forEach((item) => {
    const k =
      "league=" + JSON.stringify(item.evt.league).substring(0, 120) +
      " | leagueId=" + JSON.stringify(item.evt.leagueId);
    leagueCounts[k] = (leagueCounts[k] || 0) + 1;
  });
  Object.keys(leagueCounts).forEach((k) => {
    Logger.log("[리그값] " + k + " → " + leagueCounts[k] + "경기");
  });

  // 상태 값 샘플 (완료/예정/진행중 구분 확인용, 서로 다른 것 최대 6개)
  const statusSeen = {};
  events.forEach((item) => {
    if (Object.keys(statusSeen).length >= 6) return;
    const k =
      "completed=" + item.evt.completed + " | status=" +
      JSON.stringify(item.evt.status).substring(0, 250);
    statusSeen[k] = true;
  });
  Object.keys(statusSeen).forEach((k) => Logger.log("[상태값] " + k));

  const parsed = parseEspnHtml_(html);
  Logger.log("파싱된 경기 수: " + parsed.matches.length);
  Logger.log("보이는 리그: " + parsed.leaguesSeen.join(", "));
}

/* =========================================
   하루 1번 자동 실행 (수집 → 메일)
========================================= */

function runMatchDataPipeline() {
  collectFootballDataMatches();
  sendRecentResultsEmail();
}

function runEspnPipeline() {
  return runMatchDataPipeline();
}

function setupFootballDataDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach((t) => {
    const handler = t.getHandlerFunction();
    if (
      handler === "runEspnPipeline" ||
      handler === "runMatchDataPipeline"
    ) {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("runMatchDataPipeline")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  Logger.log(
    "매일 오전 8시 무렵 공개 CSV 기반 경기 수집 및 결과 메일을 실행하도록 설정했습니다.",
  );
}

function setupEspnDailyTrigger() {
  return setupFootballDataDailyTrigger();
}
