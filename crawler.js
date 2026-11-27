/**
 * GLOBAL FOOTBALL
 * Public CSV sources for major-league results and fixtures
 */

const FOOTBALL_DATA_ROOT = "https://www.football-data.co.uk/mmz4281/";
const OPEN_MATCHDAY_ROOT =
  "https://raw.githubusercontent.com/oladeeayo/open-matchday/master/data/";

const FOOTBALL_LEAGUES = [
  { code: "E0", key: "EPL", fixtures: "ENG_1_premier-league" },
  { code: "SP1", key: "La Liga", fixtures: "ESP_1_la-liga" },
  { code: "D1", key: "Bundesliga", fixtures: "GER_1_bundesliga" },
  { code: "I1", key: "Serie A", fixtures: "ITA_1_serie-a" },
  { code: "F1", key: "Ligue 1", fixtures: "FRA_1_ligue-1" },
];

const FOOTBALL_TEAM_ALIASES = {
  "man utd": "manchester united",
  "man united": "manchester united",
  "manchester united": "manchester united",
  spurs: "tottenham hotspur",
  tottenham: "tottenham hotspur",
  "tottenham hotspur": "tottenham hotspur",
  "1 fc koln": "koln",
  "fc koln": "koln",
  koln: "koln",
  cologne: "koln",
  "1 fc union berlin": "union berlin",
  "1 fsv mainz 05": "mainz",
  mainz: "mainz",
  "bayer 04 leverkusen": "leverkusen",
  leverkusen: "leverkusen",
  "borussia dortmund": "dortmund",
  dortmund: "dortmund",
  "borussia monchengladbach": "gladbach",
  "m gladbach": "gladbach",
  gladbach: "gladbach",
  "eintracht frankfurt": "frankfurt",
  "fc augsburg": "augsburg",
  augsburg: "augsburg",
  "fc bayern munchen": "bayern munich",
  "bayern munchen": "bayern munich",
  "bayern munich": "bayern munich",
  "fc schalke 04": "schalke",
  "schalke 04": "schalke",
  schalke: "schalke",
  "hamburger sv": "hamburg",
  hamburg: "hamburg",
  "sc freiburg": "freiburg",
  freiburg: "freiburg",
  "sc paderborn 07": "paderborn",
  paderborn: "paderborn",
  "sv 07 elversberg": "elversberg",
  elversberg: "elversberg",
  "sv werder bremen": "werder bremen",
  "werder bremen": "werder bremen",
  "tsg hoffenheim": "hoffenheim",
  hoffenheim: "hoffenheim",
  "vfb stuttgart": "stuttgart",
  stuttgart: "stuttgart",
  internazionale: "inter",
  inter: "inter",
  "aj auxerre": "auxerre",
  auxerre: "auxerre",
  "angers sco": "angers",
  angers: "angers",
  "as monaco": "monaco",
  monaco: "monaco",
  "estac troyes": "troyes",
  troyes: "troyes",
  "fc lorient": "lorient",
  lorient: "lorient",
  "havre athletic club": "le havre",
  "le havre": "le havre",
  "le mans fc": "le mans",
  "le mans": "le mans",
  "losc lille": "lille",
  lille: "lille",
  "ogc nice": "nice",
  nice: "nice",
  "olympique de marseille": "marseille",
  marseille: "marseille",
  "olympique lyonnais": "lyon",
  lyon: "lyon",
  "paris saint germain": "paris saint germain",
  "paris sg": "paris saint germain",
  psg: "paris saint germain",
  "rc lens": "lens",
  lens: "lens",
  "rc strasbourg alsace": "strasbourg",
  strasbourg: "strasbourg",
  "stade brestois 29": "brest",
  brest: "brest",
  "stade rennais fc": "rennes",
  "stade rennais": "rennes",
  rennes: "rennes",
  "toulouse fc": "toulouse",
  toulouse: "toulouse",
  "athletic club": "athletic bilbao",
  "ath bilbao": "athletic bilbao",
  "atletico de madrid": "atletico madrid",
  "ath madrid": "atletico madrid",
  "ca osasuna": "osasuna",
  osasuna: "osasuna",
  "deportivo alaves": "alaves",
  alaves: "alaves",
  "elche cf": "elche",
  elche: "elche",
  "fc barcelona": "barcelona",
  barcelona: "barcelona",
  "getafe cf": "getafe",
  getafe: "getafe",
  "levante ud": "levante",
  levante: "levante",
  "malaga cf": "malaga",
  malaga: "malaga",
  "r racing club": "racing santander",
  santander: "racing santander",
  "rayo vallecano": "rayo vallecano",
  vallecano: "rayo vallecano",
  "rc deportivo": "deportivo la coruna",
  "la coruna": "deportivo la coruna",
  "rcd espanyol de barcelona": "espanyol",
  espanyol: "espanyol",
  "real betis": "betis",
  betis: "betis",
  "real sociedad": "real sociedad",
  sociedad: "real sociedad",
  "sevilla fc": "sevilla",
  sevilla: "sevilla",
  "valencia cf": "valencia",
  valencia: "valencia",
  "villarreal cf": "villarreal",
  villarreal: "villarreal",
};

