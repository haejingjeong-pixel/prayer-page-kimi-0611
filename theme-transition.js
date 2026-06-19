(function () {
  "use strict";

  var timers = [];
  var runId = 0;
  var FADE_IN_MS = 800;
  var HOLD_MS = 900;
  var FADE_OUT_MS = 2200;
  var transitionActive = false;

  function ensureOverlay() {
    if (document.getElementById("theme-fade-overlay")) return document.getElementById("theme-fade-overlay");
    var overlay = document.createElement("div");
    overlay.id = "theme-fade-overlay";
    overlay.setAttribute("aria-hidden", "true");

    var message = document.createElement("div");
    message.className = "theme-fade-message";
    message.textContent = "기도의 장소로 이동 중…";
    overlay.appendChild(message);

    document.body.appendChild(overlay);
    return overlay;
  }

  function clearTimers() {
    timers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    timers = [];
  }

  function later(fn, delay) {
    var timer = window.setTimeout(fn, delay);
    timers.push(timer);
    return timer;
  }

  function finish(overlay, id, resolve) {
    if (id !== runId) return;
    document.body.classList.remove("codex-theme-transitioning");
    document.body.removeAttribute("data-theme-transitioning");
    overlay.style.pointerEvents = "none";
    overlay.style.visibility = "hidden";
    overlay.style.opacity = "0";
    transitionActive = false;
    if (resolve) resolve();
  }

  function runThemeFadeTransition(applyThemeState) {
    var overlay = ensureOverlay();
    var id = runId + 1;
    runId = id;
    clearTimers();
    transitionActive = true;
    document.body.dataset.themeTransitioning = "true";
    document.body.classList.add("codex-theme-transitioning");

    overlay.style.transition = "none";
    overlay.style.visibility = "visible";
    overlay.style.pointerEvents = "auto";
    overlay.style.opacity = "0";
    void overlay.offsetWidth;
    overlay.style.transition = "opacity " + FADE_IN_MS + "ms ease-in";
    overlay.style.opacity = "1";

    return new Promise(function (resolve) {
      later(function () {
        if (id !== runId) return;
        if (typeof applyThemeState === "function") applyThemeState();

        window.requestAnimationFrame(function () {
          later(function () {
            if (id !== runId) return;
            overlay.style.transition = "opacity " + FADE_OUT_MS + "ms cubic-bezier(0.22, 0.72, 0.18, 1)";
            overlay.style.opacity = "0";
            later(function () {
              finish(overlay, id, resolve);
            }, FADE_OUT_MS);
          }, HOLD_MS);
        });
      }, FADE_IN_MS);

      later(function () {
        finish(overlay, id, resolve);
      }, FADE_IN_MS + HOLD_MS + FADE_OUT_MS + 800);
    });
  }

  function startFade() {
    return runThemeFadeTransition();
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  window.codexStartThemeTransition = startFade;
  window.codexRunThemeFadeTransition = runThemeFadeTransition;
  window.codexIsThemeTransitioning = function () {
    return transitionActive;
  };

  ready(function () {
    ensureOverlay();
  });
})();
