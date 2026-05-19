(function () {
  "use strict";

  var BASE_THEME_ALTARS = {
    "사막의 제단": "assets/g_dessert.webp",
    "겟세마네 동산": "assets/g_dessert.webp",
    "어두운 밤": "assets/b_night.webp",
    "여름 녹음": "assets/b_woods.webp"
  };
  var BASE_THEME_BACKGROUNDS = {
    "사막의 제단": {
      image: "assets/back_dessert.webp",
      color: "#b77c61",
      position: "center",
      waitingFilter: "none",
      prayingFilter: "none"
    },
    "겟세마네 동산": {
      image: "assets/back_gathe3.webp",
      color: "#000000",
      position: "center 25%",
      waitingFilter: "none",
      prayingFilter: "none"
    },
    "어두운 밤": {
      image: "assets/back_night.webp",
      color: "#000114",
      position: "center",
      waitingFilter: "brightness(0.52) saturate(0.86) contrast(0.96) drop-shadow(0 24px 28px rgba(0, 0, 0, 0.58))",
      prayingFilter: "brightness(1.04) saturate(1.04) contrast(1.03) drop-shadow(0 0 16px rgba(176, 196, 255, 0.16)) drop-shadow(0 22px 24px rgba(0, 0, 0, 0.34))"
    },
    "여름 녹음": {
      image: "assets/back_woods7.webp",
      color: "#091c1f",
      position: "center 70%",
      waitingFilter: "brightness(0.74) saturate(0.88) contrast(0.98) drop-shadow(0 22px 28px rgba(0, 0, 0, 0.42))",
      prayingFilter: "brightness(0.84) saturate(0.96) contrast(1.02) drop-shadow(0 0 20px rgba(100, 200, 100, 0.20)) drop-shadow(0 24px 32px rgba(0, 0, 0, 0.28))"
    },

  };
  var BASE_THEME_LABELS = Object.keys(BASE_THEME_ALTARS);
  var currentActiveTheme = "";
  var fadeTimer = 0;
  var revealTimer = 0;

  function clearAllThemeState() {
    var oldTheme = currentActiveTheme;
    
    // 모든 테마 CSS 클래스 제거
    [
      "codex-theme-desert",
      "codex-theme-gethsemane",
      "codex-theme-night",
      "codex-theme-summer",

    ].forEach(function (className) {
      document.documentElement.classList.remove(className);
      document.body.classList.remove(className);
    });

    // 모든 데이터 속성 제거
    document.body.removeAttribute("data-extra-theme");
    document.body.removeAttribute("data-theme");
    document.body.removeAttribute("data-codex-theme-background");
    
    // 배경 스타일 초기화
    var background = findBackgroundNode();
    if (background) {
      background.removeAttribute("data-codex-theme-background");
      background.style.removeProperty("background-image");
      background.style.removeProperty("background-position");
      background.style.removeProperty("background-color");
      background.style.removeProperty("opacity");
    }

    return oldTheme;
  }

  function text(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function isPrayerActive() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      return text(button).indexOf("기도 중...") !== -1;
    });
  }

  function ensureOverlay() {
    if (document.getElementById("codex-theme-transition")) return;
    var overlay = document.createElement("div");
    overlay.id = "codex-theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  function startFade() {
    ensureOverlay();
    document.body.classList.remove("codex-theme-transitioning");
    document.body.classList.remove("codex-altar-revealing");
    void document.body.offsetWidth;
    document.body.classList.add("codex-theme-transitioning");
    window.clearTimeout(revealTimer);
    revealTimer = window.setTimeout(function () {
      document.body.classList.add("codex-altar-revealing");
      revealTimer = window.setTimeout(function () {
        document.body.classList.remove("codex-altar-revealing");
      }, 1050);
    }, 220);
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(function () {
      document.body.classList.remove("codex-theme-transitioning");
    }, 1900);
  }

  function findThemeFromButton(button) {
    var label = text(button);
    return BASE_THEME_LABELS.find(function (themeName) {
      return label.indexOf(themeName) !== -1;
    }) || "";
  }

  function resetBaseAltar(themeName) {
    var src = BASE_THEME_ALTARS[themeName];
    if (!src) return;
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    markAltarStage();
    var reloadSrc = src + "?reload=" + Date.now();
    if (altar.getAttribute("src") !== reloadSrc) altar.setAttribute("src", reloadSrc);
    altar.style.removeProperty("width");
    altar.style.removeProperty("max-width");
    altar.style.removeProperty("margin-left");
    altar.style.removeProperty("margin-right");
    altar.style.removeProperty("opacity");
    updateAltarFilter(themeName);
  }

  function updateAltarFilter(themeName) {
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    var config = BASE_THEME_BACKGROUNDS[themeName];
    if (!config) return;
    var filter = isPrayerActive() ? config.prayingFilter : config.waitingFilter;
    if (filter) {
      altar.style.filter = filter;
    } else {
      altar.style.removeProperty("filter");
    }
  }

  function markAltarStage() {
    var altar = document.querySelector('img[alt="altar"]');
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

  function updateFooterThemeLabel(themeName) {
    BASE_THEME_LABELS.forEach(function (oldName) {
      Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
        if (node.closest && node.closest("button")) return;
        if (node.childElementCount) return;
        if (text(node) === oldName && node.textContent !== themeName) {
          node.textContent = themeName;
        }
      });
    });
  }

  function findBackgroundNode() {
    return Array.from(document.querySelectorAll("#root div")).find(function (node) {
      var style = node.style || {};
      return style.backgroundImage && style.backgroundSize === "cover";
    }) || null;
  }

  function applyBaseVisuals(themeName, options) {
    var config = BASE_THEME_BACKGROUNDS[themeName];
    if (!config) return;
    document.body.removeAttribute("data-extra-theme");
    document.body.dataset.currentTheme = themeName;
    document.body.style.backgroundColor = config.color;
    if (!options || !options.silent) {
      document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: "base" } }));
    }

    var background = findBackgroundNode();
    if (background) {
      background.style.backgroundImage = 'url("' + config.image + '")';
      background.style.backgroundPosition = config.position;
      background.style.backgroundColor = config.color;
      background.style.backgroundSize = "cover";
      background.style.backgroundRepeat = "no-repeat";
      background.style.opacity = "1";
    }
    resetBaseAltar(themeName);
    updateFooterThemeLabel(themeName);
  }

  var ALTAR_RELOAD_SOURCES = new Set([
    "assets/g_dessert.webp",
    "assets/b_night.webp",
    "assets/b_woods.webp",

  ]);

  function reloadAltarSrc(altar) {
    if (!altar) return;
    var src = altar.getAttribute("src") || "";
    var base = src.split("?")[0];
    if (!ALTAR_RELOAD_SOURCES.has(base)) return;
    if (/\breload=/.test(src)) return;
    altar.setAttribute("src", base + "?reload=" + Date.now());
  }

  function bindAltarSrcObserver() {
    reloadAltarSrc(document.querySelector('img[alt="altar"]'));
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "src") {
          var target = mutation.target;
          if (target.matches && target.matches('img[alt="altar"]')) {
            reloadAltarSrc(target);
          }
        }
        if (mutation.type === "childList") {
          Array.from(mutation.addedNodes).forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches('img[alt="altar"]')) {
              reloadAltarSrc(node);
            }
            Array.from(node.querySelectorAll ? node.querySelectorAll('img[alt="altar"]') : []).forEach(reloadAltarSrc);
          });
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"]
    });
  }

  function preloadAltarImages() {
    Object.keys(BASE_THEME_ALTARS).forEach(function (themeName) {
      var src = BASE_THEME_ALTARS[themeName];
      var image = new Image();
      image.src = src + "?reload=" + Date.now();
    });
  }

  function markCurrentTheme() {
    var footerTheme = "";
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      var value = text(node);
      if (BASE_THEME_LABELS.indexOf(value) !== -1) footerTheme = value;
    });
    var themeClasses = [
      "codex-theme-desert",
      "codex-theme-gethsemane",
      "codex-theme-night",
      "codex-theme-summer",
      "codex-theme-mark",
      "codex-theme-jonah",
      "codex-theme-sinal"
    ];
    themeClasses.forEach(function (className) {
      document.body.classList.remove(className);
    });
    var classByTheme = {
      "사막의 제단": "codex-theme-desert",
      "겟세마네 동산": "codex-theme-gethsemane",
      "어두운 밤": "codex-theme-night",
      "여름 녹음": "codex-theme-summer",

    };
    if (classByTheme[footerTheme]) {
      document.body.classList.add(classByTheme[footerTheme]);
      document.body.dataset.currentTheme = footerTheme;
    } else {
      document.body.removeAttribute("data-current-theme");
    }
  }

  function scheduleBaseReset(themeName) {
    [80, 260, 720, 1400].forEach(function (delay) {
      window.setTimeout(function () {
        applyBaseVisuals(themeName, { silent: true });
        markCurrentTheme();
        updateAltarFilter(themeName);
      }, delay);
    });
  }

  function start() {
    ensureOverlay();
    preloadAltarImages();
    bindAltarSrcObserver();
    markAltarStage();
    markCurrentTheme();

    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var themeName = findThemeFromButton(button);
      if (!themeName) return;

      startFade();
      if (BASE_THEME_ALTARS[themeName]) {
        applyBaseVisuals(themeName);
        scheduleBaseReset(themeName);
      } else {
        window.setTimeout(markCurrentTheme, 900);
      }

      window.setTimeout(function () {
        var currentTheme = document.body.dataset.currentTheme;
        if (currentTheme) updateAltarFilter(currentTheme);
      }, 100);
    }, true);

    document.addEventListener("codex-extra-theme-change", startFade);

    new MutationObserver(function () {
      markAltarStage();
      markCurrentTheme();
    }).observe(document.getElementById("root"), {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