function collectFootballDataMatches(leagueKeys, options) {
  const sheet = prepareMatchSheet_();
  const season = getFootballSeasonCode_();
  const selectedLeagues = leagueKeys
    ? FOOTBALL_LEAGUES.filter((league) => leagueKeys.indexOf(league.key) !== -1)
    : FOOTBALL_LEAGUES;

  if (selectedLeagues.length === 0) {
    throw new Error("수집할 리그를 찾을 수 없습니다.");
  }

  const settings = options || {};
  const matches = [];
  const failures = [];
  let successfulFeeds = 0;

  selectedLeagues.forEach((league) => {
    if (!settings.resultsOnly) {
      const fixturesUrl =
        OPEN_MATCHDAY_ROOT +
        league.fixtures +
        "/fixtures_" +
        season +
        ".csv";
      try {
        const csv = fetchFootballCsv_(fixturesUrl);
        matches.push.apply(
          matches,
          parseFootballFixtures_(csv, league, season, fixturesUrl),
        );
        successfulFeeds++;
      } catch (error) {
        failures.push(fixturesUrl + ": " + error.message);
        Logger.log("일정 수집 실패: " + fixturesUrl + " / " + error.message);
      }
    }

    if (!settings.fixturesOnly) {
      const resultsUrl =
        FOOTBALL_DATA_ROOT + season + "/" + league.code + ".csv";
      try {
        const csv = fetchFootballCsv_(resultsUrl);
        matches.push.apply(
          matches,
          parseFootballResults_(csv, league, season, resultsUrl),
        );
        successfulFeeds++;
      } catch (error) {
        failures.push(resultsUrl + ": " + error.message);
        Logger.log("결과 수집 실패: " + resultsUrl + " / " + error.message);
      }
    }
  });

  if (successfulFeeds === 0) {
    throw new Error(
      "경기 데이터 소스에 연결하지 못했습니다. " + failures.join(" | "),
    );
  }

  const result = upsertMatches_(sheet, matches);
  Logger.log(
    "경기 수집 완료: " +
      selectedLeagues.map((league) => league.key).join(", "),
  );
  Logger.log("조회한 데이터 피드: " + successfulFeeds);
  Logger.log("새로 추가: " + result.added + " / 갱신: " + result.updated);

  if (failures.length > 0) {
    Logger.log(
      "일부 데이터 소스를 사용할 수 없습니다 (" +
        failures.length +
        "): " +
        failures.join(" | "),
    );
  }

  return result;
}

function fetchFootballCsv_(url) {
  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("HTTP " + response.getResponseCode());
  }

  return response.getContentText("UTF-8").replace(/^\uFEFF/, "");
}

function parseFootballResults_(csv, league, season, sourceUrl) {
  const data = Utilities.parseCsv(csv);
  if (data.length < 2) {
    throw new Error("CSV에 경기 데이터가 없습니다.");
  }

  const headers = data[0].map((header) => String(header).trim());
  const indexes = {
    date: headers.indexOf("Date"),
    time: headers.indexOf("Time"),
    home: headers.indexOf("HomeTeam"),
    away: headers.indexOf("AwayTeam"),
    homeScore: headers.indexOf("FTHG"),
    awayScore: headers.indexOf("FTAG"),
  };

  if (
    indexes.date === -1 ||
    indexes.home === -1 ||
    indexes.away === -1 ||
    indexes.homeScore === -1 ||
    indexes.awayScore === -1
  ) {
    throw new Error("결과 CSV 헤더 형식이 올바르지 않습니다.");
  }

  return data
    .slice(1)
    .filter(
      (row) =>
        row[indexes.date] &&
        row[indexes.home] &&
        row[indexes.away] &&
        isScorePresent_(row[indexes.homeScore]) &&
        isScorePresent_(row[indexes.awayScore]),
    )
    .map((row) =>
      createFootballMatch_(
        league,
        season,
        convertMatchDate(String(row[indexes.date]).trim()),
        indexes.time === -1 ? "" : row[indexes.time],
        row[indexes.home],
        row[indexes.away],
        row[indexes.homeScore],
        row[indexes.awayScore],
        "완료",
        sourceUrl,
      ),
    );
}

