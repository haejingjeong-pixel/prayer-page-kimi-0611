(function () {
  "use strict";

  var SUPABASE_URL = "https://qspmqsxsxiftejrvkcna.supabase.co";
  var SUPABASE_KEY = "sb_publishable_sUVoa_VaEAXOXhxJmNo6RA_1lFY3fb3";
  var TABLE = "prayer_events";
  var THEME_LABELS = {
    golbang: "은밀한 골방",
    desert: "사막의 제단",
    sinal: "모세의 시내산",
    mark: "마가 다락방",
    summer: "여름 녹음",
    jonah: "요나의 고래뱃속",
    night: "어두운 밤",
    gethsemane: "겟세마네 동산"
  };

  function headers(extra) {
    return Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json"
    }, extra || {});
  }

  function getWeekStart() {
    var date = new Date();
    var day = date.getDay();
    var diff = day === 0 ? 6 : day - 1;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - diff);
    return date;
  }

  function getTodayStart() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function parseContentRange(value) {
    var match = String(value || "").match(/\/(\d+)$/);
    return match ? Number(match[1]) || 0 : 0;
  }

  function countSince(startDate) {
    var url = SUPABASE_URL + "/rest/v1/" + TABLE +
      "?select=id&event_type=eq.prayer&created_at=gte." + encodeURIComponent(startDate.toISOString());
    return fetch(url, {
      headers: headers({ Prefer: "count=exact", Range: "0-0" })
    }).then(function (response) {
      if (!response.ok) throw new Error("count failed: " + response.status);
      return parseContentRange(response.headers.get("content-range"));
    });
  }

  function fetchThemeStats(startDate) {
    var url = SUPABASE_URL + "/rest/v1/" + TABLE +
      "?select=theme&event_type=eq.prayer&created_at=gte." + encodeURIComponent(startDate.toISOString()) + "&limit=10000";
    return fetch(url, { headers: headers() })
      .then(function (response) {
        if (response.status === 400) return null;
        if (!response.ok) throw new Error("theme stats failed: " + response.status);
        return response.json();
      })
      .then(function (rows) {
        if (!rows) return null;
        return rows.reduce(function (stats, row) {
          var theme = row && row.theme || "unknown";
          stats[theme] = (stats[theme] || 0) + 1;
          return stats;
        }, {});
      });
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = Number(value || 0).toLocaleString();
  }

  function renderThemes(stats) {
    var container = document.querySelector("[data-theme-stats]");
    var notice = document.querySelector("[data-stats-notice]");
    if (!container) return;

    if (!stats) {
      container.innerHTML = '<div class="theme-row"><span>테마별 통계</span><b>컬럼 필요</b></div>';
      if (notice) notice.textContent = "현재 prayer_events 테이블에 theme 컬럼이 없어 테마별 통계는 표시할 수 없습니다.";
      return;
    }

    container.innerHTML = Object.keys(THEME_LABELS).map(function (theme) {
      return '<div class="theme-row"><span>' + THEME_LABELS[theme] + '</span><b>' +
        Number(stats[theme] || 0).toLocaleString() + '</b></div>';
    }).join("");
    if (notice) notice.textContent = "Supabase public.prayer_events 기준입니다.";
  }

  function loadStats() {
    Promise.all([
      countSince(getWeekStart()),
      countSince(getTodayStart()),
      fetchThemeStats(getWeekStart())
    ]).then(function (values) {
      setText("[data-weekly-count]", values[0]);
      setText("[data-today-count]", values[1]);
      renderThemes(values[2]);
    }).catch(function (error) {
      console.warn("[codex-supabase] Failed to load stats page", error);
      var notice = document.querySelector("[data-stats-notice]");
      if (notice) notice.textContent = "통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadStats, { once: true });
  } else {
    loadStats();
  }
})();
