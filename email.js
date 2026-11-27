// 이메일 본문용 구단 한글명 변환 사전
const EMAIL_TEAM_KO_MAP = {
  arsenal: "아스널",
  "afc bournemouth": "본머스",
  bournemouth: "본머스",
  "aston villa": "아스톤 빌라",
  brentford: "브렌트포드",
  brighton: "브라이튼",
  "brighton and hove albion": "브라이튼",
  "brighton hove albion": "브라이튼",
  burnley: "번리",
  chelsea: "첼시",
  "crystal palace": "크리스탈 팰리스",
  everton: "에버턴",
  fulham: "풀럼",
  ipswich: "입스위치 타운",
  "ipswich town": "입스위치 타운",
  leeds: "리즈 유나이티드",
  "leeds united": "리즈 유나이티드",
  leicester: "레스터 시티",
  "leicester city": "레스터 시티",
  liverpool: "리버풀",
  luton: "루턴 타운",
  "luton town": "루턴 타운",
  "man city": "맨체스터 시티",
  "manchester city": "맨체스터 시티",
  "man utd": "맨체스터 유나이티드",
  "man united": "맨체스터 유나이티드",
  "manchester united": "맨체스터 유나이티드",
  newcastle: "뉴캐슬 유나이티드",
  "newcastle united": "뉴캐슬 유나이티드",
  "nott m forest": "노팅엄 포레스트",
  "nottingham forest": "노팅엄 포레스트",
  "sheffield utd": "셰필드 유나이티드",
  "sheffield united": "셰필드 유나이티드",
  southampton: "사우샘프턴",
  sunderland: "선덜랜드",
  spurs: "토트넘 홋스퍼",
  tottenham: "토트넘 홋스퍼",
  "tottenham hotspur": "토트넘 홋스퍼",
  "west ham": "웨스트햄 유나이티드",
  "west ham united": "웨스트햄 유나이티드",
  wolves: "울버햄튼",
  "wolverhampton wanderers": "울버햄튼",
  alaves: "알라베스",
  "deportivo alaves": "알라베스",
  almeria: "알메리아",
  "ath bilbao": "아틀레틱 빌바오",
  "athletic bilbao": "아틀레틱 빌바오",
  "athletic club": "아틀레틱 빌바오",
  "ath madrid": "아틀레티코 마드리드",
  "atletico madrid": "아틀레티코 마드리드",
  "atletico de madrid": "아틀레티코 마드리드",
  barcelona: "FC 바르셀로나",
  "fc barcelona": "FC 바르셀로나",
  betis: "레알 베티스",
  "real betis": "레알 베티스",
  cadiz: "카디스",
  celta: "셀타 비고",
  "celta vigo": "셀타 비고",
  "rc celta": "셀타 비고",
  elche: "엘체",
  "elche cf": "엘체",
  espanyol: "에스파뇰",
  "rcd espanyol": "에스파뇰",
  "rcd espanyol de barcelona": "에스파뇰",
  getafe: "헤타페",
  "getafe cf": "헤타페",
  girona: "지로나",
  granada: "그라나다",
  "las palmas": "라스 팔마스",
  leganes: "레가네스",
  levante: "레반테",
  "levante ud": "레반테",
  mallorca: "마요르카",
  "rcd mallorca": "마요르카",
  osasuna: "오사수나",
  "ca osasuna": "오사수나",
  oviedo: "레알 오비에도",
  "real oviedo": "레알 오비에도",
  "rayo vallecano": "라요 바예카노",
  vallecano: "라요 바예카노",
  "real madrid": "레알 마드리드",
  sociedad: "레알 소시에다드",
  "real sociedad": "레알 소시에다드",
  sevilla: "세비야",
  "sevilla fc": "세비야",
  valencia: "발렌시아",
  "valencia cf": "발렌시아",
  valladolid: "레알 바야돌리드",
  "real valladolid": "레알 바야돌리드",
  villarreal: "비야레알",
  "villarreal cf": "비야레알",
  augsburg: "아우크스부르크",
  "fc augsburg": "아우크스부르크",
  "bayern munich": "바이에른 뮌헨",
  "bayern munchen": "바이에른 뮌헨",
  "fc bayern munchen": "바이에른 뮌헨",
  bochum: "보훔",
  "vfl bochum": "보훔",
  darmstadt: "다름슈타트",
  dortmund: "보루시아 도르트문트",
  "borussia dortmund": "보루시아 도르트문트",
  "ein frankfurt": "아인트라흐트 프랑크푸르트",
  "eintracht frankfurt": "아인트라흐트 프랑크푸르트",
  frankfurt: "아인트라흐트 프랑크푸르트",
  freiburg: "프라이부르크",
  "sc freiburg": "프라이부르크",
  gladbach: "보루시아 묀헨글라트바흐",
  "m gladbach": "보루시아 묀헨글라트바흐",
  "borussia monchengladbach": "보루시아 묀헨글라트바흐",
  hamburg: "함부르크 SV",
  "hamburger sv": "함부르크 SV",
  heidenheim: "하이덴하임",
  "1 fc heidenheim": "하이덴하임",
  hoffenheim: "호펜하임",
  "tsg hoffenheim": "호펜하임",
  "holstein kiel": "홀슈타인 킬",
  koln: "FC 쾰른",
  "fc koln": "FC 쾰른",
  "1 fc koln": "FC 쾰른",
  cologne: "FC 쾰른",
  leverkusen: "바이어 레버쿠젠",
  "bayer leverkusen": "바이어 레버쿠젠",
  "bayer 04 leverkusen": "바이어 레버쿠젠",
  mainz: "마인츠 05",
  "mainz 05": "마인츠 05",
  "1 fsv mainz 05": "마인츠 05",
  "rb leipzig": "RB 라이프치히",
  leipzig: "RB 라이프치히",
  "st pauli": "장크트 파울리",
  "fc st pauli": "장크트 파울리",
  stuttgart: "슈투트가르트",
  "vfb stuttgart": "슈투트가르트",
  "union berlin": "우니온 베를린",
  "1 fc union berlin": "우니온 베를린",
  "werder bremen": "베르더 브레멘",
  "sv werder bremen": "베르더 브레멘",
  wolfsburg: "볼프스부르크",
  "vfl wolfsburg": "볼프스부르크",
  atalanta: "아탈란타",
  bologna: "볼로냐",
  cagliari: "칼리아리",
  como: "코모 1907",
  cremonese: "크레모네세",
  empoli: "엠폴리",
  fiorentina: "피오렌티나",
  frosinone: "프로시노네",
  genoa: "제노아",
  inter: "인테르 밀란",
  "inter milan": "인테르 밀란",
  internazionale: "인테르 밀란",
  juventus: "유벤투스",
  lazio: "라치오",
  lecce: "레체",
  milan: "AC 밀란",
  "ac milan": "AC 밀란",
  monza: "몬차",
  napoli: "나폴리",
  parma: "파르마",
  pisa: "피사",
  roma: "AS 로마",
  "as roma": "AS 로마",
  salernitana: "살레르니타나",
  sassuolo: "사수올로",
  torino: "토리노",
  udinese: "우디네세",
  venezia: "베네치아",
  verona: "엘라스 베로나",
  "hellas verona": "엘라스 베로나",
  angers: "앙제",
  "angers sco": "앙제",
  auxerre: "오세르",
  "aj auxerre": "오세르",
  brest: "브레스트",
  "stade brestois": "브레스트",
  "stade brestois 29": "브레스트",
  clermont: "클레르몽",
  "le havre": "르아브르",
  "havre athletic club": "르아브르",
  lens: "RC 랑스",
  "rc lens": "RC 랑스",
  lille: "LOSC 릴",
  "losc lille": "LOSC 릴",
  lorient: "로리앙",
  "fc lorient": "로리앙",
  lyon: "올랭피크 리옹",
  "olympique lyonnais": "올랭피크 리옹",
  marseille: "올랭피크 드 마르세유",
  "olympique de marseille": "올랭피크 드 마르세유",
  metz: "FC 메스",
  monaco: "AS 모나코",
  "as monaco": "AS 모나코",
  montpellier: "몽펠리에",
  nantes: "FC 낭트",
  nice: "OGC 니스",
  "ogc nice": "OGC 니스",
  "paris fc": "파리 FC",
  "paris sg": "파리 생제르맹",
  "paris saint germain": "파리 생제르맹",
  psg: "파리 생제르맹",
  reims: "스타드 드 랭스",
  rennes: "스타드 렌",
  "stade rennais": "스타드 렌",
  "stade rennais fc": "스타드 렌",
  "st etienne": "생테티엔",
  "saint etienne": "생테티엔",
  strasbourg: "스트라스부르",
  "rc strasbourg alsace": "스트라스부르",
  toulouse: "툴루즈",
  "toulouse fc": "툴루즈",
};