function parseFootballFixtures_(csv, league, season, sourceUrl) {
  const data = Utilities.parseCsv(csv);
  if (data.length < 2) {
    throw new Error("CSV에 예정 경기 데이터가 없습니다.");
  }

  const headers = data[0].map((header) => String(header).trim());
  const indexes = {
    date: headers.indexOf("date"),
    time: headers.indexOf("time"),
    home: headers.indexOf("home"),
    away: headers.indexOf("away"),
  };

  if (
    indexes.date === -1 ||
    indexes.home === -1 ||
    indexes.away === -1
  ) {
    throw new Error("일정 CSV 헤더 형식이 올바르지 않습니다.");
  }

  const fixtureCutoff = Utilities.formatDate(
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd",
  );

  return data
    .slice(1)
    .filter(
      (row) =>
        row[indexes.date] &&
        row[indexes.date] >= fixtureCutoff &&
        row[indexes.home] &&
        row[indexes.away],
    )
    .map((row) =>
      createFootballMatch_(
        league,
        season,
        String(row[indexes.date]).trim(),
        indexes.time === -1 ? "" : row[indexes.time],
        row[indexes.home],
        row[indexes.away],
        "",
        "",
        "예정",
        sourceUrl,
      ),
    );
}

function createFootballMatch_(
  league,
  season,
  date,
  time,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  sourceUrl,
) {
  const homeKey = normalizeFootballTeamName_(homeTeam);
  const awayKey = normalizeFootballTeamName_(awayTeam);

  return {
    gameId:
      "match-" +
      season +
      "-" +
      league.code +
      "-" +
      homeKey.replace(/\s+/g, "-") +
      "-" +
      awayKey.replace(/\s+/g, "-"),
    leagueKey: league.key,
    date: date,
    time: String(time || "").trim(),
    homeTeam: String(homeTeam).trim(),
    awayTeam: String(awayTeam).trim(),
    homeScore: scoreValue_(homeScore),
    awayScore: scoreValue_(awayScore),
    status: status,
    sourceUrl: sourceUrl,
  };
}

function normalizeFootballTeamName_(name) {
  const normalized = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return FOOTBALL_TEAM_ALIASES[normalized] || normalized;
}

function matchFixtureKey_(league, date, homeTeam, awayTeam) {
  return [
    String(league || "").trim().toLowerCase(),
    formatSheetDate(date),
    normalizeFootballTeamName_(homeTeam),
    normalizeFootballTeamName_(awayTeam),
  ].join("|");
}

function scoreValue_(value) {
  const score = String(value === null || value === undefined ? "" : value)
    .trim();
  return score !== "" && /^\d+$/.test(score) ? Number(score) : score;
}

function isScorePresent_(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function getFootballSeasonCode_() {
  const now = new Date();
  const timeZone = Session.getScriptTimeZone();
  const year = Number(Utilities.formatDate(now, timeZone, "yyyy"));
  const month = Number(Utilities.formatDate(now, timeZone, "M"));
  const startYear = year - (month < 7 ? 1 : 0);
  return (
    String(startYear).slice(-2) +
    String(startYear + 1).slice(-2)
  );
}

function collectEPLMatches() {
  return collectFootballDataMatches(["EPL"], { resultsOnly: true });
}

/**
 * 경기 날짜 형식 변환
 */
function convertMatchDate(dateString) {
  if (!dateString) return "";

  const parts = dateString.split("/");
  if (parts.length !== 3) return dateString;

  let day = parts[0];
  let month = parts[1];
  let year = parts[2];

  if (year.length === 2) {
    year = "20" + year;
  }

  return (
    year +
    "-" +
    month.padStart(2, "0") +
    "-" +
    day.padStart(2, "0")
  );
}
