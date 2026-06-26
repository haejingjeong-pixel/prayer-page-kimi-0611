(function () {
  "use strict";

  var GOLBANG_LABEL = "은밀한 골방";
  var GOLBANG_THEME = "golbang";
  var BOOT_CLASS = "golbang-boot";
  var themeLabels = [
    "사막의 제단",
    "겟세마네 동산",
    "어두운 밤",
    "여름 녹음",
    "마가 다락방",
    "요나의 고래뱃속",
    "모세의 시내산",
    GOLBANG_LABEL
  ];
  var themeClasses = [
    "codex-theme-desert",
    "codex-theme-gethsemane",
    "codex-theme-night",
    "codex-theme-summer",
    "codex-theme-mark",
    "codex-theme-jonah",
    "codex-theme-sinal"
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function injectStyle() {
    if (document.getElementById("golbang-hotfix-style")) return;
    var style = document.createElement("style");
    style.id = "golbang-hotfix-style";
    style.textContent = [
      "body[data-theme='golbang'], body[data-current-theme='은밀한 골방'] { background-color: #d6b99c !important; }",
      "body[data-theme='golbang'] #golbang-theme-layer, body[data-current-theme='은밀한 골방'] #golbang-theme-layer { display: block !important; opacity: 1 !important; background-image: url('assets/back_golbang_new.webp') !important; background-position: center 21% !important; background-size: auto 130% !important; background-repeat: no-repeat !important; background-color: #d6b99c !important; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function forceGolbangBodyState() {
    themeClasses.forEach(function (className) {
      document.body.classList.remove(className);
      document.documentElement.classList.remove(className);
    });
    document.body.classList.add("codex-theme-golbang");
    document.documentElement.classList.add("codex-theme-golbang");
    document.body.dataset.theme = GOLBANG_THEME;
    document.body.dataset.currentTheme = GOLBANG_LABEL;
    document.body.style.backgroundColor = "#d6b99c";
  }

  function text(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function forceGolbangLabels() {
    var root = document.getElementById("root");
    if (!root) return;
    Array.from(root.querySelectorAll("span, div, p")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (node.childElementCount) return;
      if (themeLabels.indexOf(text(node)) !== -1 && text(node) !== GOLBANG_LABEL) {
        node.textContent = GOLBANG_LABEL;
      }
    });
  }

  function forceGolbangBackground() {
    var layer = document.getElementById("golbang-theme-layer");
    if (!layer) return;
    layer.style.setProperty("display", "block", "important");
    layer.style.setProperty("opacity", "1", "important");
    layer.style.setProperty("background-image", "url('assets/back_golbang_new.webp')", "important");
    layer.style.setProperty("background-position", "center 21%", "important");
    layer.style.setProperty("background-size", "auto 130%", "important");
    layer.style.setProperty("background-repeat", "no-repeat", "important");
    layer.style.setProperty("background-color", "#d6b99c", "important");
  }

  function markAltarStage() {
    var altar = document.querySelector("img[alt='altar']");
    if (!altar) return;
    var node = altar.parentElement;
    while (node && node.id !== "root") {
      var className = typeof node.className === "string" ? node.className : "";
      if (className.indexOf("left-1/2") !== -1 && className.indexOf("z-10") !== -1) {
        node.classList.add("codex-altar-stage");
        return;
      }
      node = node.parentElement;
    }
  }

  function forceGolbangAltar() {
    markAltarStage();
    var altar = document.querySelector("img[alt='altar']");
    if (!altar) return;
    var src = (altar.getAttribute("src") || "").split("?")[0];
    if (src !== "assets/b_golbang9.webp") altar.setAttribute("src", "assets/b_golbang9.webp");
  }

  function isGolbangThemeActive() {
    if (!document.body) return false;
    var theme = document.body.dataset && document.body.dataset.theme;
    var currentTheme = document.body.dataset && document.body.dataset.currentTheme;
    return !theme || theme === GOLBANG_THEME || currentTheme === GOLBANG_LABEL ||
      document.body.classList.contains("codex-theme-golbang");
  }

  function showStartHint() {
    removeStartHint();
  }

  function syncGolbang() {
    if (!isGolbangThemeActive()) return;
    injectStyle();
    forceGolbangBodyState();
    forceGolbangBackground();
    forceGolbangLabels();
    forceGolbangAltar();
  }

  ready(function () {
    injectStyle();
    document.body.classList.add(BOOT_CLASS);
    syncGolbang();
    showStartHint();

    [0, 80, 260, 620, 1200, 2200].forEach(function (delay) {
      window.setTimeout(syncGolbang, delay);
    });
    window.setTimeout(function () {
      document.body.classList.remove(BOOT_CLASS);
    }, 950);

    var root = document.getElementById("root");
    if (root) {
      new MutationObserver(function () {
        syncGolbang();
      }).observe(root, { childList: true, subtree: true, characterData: true });
    }
  });
})();