function toKoreanTeamName_(rawName) {
  const original = String(rawName || "").trim();
  if (!original) return "";
  const normalized = original
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  return EMAIL_TEAM_KO_MAP[normalized] || original;
}

function sendTestEmail() {
  const recipient =
    PropertiesService.getScriptProperties().getProperty("EMAIL_RECIPIENT");

  const subject = "[GLOBAL FOOTBALL] 이메일 발송 테스트";
  const body = `
안녕하세요.

GLOBAL FOOTBALL 이메일 발송 테스트입니다.

Google Apps Script를 통한 이메일 발송이 정상적으로 작동하는지 확인하기 위한 테스트 메일입니다.

앞으로 해외축구 경기 일정과 경기 결과 정보를 전달할 예정입니다.

GLOBAL FOOTBALL
  `;

  GmailApp.sendEmail(recipient, subject, body);

  Logger.log("테스트 이메일 발송 완료!");
}

function sendEPLSummaryEmail() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

  if (!sheet) {
    throw new Error("경기정보 시트를 찾을 수 없습니다.");
  }

  const recipient =
    PropertiesService.getScriptProperties().getProperty("EMAIL_RECIPIENT");

  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log("저장된 경기 데이터가 없습니다.");
    return;
  }

  function isBlank(value) {
    return value === null || value === undefined || String(value).trim() === "";
  }

  const upcomingMatches = data.slice(1).filter((row) => {
    return (
      String(row.at(0)).trim() === "EPL" &&
      String(row.at(3)).trim() !== "" &&
      String(row.at(4)).trim() !== "" &&
      isBlank(row.at(5)) &&
      isBlank(row.at(6))
    );
  });

  Logger.log("전체 데이터 행 수: " + (data.length - 1));
  Logger.log("예정 경기 수: " + upcomingMatches.length);

  if (upcomingMatches.length === 0) {
    Logger.log("예정된 경기 데이터가 없습니다.");
    return;
  }

  upcomingMatches.sort((a, b) => {
    return String(a.at(1)).localeCompare(String(b.at(1)));
  });

  let body = "GLOBAL FOOTBALL\n";
  body += "EPL 경기 일정 안내\n";
  body += "================================\n\n";

  upcomingMatches.slice(0, 20).forEach((match) => {
    body += "경기 날짜: " + match.at(1) + "\n";
    body += "경기 시간: " + match.at(2) + "\n";
    body +=
      "경기: " +
      toKoreanTeamName_(match.at(3)) +
      " vs " +
      toKoreanTeamName_(match.at(4)) +
      "\n";
    body += "--------------------------------\n\n";
  });

  body += "GLOBAL FOOTBALL 경기정보 안내\n";

  GmailApp.sendEmail(recipient, "[GLOBAL FOOTBALL] EPL 경기 일정", body);

  Logger.log("EPL 경기정보 이메일 발송 완료!");
  Logger.log("발송 경기 수: " + Math.min(upcomingMatches.length, 20));
}

