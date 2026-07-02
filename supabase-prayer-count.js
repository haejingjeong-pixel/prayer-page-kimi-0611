(function () {
  "use strict";

  var SUPABASE_URL = "https://qspmqsxsxiftejrvkcna.supabase.co";
  var SUPABASE_KEY = "sb_publishable_sUVoa_VaEAXOXhxJmNo6RA_1lFY3fb3";
  var TABLE = "prayer_events";
  var supportsThemeColumn = null;
  var latestStats = { weekly: 0, today: 0, byTheme: {} };
  var prayerActive = false;

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
  var LABEL_TO_THEME = {};

  Object.keys(THEME_LABELS).forEach(function (theme) {
    LABEL_TO_THEME[THEME_LABELS[theme]] = theme;
  });

  function supabaseHeaders(extra) {
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
      method: "GET",
      headers: supabaseHeaders({ Prefer: "count=exact", Range: "0-0" })
    }).then(function (response) {
      if (!response.ok) throw new Error("Supabase count failed: " + response.status);
      return parseContentRange(response.headers.get("content-range"));
    });
  }

  function fetchThemeStats(startDate) {
    if (supportsThemeColumn === false) {
      return Promise.resolve({});
    }

    var url = SUPABASE_URL + "/rest/v1/" + TABLE +
      "?select=theme&event_type=eq.prayer&created_at=gte." + encodeURIComponent(startDate.toISOString()) + "&limit=10000";

    return fetch(url, { headers: supabaseHeaders() })
      .then(function (response) {
        if (response.status === 400) {
          supportsThemeColumn = false;
          console.warn("[codex-supabase] prayer_events.theme column is not available; theme stats are skipped.");
          return [];
        }
        if (!response.ok) throw new Error("Supabase theme stats failed: " + response.status);
        supportsThemeColumn = true;
        return response.json();
      })
      .then(function (rows) {
        return rows.reduce(function (stats, row) {
          var theme = row && row.theme || "unknown";
          stats[theme] = (stats[theme] || 0) + 1;
          return stats;
        }, {});
      });
  }

  function getCurrentTheme() {
    var body = document.body;
    if (!body) return "golbang";

    var theme = body.dataset && body.dataset.theme;
    if (theme && THEME_LABELS[theme]) return theme;

    var label = (body.dataset && body.dataset.currentTheme || "").replace(/\s+/g, " ").trim();
    if (LABEL_TO_THEME[label]) return LABEL_TO_THEME[label];

    var className = String(body.className || "");
    return Object.keys(THEME_LABELS).find(function (key) {
      return className.indexOf("codex-theme-" + key) !== -1;
    }) || "golbang";
  }

  function getWeeklyTextNodes() {
    return Array.from(document.querySelectorAll(".codex-weekly-text, span")).filter(function (node) {
      return /이번주\s*[\d,]+명이\s*기도를\s*상달하였습니다/.test(node.textContent || "");
    });
  }

  function updateWeeklyText(count) {
    getWeeklyTextNodes().forEach(function (node) {
      node.textContent = "이번주 " + Number(count || 0).toLocaleString() + "명이 기도를 상달하였습니다";
    });
  }

  function refreshStats() {
    return Promise.all([
      countSince(getWeekStart()),
      countSince(getTodayStart()),
      fetchThemeStats(getWeekStart())
    ]).then(function (values) {
      latestStats.weekly = values[0];
      latestStats.today = values[1];
      latestStats.byTheme = values[2] || {};
      updateWeeklyText(latestStats.weekly);
      renderStatsPanel();
    }).catch(function (error) {
      console.warn("[codex-supabase] Failed to refresh prayer counts", error);
    });
  }

  function insertPrayerEvent() {
    var theme = getCurrentTheme();
    var createdAt = new Date().toISOString();
    var payload = supportsThemeColumn === false ? {
      event_type: "prayer",
      created_at: createdAt
    } : {
      event_type: "prayer",
      created_at: createdAt,
      theme: theme,
      theme_label: THEME_LABELS[theme] || theme
    };

    return fetch(SUPABASE_URL + "/rest/v1/" + TABLE, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (response.status === 400 && supportsThemeColumn !== false) {
        supportsThemeColumn = false;
        return fetch(SUPABASE_URL + "/rest/v1/" + TABLE, {
          method: "POST",
          headers: supabaseHeaders({ Prefer: "return=minimal" }),
          body: JSON.stringify({ event_type: "prayer", created_at: createdAt })
        });
      }
      return response;
    }).then(function (response) {
      if (!response.ok) throw new Error("Supabase insert failed: " + response.status);
      window.setTimeout(refreshStats, 1800);
      return true;
    }).catch(function (error) {
      console.warn("[codex-supabase] Failed to record prayer event", error);
      return false;
    });
  }

  function isPrayerActiveNow() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      return (button.textContent || "").replace(/\s+/g, " ").trim() === "기도 중...";
    });
  }

  function syncPrayerStateForCount() {
    var nextActive = isPrayerActiveNow();
    if (nextActive && !prayerActive) {
      insertPrayerEvent();
    }
    prayerActive = nextActive;
  }

  function observePrayerState() {
    var root = document.getElementById("root") || document.body;
    if (!root) return;

    window.setTimeout(function () {
      prayerActive = isPrayerActiveNow();
    }, 0);

    new MutationObserver(function () {
      syncPrayerStateForCount();
    }).observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function ensureStatsPanel() {
    var panel = document.getElementById("codex-prayer-stats-panel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "codex-prayer-stats-panel";
    panel.setAttribute("hidden", "");
    panel.innerHTML = [
      '<div class="codex-prayer-stats-backdrop" data-close-stats></div>',
      '<section class="codex-prayer-stats-dialog" role="dialog" aria-modal="true" aria-label="기도 통계">',
      '<button class="codex-prayer-stats-close" type="button" data-close-stats aria-label="닫기">×</button>',
      '<h2>기도 통계</h2>',
      '<div class="codex-prayer-stats-summary">',
      '<p><span>이번 주</span><strong data-weekly-count>0</strong></p>',
      '<p><span>오늘</span><strong data-today-count>0</strong></p>',
      '</div>',
      '<div class="codex-prayer-theme-stats" data-theme-stats></div>',
      '</section>'
    ].join("");
    document.body.appendChild(panel);
    return panel;
  }

  function renderStatsPanel() {
    var panel = ensureStatsPanel();
    var weekly = panel.querySelector("[data-weekly-count]");
    var today = panel.querySelector("[data-today-count]");
    var themes = panel.querySelector("[data-theme-stats]");

    if (weekly) weekly.textContent = Number(latestStats.weekly || 0).toLocaleString();
    if (today) today.textContent = Number(latestStats.today || 0).toLocaleString();
    if (!themes) return;

    if (supportsThemeColumn === false) {
      themes.innerHTML = '<p><span>테마별 통계</span><strong>컬럼 필요</strong></p>';
      return;
    }

    themes.innerHTML = Object.keys(THEME_LABELS).map(function (theme) {
      var count = latestStats.byTheme[theme] || 0;
      return '<p><span>' + THEME_LABELS[theme] + '</span><strong>' + Number(count).toLocaleString() + '</strong></p>';
    }).join("");
  }

  function openStatsPanel() {
    return false;
  }

  function openStatsPanelInPlace() {
    var panel = ensureStatsPanel();
    renderStatsPanel();
    panel.removeAttribute("hidden");
    document.body.classList.add("codex-prayer-stats-open");
    window.location.hash = "prayer-stats";
    refreshStats();
  }

  function closeStatsPanel() {
    var panel = ensureStatsPanel();
    panel.setAttribute("hidden", "");
    document.body.classList.remove("codex-prayer-stats-open");
    if (window.location.hash === "#prayer-stats") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function bindWeeklyBanner() {
    Array.from(document.querySelectorAll(".codex-weekly-banner, .codex-weekly-card")).forEach(function (node) {
      if (node.dataset.supabaseStatsBound === "true") return;
      node.dataset.supabaseStatsBound = "true";
      node.removeAttribute("role");
      node.removeAttribute("tabindex");
      node.style.cursor = "default";
      node.addEventListener("click", function (event) {
        event.preventDefault();
      });
      node.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
        }
      });
    });
  }

  function injectStyle() {
    if (document.getElementById("codex-supabase-prayer-style")) return;
    var style = document.createElement("style");
    style.id = "codex-supabase-prayer-style";
    style.textContent = [
      "#codex-prayer-stats-panel[hidden]{display:none!important}",
      "#codex-prayer-stats-panel{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:24px}",
      ".codex-prayer-stats-backdrop{position:absolute;inset:0;background:rgba(18,12,8,.58);backdrop-filter:blur(5px)}",
      ".codex-prayer-stats-dialog{position:relative;width:min(420px,calc(100vw - 36px));max-height:min(620px,calc(100vh - 72px));overflow:auto;border:1px solid rgba(255,235,190,.24);border-radius:18px;background:rgba(45,31,20,.94);box-shadow:0 24px 70px rgba(0,0,0,.38);color:#fff4d7;padding:22px 20px 20px;font-family:serif}",
      ".codex-prayer-stats-dialog h2{font-size:19px;line-height:1.35;text-align:center;margin:0 0 18px;letter-spacing:.06em}",
      ".codex-prayer-stats-close{position:absolute;right:12px;top:10px;width:32px;height:32px;border-radius:999px;background:rgba(255,255,255,.08);color:#fff4d7;font-size:22px;line-height:30px}",
      ".codex-prayer-stats-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}",
      ".codex-prayer-stats-summary p,.codex-prayer-theme-stats p{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.08)}",
      ".codex-prayer-stats-summary span,.codex-prayer-theme-stats span{font-size:13px;color:rgba(255,244,215,.72)}",
      ".codex-prayer-stats-summary strong,.codex-prayer-theme-stats strong{font-size:18px;color:#ffd982}",
      ".codex-prayer-theme-stats{display:grid;gap:8px}",
      "@media(max-width:480px){#codex-prayer-stats-panel{padding:18px}.codex-prayer-stats-dialog{border-radius:16px;padding:20px 16px 16px}.codex-prayer-stats-summary{grid-template-columns:1fr}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function handlePanelClick(event) {
    if (event.target && event.target.closest && event.target.closest("[data-close-stats]")) {
      closeStatsPanel();
    }
  }

  function init() {
    injectStyle();
    ensureStatsPanel();
    bindWeeklyBanner();
    refreshStats();

    observePrayerState();
    document.addEventListener("click", handlePanelClick);
    window.setInterval(function () {
      bindWeeklyBanner();
      updateWeeklyText(latestStats.weekly);
    }, 1000);

    if (window.location.hash === "#prayer-stats") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
