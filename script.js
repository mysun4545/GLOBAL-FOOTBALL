/* =========================================
   GLOBAL-FOOTBALL
   경기 검색 및 화면 제어
========================================= */

if (typeof document !== "undefined") {
  const APPS_SCRIPT_WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbwdr5cRa758HAj_LnWTFFCg7f5Pnftjoo7MHo7x00g-lmvJntjQ5cDMi-eOWnbbgR7MwA/exec";

  let matchData = [];
  let dataStatus = "Apps Script에서 경기 데이터를 불러오는 중입니다.";

  const leagueFilter = document.getElementById("leagueFilter");
  const statusFilter = document.getElementById("statusFilter");
  const teamSearch = document.getElementById("teamSearch");
  const matchList = document.getElementById("matchList");
  const matchCount = document.getElementById("matchCount");
  const dataNotice = document.getElementById("dataNotice");

  const leagueCards = document.querySelectorAll(".league-card");

  // 경기 상태 표시용 변환
  function getStatusLabel(status) {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (["완료", "finished", "ft", "complete", "completed"].includes(value)) {
      return "완료";
    }

    if (
      ["예정", "scheduled", "upcoming", "ns", "not started"].includes(value)
    ) {
      return "예정";
    }

    return status || "확인 필요";
  }

  // 경기 날짜 표시
  function formatMatchDate(dateValue) {
    if (!dateValue) return "날짜 미정";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function hasMatchScore(match) {
    return (
      match.home_score !== "" &&
      match.away_score !== "" &&
      match.home_score !== null &&
      match.away_score !== null &&
      match.home_score !== undefined &&
      match.away_score !== undefined
    );
  }

  // 경기 목록 화면 출력
  function renderMatches(matches) {
    matchList.innerHTML = "";

    matchCount.textContent = `${matches.length}경기`;

    if (matches.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "loading-message";
      emptyMessage.textContent =
        matchData.length === 0
          ? dataStatus
          : "검색 조건에 해당하는 경기가 없습니다.";

      matchList.appendChild(emptyMessage);
      return;
    }

    const sortedMatches = matches.slice().sort((a, b) => {
      const aHasScore = hasMatchScore(a);
      const bHasScore = hasMatchScore(b);

      if (aHasScore !== bHasScore) return aHasScore ? -1 : 1;

      const dateOrder = String(a.match_date || "").localeCompare(
        String(b.match_date || ""),
      );
      if (dateOrder !== 0) return aHasScore ? -dateOrder : dateOrder;

      return String(a.match_time || "").localeCompare(
        String(b.match_time || ""),
      );
    });

    let previousGroup = "";

    sortedMatches.forEach((match) => {
      const hasScore = hasMatchScore(match);
      const dateKey = String(match.match_date || "");
      const groupKey = (hasScore ? "result|" : "fixture|") + dateKey;

      if (groupKey !== previousGroup) {
        const dateHeading = document.createElement("h3");
        dateHeading.className = "match-date-heading";
        dateHeading.textContent =
          (hasScore ? "경기 결과 · " : "예정 경기 · ") +
          formatMatchDate(dateKey);
        matchList.appendChild(dateHeading);
        previousGroup = groupKey;
      }

      const status = getStatusLabel(match.status);
      const card = document.createElement("article");
      card.className = "match-card";

      const header = document.createElement("div");
      header.className = "match-card-header";

      const league = document.createElement("span");
      league.className = "match-league";
      league.textContent = match.league || "리그 정보 없음";

      const badge = document.createElement("span");
      badge.className = `match-status ${status === "완료" ? "finished" : "upcoming"}`;
      badge.textContent = status;

      header.append(league, badge);

      const date = document.createElement("p");
      date.className = "match-date";
      date.textContent = `${formatMatchDate(match.match_date)} ${match.match_time || ""}`;

      const teams = document.createElement("div");
      teams.className = "match-teams";

      const home = document.createElement("strong");
      home.className = "team-name";
      home.textContent = match.home_team || "홈팀";

      const score = document.createElement("strong");
      score.className = "match-score";

      score.textContent = hasScore
        ? `${match.home_score} : ${match.away_score}`
        : "VS";

      const away = document.createElement("strong");
      away.className = "team-name";
      away.textContent = match.away_team || "원정팀";

      teams.append(home, score, away);
      card.append(header, date, teams);
      matchList.appendChild(card);
    });
  }

  // 검색 및 필터 적용
  function filterMatches() {
    const selectedLeague = leagueFilter.value;
    const selectedStatus = statusFilter.value;
    const keyword = teamSearch.value.trim().toLowerCase();

    const filteredMatches = matchData.filter((match) => {
      const leagueMatch =
        selectedLeague === "all" || match.league === selectedLeague;

      const statusMatch =
        selectedStatus === "all" ||
        getStatusLabel(match.status) === selectedStatus;

      const teamText =
        `${match.home_team || ""} ${match.away_team || ""}`.toLowerCase();

      const keywordMatch = teamText.includes(keyword);

      return leagueMatch && statusMatch && keywordMatch;
    });

    renderMatches(filteredMatches);
  }

  function setDataStatus(message) {
    dataStatus = message;
    dataNotice.textContent = message;
  }

  function loadMatchData() {
    const endpoint = APPS_SCRIPT_WEB_APP_URL.trim();

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec\/?(?:\?.*)?$/.test(endpoint)) {
      setDataStatus(
        "Apps Script 웹 앱의 /exec URL을 script.js에 설정해야 경기 결과가 표시됩니다.",
      );
      renderMatches([]);
      return;
    }

    const callbackName = "globalFootballMatches_" + Date.now();
    const requestScript = document.createElement("script");
    let completed = false;

    function cleanup() {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      if (requestScript.parentNode) {
        requestScript.parentNode.removeChild(requestScript);
      }
    }

    function fail(error) {
      if (completed) return;
      completed = true;
      cleanup();
      const message = "경기 데이터를 불러오지 못했습니다: " + error.message;
      setDataStatus(message);
      renderMatches([]);
      console.error(message, error);
    }

    const timeoutId = window.setTimeout(() => {
      fail(new Error("요청 시간이 초과되었습니다."));
    }, 15000);

    window[callbackName] = (response) => {
      if (
        !response ||
        response.success !== true ||
        !Array.isArray(response.data)
      ) {
        fail(
          new Error(
            response && response.message
              ? response.message
              : "Apps Script 응답 형식이 올바르지 않습니다.",
          ),
        );
        return;
      }

      completed = true;
      cleanup();
      matchData = response.data;
      const latestResultDate = matchData
        .filter(hasMatchScore)
        .map((match) => String(match.match_date || ""))
        .filter(Boolean)
        .sort()
        .pop();
      setDataStatus(
        matchData.length === 0
          ? "경기정보 시트에 표시할 데이터가 없습니다."
          : matchData.length +
              "경기를 불러왔습니다. 최근 결과 기준일: " +
              (latestResultDate
                ? formatMatchDate(latestResultDate)
                : "완료된 결과 없음"),
      );
      filterMatches();
    };

    requestScript.onerror = () => {
      fail(new Error("웹 앱 URL 또는 배포 권한을 확인해주세요."));
    };

    const separator = endpoint.indexOf("?") === -1 ? "?" : "&";
    requestScript.src =
      endpoint + separator + "callback=" + encodeURIComponent(callbackName);
    document.head.appendChild(requestScript);
  }

  // 리그 카드 선택
  leagueCards.forEach((card) => {
    card.addEventListener("click", () => {
      const selectedLeague = card.dataset.league;

      leagueCards.forEach((item) => {
        item.classList.remove("active");
      });

      card.classList.add("active");
      leagueFilter.value = selectedLeague;

      filterMatches();

      document.getElementById("matches").scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // 필터 이벤트
  leagueFilter.addEventListener("change", () => {
    const selectedLeague = leagueFilter.value;

    leagueCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.league === selectedLeague);
    });

    filterMatches();
  });

  statusFilter.addEventListener("change", filterMatches);
  teamSearch.addEventListener("input", filterMatches);

  // 이메일 발송 연결 전 안내
  const emailForm = document.getElementById("emailForm");
  const emailMessage = document.getElementById("emailMessage");

  emailForm.addEventListener("submit", (event) => {
    event.preventDefault();

    emailMessage.textContent =
      "이메일 발송 기능은 아직 연결되지 않았습니다. 다음 단계에서 연동할 예정입니다.";
  });

  // 최초 화면 표시
  renderMatches(matchData);
  loadMatchData();
}
