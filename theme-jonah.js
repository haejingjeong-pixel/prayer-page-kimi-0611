(function () {
  "use strict";

  var JONAH = {
    label: "요나의 고래뱃속",
    background: "assets/back_jonah.webp",
    altar: "assets/b_jonah.webp",
    color: "#010d12",
    position: "center 52%",
    waitingFilter: "brightness(0.72) saturate(0.76) contrast(0.94) drop-shadow(0 24px 44px rgba(0, 12, 18, 0.68))",
    prayingFilter: "brightness(1.08) saturate(1.02) drop-shadow(0 0 20px rgba(40, 220, 220, 0.24))"
  };
  var BASE_LABELS = ["사막의 제단", "겟세마네 동산", "어두운 밤", "여름 녹음"];
  var active = false;
  var injectScheduled = false;

  function text(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function isPrayerActive() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      return text(button).indexOf("기도 중...") !== -1;
    });
  }

  function findBackgroundNode() {
    return Array.from(document.querySelectorAll("#root div")).find(function (node) {
      var style = node.style || {};
      return style.backgroundImage && style.backgroundSize === "cover";
    }) || null;
  }

  function ensureLayer() {
    if (document.getElementById("jonah-theme-soft-layer")) return;
    var layer = document.createElement("div");
    layer.id = "jonah-theme-soft-layer";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 20; i += 1) {
      var particle = document.createElement("span");
      particle.className = "jonah-floating-particle";
      particle.style.setProperty("--x", (10 + Math.random() * 80).toFixed(2) + "%");
      particle.style.setProperty("--y", (16 + Math.random() * 70).toFixed(2) + "%");
      particle.style.setProperty("--size", (1.5 + Math.random() * 2.4).toFixed(2) + "px");
      particle.style.setProperty("--duration", (11 + Math.random() * 10).toFixed(2) + "s");
      particle.style.setProperty("--delay", (-Math.random() * 14).toFixed(2) + "s");
      layer.appendChild(particle);
    }
    [
      { x: "50%", y: "55%", w: "170px", h: "30px", r: "-3deg", sx: "1.05", o: "0.15", dx: "-8px", dy: "2px", dr: "1deg", d: "10.5s", delay: "-2s" },
      { x: "50%", y: "60%", w: "250px", h: "42px", r: "2deg", sx: "1.15", o: "0.20", dx: "10px", dy: "4px", dr: "-2deg", d: "12.5s", delay: "-6s" },
      { x: "50%", y: "66%", w: "360px", h: "58px", r: "-5deg", sx: "1.22", o: "0.22", dx: "-14px", dy: "8px", dr: "3deg", d: "14s", delay: "-9s" },
      { x: "50%", y: "73%", w: "500px", h: "82px", r: "4deg", sx: "1.32", o: "0.18", dx: "18px", dy: "10px", dr: "-3deg", d: "15.5s", delay: "-4s" }
    ].forEach(function (config) {
      var ripple = document.createElement("span");
      ripple.className = "jonah-water-ripple";
      ripple.style.setProperty("--x", config.x);
      ripple.style.setProperty("--y", config.y);
      ripple.style.setProperty("--w", config.w);
      ripple.style.setProperty("--h", config.h);
      ripple.style.setProperty("--r", config.r);
      ripple.style.setProperty("--sx", config.sx);
      ripple.style.setProperty("--o", config.o);
      ripple.style.setProperty("--dx", config.dx);
      ripple.style.setProperty("--dy", config.dy);
      ripple.style.setProperty("--dr", config.dr);
      ripple.style.setProperty("--duration", config.d);
      ripple.style.setProperty("--delay", config.delay);
      layer.appendChild(ripple);
    });
    document.body.insertBefore(layer, document.getElementById("root"));
  }

  function updateBottomLabel() {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (node.childElementCount) return;
      if (/^(사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(text(node))) {
        if (node.textContent !== JONAH.label) node.textContent = JONAH.label;
      }
    });
  }

  function applyJonah() {
    if (!active) return;
    ensureLayer();
    document.body.dataset.extraTheme = "jonah";
    document.body.style.backgroundColor = JONAH.color;

    var background = findBackgroundNode();
    if (background) {
      background.style.backgroundImage = 'url("' + JONAH.background + '")';
      background.style.backgroundPosition = JONAH.position;
      background.style.backgroundColor = JONAH.color;
      background.style.opacity = "1";
    }

    var prayerActive = isPrayerActive();
    var altar = document.querySelector('img[alt="altar"]');
    if (altar) {
      var reloadSrc = JONAH.altar + "?reload=" + Date.now();
      if (altar.getAttribute("src") !== reloadSrc) altar.setAttribute("src", reloadSrc);
      altar.style.removeProperty("transform");
      altar.style.filter = prayerActive ? JONAH.prayingFilter : JONAH.waitingFilter;
    }

    updateBottomLabel();
    Array.from(document.querySelectorAll("button[data-jonah-theme]")).forEach(function (button) {
      button.classList.toggle("jonah-theme-active", active);
    });
  }

  function clearJonah() {
    active = false;
    if (document.body.dataset.extraTheme === "jonah") {
      document.body.removeAttribute("data-extra-theme");
      document.body.style.backgroundColor = "";
    }
    var background = document.querySelector("#root > div");
    if (background && background.style.backgroundImage && background.style.backgroundImage.indexOf("back_jonah") !== -1) {
      background.style.removeProperty("background-image");
      background.style.removeProperty("background-position");
      background.style.removeProperty("background-color");
      background.style.removeProperty("background-size");
      background.style.removeProperty("background-repeat");
      background.style.removeProperty("background-attachment");
      background.style.removeProperty("opacity");
    }
    Array.from(document.querySelectorAll("button[data-jonah-theme]")).forEach(function (button) {
      button.classList.remove("jonah-theme-active");
    });
  }

  function start() {
    ensureLayer();
    if (window.location.search.indexOf("jonah") !== -1) {
      [160, 700, 1400, 2600].forEach(function (delay) {
        window.setTimeout(function () {
          active = true;
          applyJonah();
        }, delay);
      });
    }
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = text(button);
      if (BASE_LABELS.some(function (baseLabel) { return label.indexOf(baseLabel) !== -1; })) {
        clearJonah();
      }
    }, true);
    document.addEventListener("codex-extra-theme-change", function (event) {
      if (!event.detail) return;
      if (event.detail.theme === "jonah") {
        active = true;
        applyJonah();
      } else {
        clearJonah();
      }
    });
    new MutationObserver(function () {
      if (active) applyJonah();
    }).observe(document.getElementById("root"), { childList: true, subtree: true });
    window.setInterval(function () {
      if (active) applyJonah();
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