function diagnoseMatchData() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

  const data = sheet.getDataRange().getValues();

  Logger.log("===== 경기 데이터 진단 =====");

  for (let i = 1; i < Math.min(data.length, 11); i++) {
    const row = data.at(i);
    Logger.log(
      "행 " +
        (i + 1) +
        " | 팀: " +
        toKoreanTeamName_(row.at(3)) +
        " vs " +
        toKoreanTeamName_(row.at(4)) +
        " | 홈 점수: [" +
        row.at(5) +
        "]" +
        " | 원정 점수: [" +
        row.at(6) +
        "]" +
        " | 상태: [" +
        row.at(7) +
        "]",
    );
  }
}

function countMatchStatus() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

  const data = sheet.getDataRange().getValues().slice(1);

  let completed = 0;
  let upcoming = 0;
  let other = 0;

  data.forEach((row) => {
    const homeScore = String(row.at(5)).trim();
    const awayScore = String(row.at(6)).trim();

    if (homeScore !== "" && awayScore !== "") {
      completed++;
    } else if (homeScore === "" && awayScore === "") {
      upcoming++;

      Logger.log(
        "예정 경기: " +
          row.at(1) +
          " | " +
          toKoreanTeamName_(row.at(3)) +
          " vs " +
          toKoreanTeamName_(row.at(4)),
      );
    } else {
      other++;
    }
  });

  Logger.log("완료 경기: " + completed);
  Logger.log("예정 경기: " + upcoming);
  Logger.log("기타 데이터: " + other);
}

