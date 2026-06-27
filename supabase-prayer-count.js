(function () {
  "use strict";

  var SUPABASE_URL = "https://qspmqxsxsiftejrvkcna.supabase.co";
  var SUPABASE_KEY = "sb_publishable_sUVoa_VaEAXOXhxJmNo6RA_1lFY3fb3";
  var TABLE = "prayer_events";
  var STORAGE_KEY = "altar_prayer_counted_this_session";

  function getWeekStartISO() {
    var now = new Date();
    var day = now.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    var monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }

  function request(path, options) {
    return fetch(SUPABASE_URL + path, Object.assign({
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }
    }, options || {}));
  }

  function updateCountText(count) {
    var nodes = Array.from(document.querySelectorAll("p, span, div"));

    var target = nodes.find(function (el) {
      var text = String(el.textContent || "").replace(/\s+/g, " ").trim();
      return text.indexOf("이번주") !== -1 &&
        text.indexOf("기도") !== -1 &&
        text.length < 80 &&
        el.children.length === 0;
    });

    if (!target) return;

    target.textContent = "이번주 " + count + "개의 기도가 올려졌습니다";
  }

  function fetchWeeklyCount() {
    var weekStart = getWeekStartISO();
    var path = "/rest/v1/" + TABLE +
      "?select=id&created_at=gte." + encodeURIComponent(weekStart);

    return fetch(SUPABASE_URL + path, {
      method: "HEAD",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Range": "0-0",
        "Prefer": "count=exact"
      }
    }).then(function (res) {
      var range = res.headers.get("content-range") || "";
      var match = range.match(/\/(\d+)$/);
      var count = match ? Number(match[1]) : 0;
      updateCountText(count);
      return count;
    }).catch(function () {
      return 0;
    });
  }

  function insertPrayerEvent() {
    return request("/rest/v1/" + TABLE, {
      method: "POST",
      body: JSON.stringify({
        event_type: "prayer"
      })
    }).then(function () {
      return fetchWeeklyCount();
    });
  }

  function isPrayerButton(button) {
    if (!button) return false;
    var text = String(button.textContent || "").replace(/\s+/g, " ").trim();
    return text === "기도하기" ||
      text === "기도 중..." ||
      text.indexOf("기도문 작성하기") !== -1;
  }

  function handleClick(event) {
    var button = event.target && event.target.closest
      ? event.target.closest("button")
      : null;

    if (!isPrayerButton(button)) return;

    var today = new Date().toISOString().slice(0, 10);
    var saved = sessionStorage.getItem(STORAGE_KEY);

    if (saved === today) {
      fetchWeeklyCount();
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, today);
    insertPrayerEvent();
  }

  function start() {
    fetchWeeklyCount();

    document.addEventListener("click", handleClick, true);
    document.addEventListener("touchend", handleClick, true);

    [500, 1500, 3000].forEach(function (delay) {
      window.setTimeout(fetchWeeklyCount, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
