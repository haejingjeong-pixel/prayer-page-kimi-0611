(function () {
  "use strict";

  var STORAGE_KEY = "codex-first-entry-guide";
  var OVERLAY_ID = "codex-first-entry-guide";
  var CENTER_TEXT = "기도의 마음으로 화면을 눌러주세요";
  var LEFT_TEXT = "기도 장소 이름 안내말풍선 팝업<br>클릭하면 사라짐";
  var RIGHT_TEXT = "기도의 몰입감을 위해 클릭하여<br>기도음악을 들어보세요<br>안내말풍선 팝업<br>클릭하면 사라짐";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function isDismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dismissed";
    } catch (e) {
      return false;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch (e) {}
  }

  function injectStyle() {
    if (document.getElementById("codex-first-entry-guide-style")) return;
    var style = document.createElement("style");
    style.id = "codex-first-entry-guide-style";
    style.textContent = [
      "#codex-first-entry-guide {",
      "  position: fixed;",
      "  inset: 0;",
      "  z-index: 2147483646;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  pointer-events: auto;",
      "  background: radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0.06), rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.42) 100%);",
      "  opacity: 1;",
      "  transition: opacity 420ms ease;",
      "}",
      "#codex-first-entry-guide.is-hidden { opacity: 0; pointer-events: none; }",
      "#codex-first-entry-guide .codex-first-entry-center {",
      "  padding: 14px 26px;",
      "  border-radius: 999px;",
      "  color: rgba(255,248,232,0.96);",
      "  font-size: clamp(13px, 2.2vw, 18px);",
      "  letter-spacing: 0.08em;",
      "  line-height: 1.5;",
      "  text-align: center;",
      "  background: rgba(40,30,22,0.44);",
      "  border: 1px solid rgba(255,238,210,0.38);",
      "  box-shadow: 0 12px 40px rgba(0,0,0,0.22), inset 0 0 18px rgba(255,236,202,0.14);",
      "  backdrop-filter: blur(8px);",
      "  -webkit-backdrop-filter: blur(8px);",
      "  text-shadow: 0 2px 8px rgba(0,0,0,0.26);",
      "}",
      "#codex-first-entry-guide .codex-first-entry-bubble {",
      "  position: absolute;",
      "  top: calc(60px + env(safe-area-inset-top, 0px));",
      "  max-width: min(240px, calc(50vw - 28px));",
      "  padding: 10px 14px;",
      "  font-size: 13px;",
      "  line-height: 1.45;",
      "  color: #5a4632;",
      "  text-align: center;",
      "  background: rgba(255, 246, 230, 0.96);",
      "  border-radius: 14px;",
      "  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);",
      "  user-select: none;",
      "  -webkit-user-select: none;",
      "  pointer-events: none;",
      "}",
      "#codex-first-entry-guide .codex-first-entry-bubble-left {",
      "  left: calc(14px + env(safe-area-inset-left, 0px));",
      "}",
      "#codex-first-entry-guide .codex-first-entry-bubble-right {",
      "  right: calc(14px + env(safe-area-inset-right, 0px));",
      "}",
      "#codex-first-entry-guide .codex-first-entry-bubble::before {",
      "  content: '';",
      "  position: absolute;",
      "  top: -8px;",
      "  width: 0;",
      "  height: 0;",
      "  border-left: 7px solid transparent;",
      "  border-right: 7px solid transparent;",
      "  border-bottom: 9px solid rgba(255, 246, 230, 0.96);",
      "}",
      "#codex-first-entry-guide .codex-first-entry-bubble-left::before { left: 18px; }",
      "#codex-first-entry-guide .codex-first-entry-bubble-right::before { right: 18px; }",
      "@media (max-width: 480px) {",
      "  #codex-first-entry-guide .codex-first-entry-center {",
      "    padding: 11px 18px;",
      "    font-size: clamp(12px, 3.6vw, 15px);",
      "    letter-spacing: 0.06em;",
      "  }",
      "  #codex-first-entry-guide .codex-first-entry-bubble {",
      "    font-size: 11px;",
      "    padding: 8px 11px;",
      "    border-radius: 12px;",
      "    max-width: min(170px, calc(50vw - 22px));",
      "    top: calc(52px + env(safe-area-inset-top, 0px));",
      "  }",
      "}",
      "@media (max-width: 360px) {",
      "  #codex-first-entry-guide .codex-first-entry-bubble {",
      "    max-width: min(150px, calc(50vw - 18px));",
      "    font-size: 10px;",
      "    padding: 7px 10px;",
      "  }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function createOverlay() {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("role", "button");
    overlay.setAttribute("aria-label", "첫 화면 안내 닫기");
    overlay.innerHTML =
      '<div class="codex-first-entry-bubble codex-first-entry-bubble-left">' + LEFT_TEXT + "</div>" +
      '<div class="codex-first-entry-bubble codex-first-entry-bubble-right">' + RIGHT_TEXT + "</div>" +
      '<div class="codex-first-entry-center">' + CENTER_TEXT + "</div>";
    document.body.appendChild(overlay);
    return overlay;
  }

  function dispatchInteraction() {
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

  function init() {
    if (isDismissed()) return;
    injectStyle();
    var overlay = createOverlay();
    var dismissed = false;

    function dismiss(event) {
      if (dismissed) return;
      dismissed = true;
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      markDismissed();
      overlay.classList.add("is-hidden");
      window.setTimeout(function () {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 460);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      dispatchInteraction();
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
  }

  ready(init);
})();