/**
 * 최근 경기 결과를 이메일로 발송 (최근 2일, 리그별로 표시)
 */
function sendRecentResultsEmail() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

  if (!sheet) {
    throw new Error("경기정보 시트를 찾을 수 없습니다.");
  }

  const recipient =
    PropertiesService.getScriptProperties().getProperty("EMAIL_RECIPIENT");

  if (!recipient) {
    throw new Error("EMAIL_RECIPIENT 스크립트 속성이 설정되지 않았습니다.");
  }

  const tz = Session.getScriptTimeZone();
  const cutoff = Utilities.formatDate(
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tz,
    "yyyy-MM-dd",
  );

  const results = sheet
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((row) => {
      return (
        String(row.at(7)).trim() === "완료" &&
        row.at(5) !== "" &&
        row.at(6) !== "" &&
        formatSheetDate(row.at(1)) >= cutoff
      );
    })
    .sort((a, b) => {
      const ka = formatSheetDate(a.at(1)) + " " + String(a.at(2));
      const kb = formatSheetDate(b.at(1)) + " " + String(b.at(2));
      return ka.localeCompare(kb);
    });

  if (results.length === 0) {
    Logger.log("발송할 최근 경기 결과가 없습니다.");
    return;
  }

  const byLeague = {};
  results.forEach((row) => {
    const league = String(row.at(0));
    if (!byLeague[league]) byLeague[league] = [];
    byLeague[league].push(row);
  });

  let body = "GLOBAL FOOTBALL\n";
  body += "최근 경기 결과 안내\n";
  body += "================================\n\n";

  Object.keys(byLeague).forEach((league) => {
    body += "[" + league + "]\n";
    byLeague[league].forEach((row) => {
      body +=
        formatSheetDate(row.at(1)) +
        "  " +
        toKoreanTeamName_(row.at(3)) +
        " " +
        row.at(5) +
        " : " +
        row.at(6) +
        " " +
        toKoreanTeamName_(row.at(4)) +
        "\n";
    });
    body += "\n";
  });

  body +=
    "결과 출처: football-data.co.uk " +
    "(경기별 출처 URL은 경기정보 시트 참고)\n";

  GmailApp.sendEmail(recipient, "[GLOBAL FOOTBALL] 최근 경기 결과", body);

  Logger.log("경기 결과 이메일 발송 완료! 경기 수: " + results.length);
}

function sendEspnResultsEmail() {
  return sendRecentResultsEmail();
}
