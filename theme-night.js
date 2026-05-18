(function () {
  "use strict";

  var NIGHT_BG = "#000114";
  var ACTIVE_CLASS = "night-theme-active";
  var PRAYER_CLASS = "night-prayer-active";
  var ALTAR_MIN = "620px";
  var ALTAR_MAX = "860px";
  var ALTAR_ASPECT = "2084 / 718";
  var NIGHT_BACKGROUND = "assets/back_night.webp";
  var NIGHT_ALTAR = "assets/b_night.webp";

  function isNightBackgroundUrl(value) {
    return (value || "").indexOf("back_night") !== -1;
  }

  function isNightAltar(node) {
    return ((node && node.getAttribute("src")) || "").indexOf("b_night") !== -1;
  }

  function isNightActive() {
    if (document.body.classList.contains(ACTIVE_CLASS)) return true;
    if (document.body.classList.contains("codex-theme-night")) return true;
    if (document.body.dataset.currentTheme === "어두운 밤") return true;
    if (document.querySelector('#root div[style*="back_night"]')) return true;
    return false;
  }

  function findBackgroundNode() {
    return Array.from(document.querySelectorAll("#root div")).find(function (node) {
      return isNightBackgroundUrl((node.style && node.style.backgroundImage) || "");
    }) || null;
  }

  function isNightPraying() {
    if (document.querySelector(".night-praying-depth, .night-sacred-glow")) return true;
    return Array.from(document.querySelectorAll("#root button, #root span")).some(function (node) {
      return ((node && node.textContent) || "").replace(/\s+/g, " ").trim() === "기도 중...";
    });
  }

  function stabilizeAltar(altar) {
    if (!altar) return;
    if (!isNightAltar(altar)) {
      altar.setAttribute("src", NIGHT_ALTAR);
    }
    setStyle(altar, "display", "block");
    setStyle(altar, "opacity", "1");
    setStyle(altar, "visibility", "visible");
    setStyle(altar, "position", "relative");
    setStyle(altar, "zIndex", "100");
    setStyle(altar, "width", "100%");
    setStyle(altar, "minWidth", ALTAR_MIN);
    setStyle(altar, "maxWidth", ALTAR_MAX);
    setStyle(altar, "height", "auto");
    setStyle(altar, "aspectRatio", ALTAR_ASPECT);
    setStyle(altar, "objectFit", "contain");
    setStyle(altar, "objectPosition", "center bottom");
    setStyle(altar, "background", "transparent");
    altar.style.removeProperty("-webkit-mask-image");
    altar.style.removeProperty("mask-image");
    altar.style.removeProperty("max-height");
  }

  function setStyle(node, property, value) {
    if (node.style[property] !== value) node.style[property] = value;
  }

  function stabilizeStage() {
    Array.from(document.querySelectorAll('div[class*="left-1/2"][class*="z-10"]')).forEach(function (node) {
      if (!node.querySelector('img[alt="altar"]')) return;
      setStyle(node, "width", "clamp(" + ALTAR_MIN + ", 85vw, " + ALTAR_MAX + ")");
      setStyle(node, "minWidth", ALTAR_MIN);
      setStyle(node, "maxWidth", ALTAR_MAX);
      setStyle(node, "overflow", "visible");
      setStyle(node, "zIndex", "30");
    });
  }

  function setNightMode(on) {
    document.documentElement.classList.toggle(ACTIVE_CLASS, on);
    document.body.classList.toggle(ACTIVE_CLASS, on);
    if (!on) {
      document.documentElement.classList.remove(PRAYER_CLASS);
      document.body.classList.remove(PRAYER_CLASS);
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
      return;
    }
    document.documentElement.style.backgroundColor = NIGHT_BG;
    document.body.style.backgroundColor = NIGHT_BG;
  }

  function applyNightVisuals() {
    var on = isNightActive();
    setNightMode(on);
    if (!on) return;
    document.documentElement.classList.toggle(PRAYER_CLASS, isNightPraying());
    document.body.classList.toggle(PRAYER_CLASS, isNightPraying());

    var rootShell = document.querySelector("#root > div");
    if (rootShell) rootShell.style.backgroundColor = NIGHT_BG;

    var background = findBackgroundNode();
    if (background) {
      if (!isNightBackgroundUrl(background.style.backgroundImage)) {
        background.style.backgroundImage = 'url("' + NIGHT_BACKGROUND + '")';
      }
      setStyle(background, "backgroundColor", NIGHT_BG);
      setStyle(background, "backgroundSize", "cover");
      setStyle(background, "backgroundPosition", "center center");
      setStyle(background, "backgroundRepeat", "no-repeat");
    }

    var front = document.querySelector(".night-front-gradient");
    if (front) front.style.display = "none";

    stabilizeStage();
    Array.from(document.querySelectorAll('img[alt="altar"]')).forEach(stabilizeAltar);
  }

  function start() {
    var scheduled = 0;
    function scheduleApply() {
      if (scheduled) return;
      scheduled = window.setTimeout(function () {
        scheduled = 0;
        applyNightVisuals();
      }, 80);
    }

    [0, 300, 1000].forEach(function (delay) {
      window.setTimeout(applyNightVisuals, delay);
    });

    document.addEventListener("click", function () {
      [0, 80, 260, 700].forEach(function (delay) {
        window.setTimeout(applyNightVisuals, delay);
      });
    }, true);

    var root = document.getElementById("root");
    if (root) {
      new MutationObserver(function () {
        scheduleApply();
      }).observe(root, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    new MutationObserver(function () {
      scheduleApply();
    }).observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-current-theme"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
