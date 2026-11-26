
function testConnection() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  Logger.log("시트 연결 성공!");
  Logger.log("현재 시트 이름: " + sheet.getName());
}
