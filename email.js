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
      String(row[0]).trim() === "EPL" &&
      String(row[3]).trim() !== "" &&
      String(row[4]).trim() !== "" &&
      isBlank(row[5]) &&
      isBlank(row[6])
    );
  });

  Logger.log("전체 데이터 행 수: " + (data.length - 1));
  Logger.log("예정 경기 수: " + upcomingMatches.length);

  if (upcomingMatches.length === 0) {
    Logger.log("예정된 경기 데이터가 없습니다.");
    return;
  }

  upcomingMatches.sort((a, b) => {
    return String(a[1]).localeCompare(String(b[1]));
  });

  let body = "GLOBAL FOOTBALL\n";
  body += "EPL 경기 일정 안내\n";
  body += "================================\n\n";

  upcomingMatches.slice(0, 20).forEach((match) => {
    body += "경기 날짜: " + match[1] + "\n";
    body += "경기 시간: " + match[2] + "\n";
    body += "경기: " + match[3] + " vs " + match[4] + "\n";
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
    Logger.log(
      "행 " +
        (i + 1) +
        " | 팀: " +
        data[i][3] +
        " vs " +
        data[i][4] +
        " | 홈 점수: [" +
        data[i][5] +
        "]" +
        " | 원정 점수: [" +
        data[i][6] +
        "]" +
        " | 상태: [" +
        data[i][7] +
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
    const homeScore = String(row[5]).trim();
    const awayScore = String(row[6]).trim();

    if (homeScore !== "" && awayScore !== "") {
      completed++;
    } else if (homeScore === "" && awayScore === "") {
      upcoming++;

      Logger.log("예정 경기: " + row[1] + " | " + row[3] + " vs " + row[4]);
    } else {
      other++;
    }
  });

  Logger.log("완료 경기: " + completed);
  Logger.log("예정 경기: " + upcoming);
  Logger.log("기타 데이터: " + other);
}
