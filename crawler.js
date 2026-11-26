
/**
 * GLOBAL FOOTBALL
 * EPL 경기정보 수집 및 Google Sheets 저장
 */

function collectEPLMatches() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("경기정보");

  if (!sheet) {
    throw new Error("경기정보 시트를 찾을 수 없습니다.");
  }

  // 2026-2027 시즌 EPL 공개 CSV 데이터
  const url = "https://www.football-data.co.uk/mmz4281/2627/E0.csv";

  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("경기정보 수집 실패: HTTP " + response.getResponseCode());
  }

  const csvText = response.getContentText();
  const csvData = Utilities.parseCsv(csvText);

  if (csvData.length < 2) {
    throw new Error("수집된 경기 데이터가 없습니다.");
  }

  const headers = csvData[0];

  const dateIndex = headers.indexOf("Date");
  const timeIndex = headers.indexOf("Time");
  const homeIndex = headers.indexOf("HomeTeam");
  const awayIndex = headers.indexOf("AwayTeam");
  const homeScoreIndex = headers.indexOf("FTHG");
  const awayScoreIndex = headers.indexOf("FTAG");

  if (
    dateIndex === -1 ||
    homeIndex === -1 ||
    awayIndex === -1
  ) {
    throw new Error("CSV 데이터 형식을 확인해주세요.");
  }

  const collectedAt = new Date();

  const rows = csvData.slice(1)
    .filter(row => row[homeIndex] && row[awayIndex])
    .map(row => {
      const rawDate = row[dateIndex] || "";
      const matchDate = convertMatchDate(rawDate);

      const homeScore = row[homeScoreIndex] || "";
      const awayScore = row[awayScoreIndex] || "";

      const status = (
        homeScore !== "" && awayScore !== ""
      ) ? "완료" : "예정";

      return [
        "EPL",
        matchDate,
        row[timeIndex] || "",
        row[homeIndex],
        row[awayIndex],
        homeScore,
        awayScore,
        status,
        url,
        collectedAt
      ];
    });

  // 이 CSV에서 가져온 기존 행만 삭제 (다른 소스 데이터, 예: ESPN 수집분은 유지)
  const existing = sheet.getDataRange().getValues();
  for (let i = existing.length - 1; i >= 1; i--) {
    if (String(existing[i][8]) === url) {
      sheet.deleteRow(i + 1);
    }
  }

  // 수집 데이터 저장 (날짜·시간이 Date로 자동 변환되지 않도록 텍스트 서식 지정)
  if (rows.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 2, rows.length, 2).setNumberFormat("@");
    sheet.getRange(startRow, 1, rows.length, 10).setValues(rows);
  }

  Logger.log("EPL 수집 완료!");
  Logger.log("수집된 경기 수: " + rows.length);
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

  return year + "-" +
    month.padStart(2, "0") + "-" +
    day.padStart(2, "0");
}
