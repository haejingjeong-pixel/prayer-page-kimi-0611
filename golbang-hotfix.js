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
      "#golbang-start-hint { position: fixed; inset: 0; z-index: 2147483646; display: flex; align-items: center; justify-content: center; pointer-events: auto; background: radial-gradient(ellipse at 50% 44%, rgba(214,185,156,0.12), rgba(70,42,22,0.10) 46%, rgba(0,0,0,0.16) 100%); opacity: 1; transition: opacity 360ms ease; }",
      "#golbang-start-hint.is-hidden { opacity: 0; pointer-events: none; }",
      "#golbang-start-hint .golbang-start-hint-card { padding: 14px 24px; border-radius: 999px; color: rgba(255,248,232,0.96); font-size: clamp(14px, 2.4vw, 19px); letter-spacing: 0.08em; line-height: 1.5; text-align: center; background: rgba(78,54,35,0.34); border: 1px solid rgba(255,238,210,0.38); box-shadow: 0 12px 40px rgba(48,27,12,0.22), inset 0 0 18px rgba(255,236,202,0.14); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); text-shadow: 0 2px 8px rgba(0,0,0,0.26); }",
      "#golbang-start-hint .golbang-start-hint-bubble { position: absolute; top: calc(56px + env(safe-area-inset-top, 0px)); max-width: min(180px, calc(50vw - 28px)); padding: 9px 13px; font-size: 12px; line-height: 1.45; color: #5a4632; text-align: center; background: rgba(255, 248, 232, 0.78); border: 1px solid rgba(255, 255, 255, 0.32); border-radius: 18px; box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); user-select: none; -webkit-user-select: none; pointer-events: none; }",
      "#golbang-start-hint .golbang-start-hint-bubble-left { left: calc(14px + env(safe-area-inset-left, 0px)); }",
      "#golbang-start-hint .golbang-start-hint-bubble-right { right: calc(14px + env(safe-area-inset-right, 0px)); }",
      "#golbang-start-hint .golbang-start-hint-bubble::before { content: ''; position: absolute; top: -7px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 8px solid rgba(255, 248, 232, 0.78); }",
      "#golbang-start-hint .golbang-start-hint-bubble-left::before { left: 16px; }",
      "#golbang-start-hint .golbang-start-hint-bubble-right::before { right: 16px; }",
      "@media (max-width: 480px) { #golbang-start-hint .golbang-start-hint-bubble { font-size: 11px; padding: 8px 11px; border-radius: 16px; max-width: min(150px, calc(50vw - 22px)); top: calc(48px + env(safe-area-inset-top, 0px)); } }"
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
    if (src !== "assets/b_golbang.webp") altar.setAttribute("src", "assets/b_golbang.webp");
  }

  var START_HINT_STORAGE_KEY = "codex-golbang-start-hint";
  var START_HINT_LEFT_TEXT = "기도 장소가 궁금하면 눌러보세요";
  var START_HINT_RIGHT_TEXT = "기도음악과 함께 몰입해보세요";

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
    hint.setAttribute("aria-label", "기도의 마음으로 화면을 눌러주세요");
    hint.innerHTML =
      '<div class="golbang-start-hint-bubble golbang-start-hint-bubble-left">' + START_HINT_LEFT_TEXT + "</div>" +
      '<div class="golbang-start-hint-bubble golbang-start-hint-bubble-right">' + START_HINT_RIGHT_TEXT + "</div>" +
      '<div class="golbang-start-hint-card">기도의 마음으로 화면을 눌러주세요</div>';
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
