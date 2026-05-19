(function () {
  "use strict";

  var MARK = {
    label: "마가 다락방",
    background: "assets/back_mark.webp",
    altar: "assets/b_mark.webp",
    color: "#3e2b21",
    position: "center 52%",
    waitingFilter: "brightness(1.02) saturate(1.02) drop-shadow(0 18px 34px rgba(55, 30, 18, 0.34))",
    prayingFilter: "brightness(1.12) saturate(1.06) drop-shadow(0 0 22px rgba(255, 190, 105, 0.28))"
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
    if (document.getElementById("mark-theme-soft-layer")) return;
    var layer = document.createElement("div");
    layer.id = "mark-theme-soft-layer";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 18; i += 1) {
      var dust = document.createElement("span");
      dust.className = "mark-gold-dust";
      dust.style.setProperty("--x", (12 + Math.random() * 76).toFixed(2) + "%");
      dust.style.setProperty("--y", (18 + Math.random() * 60).toFixed(2) + "%");
      dust.style.setProperty("--size", (1.4 + Math.random() * 1.8).toFixed(2) + "px");
      dust.style.setProperty("--duration", (9 + Math.random() * 7).toFixed(2) + "s");
      dust.style.setProperty("--delay", (-Math.random() * 10).toFixed(2) + "s");
      layer.appendChild(dust);
    }
    document.body.insertBefore(layer, document.getElementById("root"));
  }

  function updateBottomLabel() {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (node.childElementCount) return;
      if (/^(사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(text(node))) {
        if (node.textContent !== MARK.label) node.textContent = MARK.label;
      }
    });
  }

  function applyMark() {
    if (!active) return;
    ensureLayer();
    document.body.dataset.extraTheme = "mark";
    document.body.style.backgroundColor = MARK.color;

    var background = findBackgroundNode();
    if (background) {
      background.style.backgroundImage = 'url("' + MARK.background + '")';
      background.style.backgroundPosition = MARK.position;
      background.style.backgroundColor = MARK.color;
      background.style.opacity = "1";
    }

    var prayerActive = isPrayerActive();
    var altar = document.querySelector('img[alt="altar"]');
    if (altar) {
      var reloadSrc = MARK.altar + "?reload=" + Date.now();
      if (altar.getAttribute("src") !== reloadSrc) altar.setAttribute("src", reloadSrc);
      altar.style.removeProperty("transform");
      altar.style.filter = prayerActive ? MARK.prayingFilter : MARK.waitingFilter;
    }

    updateBottomLabel();
    Array.from(document.querySelectorAll("button[data-mark-theme]")).forEach(function (button) {
      button.classList.toggle("mark-theme-active", active);
    });
  }

  function clearMark() {
    active = false;
    document.body.removeAttribute("data-extra-theme");
    document.body.style.backgroundColor = "";
    var background = document.querySelector("#root > div");
    if (background && background.style.backgroundImage && background.style.backgroundImage.indexOf("back_mark") !== -1) {
      background.style.removeProperty("background-image");
      background.style.removeProperty("background-position");
      background.style.removeProperty("background-color");
      background.style.removeProperty("background-size");
      background.style.removeProperty("background-repeat");
      background.style.removeProperty("opacity");
    }
    Array.from(document.querySelectorAll("button[data-mark-theme]")).forEach(function (button) {
      button.classList.remove("mark-theme-active");
    });
  }

  function start() {
    ensureLayer();
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = text(button);
      if (BASE_LABELS.some(function (baseLabel) { return label.indexOf(baseLabel) !== -1; })) {
        clearMark();
      }
    }, true);
    document.addEventListener("codex-extra-theme-change", function (event) {
      if (!event.detail) return;
      if (event.detail.theme === "mark") {
        active = true;
        applyMark();
      } else {
        clearMark();
      }
    });
    new MutationObserver(function () {
      if (active) applyMark();
    }).observe(document.getElementById("root"), { childList: true, subtree: true });
    window.setInterval(function () {
      if (active) applyMark();
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
