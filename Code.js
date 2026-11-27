/**
 * GLOBAL-FOOTBALL
 * Google Sheets 연결 및 웹사이트 데이터 제공
 */

// Google Sheets 연결 테스트
function testConnection() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

  if (!sheet) {
    throw new Error("경기정보 시트를 찾을 수 없습니다.");
  }

  Logger.log("시트 연결 성공!");
  Logger.log("현재 시트 이름: " + sheet.getName());
}

function doGet(e) {
  const callback = e && e.parameter ? e.parameter.callback : "";
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(callback)) {
    return createMatchDataCallback_(callback);
  }

  return createMatchPage_();
}

function createMatchPage_() {
  let html = HtmlService.createHtmlOutputFromFile("index").getContent();
  const styles = HtmlService.createHtmlOutputFromFile("WebAppCss").getContent();
  const scripts =
    HtmlService.createHtmlOutputFromFile("WebAppClient").getContent();
  const matches = getMatchData_();

  const styleTag = '<link rel="stylesheet" href="style.css" />';
  const scriptTag = '<script src="script.js"></script>';
  if (html.indexOf(styleTag) === -1 || html.indexOf(scriptTag) === -1) {
    throw new Error("index.html의 CSS/JavaScript 참조를 찾을 수 없습니다.");
  }

  html = html.replace(styleTag, "<style>\n" + styles + "\n</style>");
  const matchDataScript =
    "<script>window.GLOBAL_FOOTBALL_MATCHES = " +
    JSON.stringify(matches).replace(/</g, "\\u003c") +
    ";</script>";
  html = html.replace(
    scriptTag,
    matchDataScript + "\n<script>\n" + scripts + "\n</script>",
  );

  return HtmlService.createHtmlOutput(html).setTitle(
    "GLOBAL-FOOTBALL | 해외축구 정보 플랫폼",
  );
}

function getMatchData_() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

  if (!sheet) {
    throw new Error("경기정보 시트를 찾을 수 없습니다.");
  }

  return sheet
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((row) => row[0] && row[3] && row[4])
    .map((row) => ({
      league: String(row[0] || ""),
      match_date: formatSheetDate(row[1]),
      match_time: formatSheetTime(row[2]),
      home_team: String(row[3] || ""),
      away_team: String(row[4] || ""),
      home_score: row[5] === "" ? "" : row[5],
      away_score: row[6] === "" ? "" : row[6],
      status: String(row[7] || ""),
      source: String(row[8] || ""),
    }));
}

function createMatchDataCallback_(callback) {
  const response = {
    success: true,
    data: getMatchData_(),
  };

  return ContentService.createTextOutput(
    callback + "(" + JSON.stringify(response) + ");",
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// 시트 날짜 형식 정리
function formatSheetDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );
  }

  return String(value).trim();
}

function formatSheetTime(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "HH:mm");
  }

  return String(value).trim();
}
