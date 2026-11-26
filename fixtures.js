/**
 * GLOBAL FOOTBALL
 * EPL 예정 경기 수집
 */

function collectEPLFixtures() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("경기정보");

  if (!sheet) {
    throw new Error("경기정보 시트를 찾을 수 없습니다.");
  }

  // EPL 예정 경기 CSV 데이터
  const url = "https://raw.githubusercontent.com/oladeeayo/open-matchday/master/data/ENG_1_premier-league/fixtures_2627.csv";

  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error(
      "예정 경기 수집 실패: HTTP " +
      response.getResponseCode()
    );
  }

  const csvData = Utilities.parseCsv(
    response.getContentText()
  );

  if (csvData.length < 2) {
    Logger.log("예정 경기 데이터가 없습니다.");
    return;
  }

  const headers = csvData[0];

  const dateIndex = headers.indexOf("date");
  const timeIndex = headers.indexOf("time");
  const homeIndex = headers.indexOf("home");
  const awayIndex = headers.indexOf("away");

  if (
    dateIndex === -1 ||
    homeIndex === -1 ||
    awayIndex === -1
  ) {
    throw new Error("CSV 데이터 형식을 확인해주세요.");
  }

  // 기존 데이터 확인
  const existingData = sheet.getDataRange().getValues();

  // 기존 경기 중복 방지용
  const existingMatches = new Set();

  existingData.slice(1).forEach(row => {
    const key = [
      String(row[1]).trim(),
      String(row[3]).trim(),
      String(row[4]).trim()
    ].join("|");

    existingMatches.add(key);
  });

  const collectedAt = new Date();

  const rows = csvData.slice(1)
    .filter(row =>
      row[homeIndex] &&
      row[awayIndex] &&
      row[dateIndex]
    )
    .map(row => {

      const matchDate = row[dateIndex];

      const homeTeam = row[homeIndex];
      const awayTeam = row[awayIndex];

      const key = [
        String(matchDate).trim(),
        String(homeTeam).trim(),
        String(awayTeam).trim()
      ].join("|");

      // 이미 저장된 경기 제외
      if (existingMatches.has(key)) {
        return null;
      }

      return [
        "EPL",
        matchDate,
        timeIndex !== -1 ? row[timeIndex] : "",
        homeTeam,
        awayTeam,
        "",
        "",
        "예정",
        url,
        collectedAt
      ];
    })
    .filter(row => row !== null);

  // 신규 경기 저장
  if (rows.length > 0) {

    const startRow = sheet.getLastRow() + 1;

    sheet.getRange(
      startRow,
      1,
      rows.length,
      10
    ).setValues(rows);

  }

  Logger.log("EPL 예정 경기 수집 완료!");
  Logger.log("새로 추가된 경기 수: " + rows.length);
}