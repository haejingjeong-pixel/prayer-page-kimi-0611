(function () {
  "use strict";

  var BGM_KEY = "codex-user-bgm-enabled";

  function currentTheme() {
    var body = document.body;
    if (!body) return "golbang";

    if (body.dataset && body.dataset.theme) return body.dataset.theme;

    var cls = String(body.className || "");
    if (cls.indexOf("codex-theme-sinal") !== -1) return "sinal";
    if (cls.indexOf("codex-theme-desert") !== -1) return "desert";
    if (cls.indexOf("codex-theme-mark") !== -1) return "mark";
    if (cls.indexOf("codex-theme-summer") !== -1) return "summer";
    if (cls.indexOf("codex-theme-jonah") !== -1) return "jonah";
    if (cls.indexOf("codex-theme-night") !== -1) return "night";
    if (cls.indexOf("codex-theme-gethsemane") !== -1) return "gethsemane";

    return "golbang";
  }

  function unmuteAllThemeAudio() {
    document.querySelectorAll("audio").forEach(function (audio) {
      audio.muted = false;
      audio.volume = 0.4;
      audio.removeAttribute("muted");
    });
  }

  function playBgm(reason) {
    localStorage.setItem(BGM_KEY, "true");

    var theme = currentTheme();

    unmuteAllThemeAudio();

    try {
      document.dispatchEvent(new CustomEvent("codex-bgm-theme-change", {
        detail: { theme: theme }
      }));
    } catch (error) {}

    if (typeof window.codexSwitchThemeBgm === "function") {
      try {
        window.codexSwitchThemeBgm(theme);
      } catch (error) {}
    }

    if (typeof window.codexPlayCurrentThemeBgm === "function") {
      try {
        var result = window.codexPlayCurrentThemeBgm();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      } catch (error) {}
    }

    [80, 250, 600, 1200].forEach(function (delay) {
      window.setTimeout(function () {
        unmuteAllThemeAudio();

        if (typeof window.codexPlayCurrentThemeBgm === "function") {
          try {
            var result = window.codexPlayCurrentThemeBgm();
            if (result && typeof result.catch === "function") {
              result.catch(function () {});
            }
          } catch (error) {}
        }
      }, delay);
    });
  }

  function onUserGesture(event) {
    playBgm(event.type);
  }

  window.addEventListener("pointerdown", onUserGesture, true);
  window.addEventListener("touchstart", onUserGesture, true);
  window.addEventListener("click", onUserGesture, true);

  window.codexForceBgmUnlock = function () {
    playBgm("manual");
  };
})();
