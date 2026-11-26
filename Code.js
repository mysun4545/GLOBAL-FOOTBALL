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

// 웹사이트에 경기 데이터 제공
function doGet(e) {
  try {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("경기정보");

    if (!sheet) {
      throw new Error("경기정보 시트를 찾을 수 없습니다.");
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return createMatchResponse(
        {
          success: true,
          data: [],
        },
        e,
      );
    }

    const matches = values
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

    return createMatchResponse(
      {
        success: true,
        total: matches.length,
        data: matches,
      },
      e,
    );
  } catch (error) {
    return createMatchResponse(
      {
        success: false,
        message: error.message,
        data: [],
      },
      e,
    );
  }
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

// JSON 또는 JSONP 응답 생성
function createMatchResponse(data, e) {
  const json = JSON.stringify(data);

  const callback = e && e.parameter ? e.parameter.callback : "";

  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(
      callback + "(" + json + ");",
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(json).setMimeType(
    ContentService.MimeType.JSON,
  );
}
