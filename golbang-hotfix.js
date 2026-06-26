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
      "body[data-theme='golbang'] #golbang-theme-layer, body[data-current-theme='은밀한 골방'] #golbang-theme-layer { display: block !important; opacity: 1 !important; background-image: url('assets/back_golbang_new.webp') !important; background-position: center 21% !important; background-size: auto 130% !important; background-repeat: no-repeat !important; background-color: #d6b99c !important; }",
      "#golbang-start-hint { position: fixed; inset: 0; z-index: 2147483646; display: flex; align-items: center; justify-content: center; pointer-events: auto; background: radial-gradient(ellipse at 50% 44%, rgba(214,185,156,0.10), rgba(46,28,16,0.18) 48%, rgba(0,0,0,0.28) 100%); opacity: 1; transition: opacity 420ms ease; }",
      "#golbang-start-hint.is-hidden { opacity: 0; pointer-events: none; }",
      "#golbang-start-hint .golbang-start-hint-card { padding: 0 24px; color: rgba(255,248,232,0.96); font-size: clamp(17px, 2.6vw, 30px); letter-spacing: 0.08em; line-height: 1.65; text-align: center; font-weight: 700; background: transparent; border: 0; box-shadow: none; text-shadow: 0 0 22px rgba(255,214,150,0.42), 0 2px 14px rgba(0,0,0,0.62); }",
      "#golbang-start-hint .golbang-start-hint-bubble { position: absolute; top: calc(76px + env(safe-area-inset-top, 0px)); max-width: min(230px, calc(50vw - 30px)); padding: 0; font-size: clamp(12px, 1.55vw, 16px); line-height: 1.55; color: rgba(255,248,232,0.9); text-align: center; font-weight: 600; letter-spacing: 0.02em; background: transparent; border: 0; box-shadow: none; text-shadow: 0 0 18px rgba(255,220,170,0.34), 0 2px 10px rgba(0,0,0,0.62); user-select: none; -webkit-user-select: none; pointer-events: none; }",
      "#golbang-start-hint .golbang-start-hint-bubble-left { left: calc(20px + env(safe-area-inset-left, 0px)); }",
      "#golbang-start-hint .golbang-start-hint-bubble-right { right: calc(20px + env(safe-area-inset-right, 0px)); }",
      "#golbang-start-hint .golbang-start-hint-bubble::after { display: block; margin-top: 8px; font-size: 22px; line-height: 1; color: rgba(255,248,232,0.72); }",
      "#golbang-start-hint .golbang-start-hint-bubble-left::after { content: '↖'; text-align: left; padding-left: 8px; }",
      "#golbang-start-hint .golbang-start-hint-bubble-right::after { content: '↗'; text-align: right; padding-right: 8px; }",
      "@media (max-width: 480px) { #golbang-start-hint .golbang-start-hint-card { font-size: clamp(16px, 5.8vw, 22px); line-height: 1.55; letter-spacing: 0.04em; padding: 0 26px; } #golbang-start-hint .golbang-start-hint-bubble { top: calc(56px + env(safe-area-inset-top, 0px)); max-width: min(158px, calc(50vw - 24px)); font-size: 11px; line-height: 1.42; } #golbang-start-hint .golbang-start-hint-bubble-left { left: calc(14px + env(safe-area-inset-left, 0px)); } #golbang-start-hint .golbang-start-hint-bubble-right { right: calc(14px + env(safe-area-inset-right, 0px)); } #golbang-start-hint .golbang-start-hint-bubble::after { margin-top: 5px; font-size: 17px; } }"
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

  var START_HINT_STORAGE_KEY = "codex-global-start-hint-v2";
  var START_HINT_LEFT_TEXT = "기도 장소 이름이 궁금하다면<br>말풍선을 눌러보세요";
  var START_HINT_RIGHT_TEXT = "기도의 몰입감을 위해<br>기도음악을 함께 들어보세요";

  function isStartHintDismissed() {
    try {
      return localStorage.getItem(START_HINT_STORAGE_KEY) === "dismissed";
    } catch (e) {
      return false;
    }
  }

  function markStartHintDismissed() {
    try {
      localStorage.setItem(START_HINT_STORAGE_KEY, "dismissed");
    } catch (e) {}
  }

  function isGolbangThemeActive() {
    if (!document.body) return false;
    var theme = document.body.dataset && document.body.dataset.theme;
    var currentTheme = document.body.dataset && document.body.dataset.currentTheme;
    return !theme || theme === GOLBANG_THEME || currentTheme === GOLBANG_LABEL ||
      document.body.classList.contains("codex-theme-golbang");
  }

  function dispatchWindowInteraction() {
    ["click", "touchstart"].forEach(function (type) {
      var event;
      try {
        event = new window.Event(type, { bubbles: true, cancelable: true });
      } catch (e) {
        event = document.createEvent("Event");
        event.initEvent(type, true, true);
      }
      window.dispatchEvent(event);
    });
  }

  function showStartHint() {
    if (document.getElementById("golbang-start-hint")) return;
    if (isStartHintDismissed()) return;

    var hint = document.createElement("div");
    hint.id = "golbang-start-hint";
    hint.setAttribute("role", "button");
    hint.setAttribute("aria-label", "기도를 올려두려면 화면을 살짝 눌러주세요");
    hint.innerHTML =
      '<div class="golbang-start-hint-bubble golbang-start-hint-bubble-left">' + START_HINT_LEFT_TEXT + "</div>" +
      '<div class="golbang-start-hint-bubble golbang-start-hint-bubble-right">' + START_HINT_RIGHT_TEXT + "</div>" +
      '<div class="golbang-start-hint-card">기도를 올려두려면<br>화면을 살짝 눌러주세요</div>';
    document.body.appendChild(hint);

    var dismissed = false;

    function dismiss(event) {
      if (dismissed) return;
      dismissed = true;
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      markStartHintDismissed();
      hint.classList.add("is-hidden");
      window.setTimeout(function () {
        if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
      }, 420);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      dispatchWindowInteraction();
    }

    function onPointerDown(event) {
      dismiss(event);
    }

    function onKeyDown(event) {
      if (event.key === "Enter" || event.key === " ") {
        dismiss(event);
      }
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.setTimeout(function () {
      if (hint && hint.parentNode && !dismissed) dismiss();
    }, 5200);
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
