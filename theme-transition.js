(function () {
  "use strict";

  var BASE_THEME_ALTARS = {
    "은밀한 골방": "assets/b_golbang.webp",
    "사막의 제단": "assets/g_dessert.webp",
    "겟세마네 동산": "assets/g_dessert.webp",
    "어두운 밤": "assets/b_night.webp",
    "여름 녹음": "assets/b_woods.webp",
    "마가 다락방": "assets/b_mark.webp",
    "요나의 고래뱃속": "assets/b_jonah.webp",
    "모세의 시내산": "assets/b_sinal.webp"
  };
  var BASE_THEME_BACKGROUNDS = {
    "은밀한 골방": {
      image: "assets/back_golbang.webp",
      color: "#78563d",
      position: "center"
    },
    "사막의 제단": {
      image: "assets/back_dessert.webp",
      color: "#b77c61",
      position: "center"
    },
    "겟세마네 동산": {
      image: "assets/back_gathe3.webp",
      color: "#000000",
      position: "48.25% center"
    },
    "어두운 밤": {
      image: "assets/back_night.webp?v=night-background-1",
      color: "#000114",
      position: "center"
    },
    "여름 녹음": {
      image: "assets/back_woods7.webp",
      color: "#091c1f",
      position: "center 70%",
      mobilePosition: "center top"
    },
    "마가 다락방": {
      image: "assets/back_mark.webp",
      color: "#3e2b21",
      position: "center 52%"
    },
    "요나의 고래뱃속": {
      image: "assets/back_jonah.webp",
      color: "#000204",
      position: "center calc(50% - 8vh)"
    },
    "모세의 시내산": {
      image: "assets/back_sinal.webp",
      color: "#536a83",
      position: "center calc(50% - 30vh)"
    }
  };
  var BASE_THEME_LABELS = Object.keys(BASE_THEME_ALTARS);
  var currentActiveTheme = "";
  var fadeTimer = 0;
  var fadeFallbackTimer = 0;
  var THEME_ASSET_VERSION = "theme-assets-11";
  var THEME_SWAP_DELAY = 600;
  var THEME_REVEAL_DELAY = 1600;
  var backgroundRequestId = 0;
  var imageLoadCache = {};
  var transitionInProgress = false;
  var allowNativeThemeClick = false;
  var EXTRA_THEME_BY_LABEL = {
    "마가 다락방": "mark",
    "요나의 고래뱃속": "jonah",
    "모세의 시내산": "sinal"
  };

  function normalizeAssetSrc(src) {
    return String(src || "").split("?")[0];
  }

  function versionedAssetSrc(src) {
    var base = normalizeAssetSrc(src);
    if (!base) return "";
    return base + "?v=" + THEME_ASSET_VERSION;
  }

  function preloadImage(src) {
    var url = versionedAssetSrc(src);
    if (!url) return Promise.reject(new Error("Missing image source"));
    if (imageLoadCache[url]) return imageLoadCache[url];
    imageLoadCache[url] = new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(url);
      };
      image.onerror = function () {
        delete imageLoadCache[url];
        reject(new Error("Failed to load " + url));
      };
      image.src = url;
    });
    return imageLoadCache[url];
  }

  function preloadBackgroundImages() {
    Object.keys(BASE_THEME_BACKGROUNDS).forEach(function (themeName) {
      preloadImage(BASE_THEME_BACKGROUNDS[themeName].image).catch(function () {});
    });
  }

  function isMobileViewport() {
    return window.matchMedia && (
      window.matchMedia("(max-width: 820px)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    );
  }

  function resolveBackgroundPosition(config) {
    return config.mobilePosition && isMobileViewport() ? config.mobilePosition : config.position;
  }

  function setBackgroundFrame(background, config) {
    background.style.backgroundPosition = resolveBackgroundPosition(config);
    background.style.backgroundColor = config.color;
    background.style.backgroundSize = "cover";
    background.style.backgroundRepeat = "no-repeat";
    background.style.opacity = "1";
  }

  function applyLoadedBackground(themeName, config) {
    var requestId = ++backgroundRequestId;
    var background = findBackgroundNode();
    if (!background) return;
    background.dataset.codexThemeBackground = "true";
    background.dataset.codexBackgroundPending = themeName;
    setBackgroundFrame(background, config);

    preloadImage(config.image).then(function () {
      var current = document.body.dataset.currentTheme;
      var target = document.querySelector('[data-codex-background-pending="' + themeName + '"]') || background;
      if (requestId !== backgroundRequestId || current !== themeName || !target) return;
      target.style.backgroundImage = 'url("' + versionedAssetSrc(config.image) + '")';
      target.removeAttribute("data-codex-background-pending");
    }).catch(function () {
      var target = document.querySelector('[data-codex-background-pending="' + themeName + '"]') || background;
      if (requestId !== backgroundRequestId || !target) return;
      target.style.backgroundImage = 'url("' + versionedAssetSrc(config.image) + '")';
      target.removeAttribute("data-codex-background-pending");
    });
  }

  function clearAllThemeState() {
    var oldTheme = currentActiveTheme;
    
    // 모든 테마 CSS 클래스 제거
    [
      "codex-theme-desert",
      "codex-theme-gethsemane",
      "codex-theme-night",
      "codex-theme-summer",
      "codex-theme-mark",
      "codex-theme-jonah",
      "codex-theme-sinal"
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

  function ensureOverlay() {
    var existing = document.getElementById("codex-theme-transition");
    if (existing) {
      if (!existing.querySelector(".codex-transition-message")) {
        var message = document.createElement("span");
        message.className = "codex-transition-message";
        message.textContent = "기도의 장소로 이동 중…";
        existing.appendChild(message);
      }
      return;
    }
    var overlay = document.createElement("div");
    overlay.id = "codex-theme-transition";
    overlay.setAttribute("aria-hidden", "true");

    var message = document.createElement("span");
    message.className = "codex-transition-message";
    message.textContent = "기도의 장소로 이동 중…";
    overlay.appendChild(message);

    document.body.appendChild(overlay);
  }

  function startFade() {
    ensureOverlay();
    window.clearTimeout(fadeTimer);
    window.clearTimeout(fadeFallbackTimer);
    if (transitionInProgress) {
      fadeTimer = window.setTimeout(function () {
        document.body.classList.remove("codex-theme-transitioning");
        transitionInProgress = false;
        document.body.removeAttribute("data-theme-transitioning");
      }, THEME_REVEAL_DELAY);
      return;
    }
    transitionInProgress = true;
    document.body.dataset.themeTransitioning = "true";
    document.body.classList.add("codex-theme-transitioning");
    fadeTimer = window.setTimeout(function () {
      document.body.classList.remove("codex-theme-transitioning");
      transitionInProgress = false;
      document.body.removeAttribute("data-theme-transitioning");
    }, THEME_REVEAL_DELAY);
    fadeFallbackTimer = window.setTimeout(function () {
      document.body.classList.remove("codex-theme-transitioning");
      transitionInProgress = false;
      document.body.removeAttribute("data-theme-transitioning");
    }, THEME_REVEAL_DELAY + 1800);
  }

  function markThemeMenu(button) {
    var menu = button && button.parentElement;
    if (!menu) return;
    menu.dataset.codexThemeMenu = "true";
  }

  function closeThemeMenu(button) {
    var menu = button && button.parentElement;
    var wrapper = menu && menu.parentElement;
    if (!wrapper) return;
    var toggle = Array.from(wrapper.children).find(function (node) {
      return node.tagName === "BUTTON" && text(node).length === 0;
    });
    if (!toggle) return;
    window.setTimeout(function () {
      toggle.click();
    }, 90);
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
    var altarSrc = (altar.getAttribute("src") || "").split("?")[0];
    if (altarSrc !== src) altar.setAttribute("src", src);
    sanitizeAltarStyles(altar);
    updateAltarFilter(themeName);
  }

  function updateAltarFilter(themeName) {
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    altar.style.removeProperty("filter");
  }

  function sanitizeAltarStyles(altar) {
    if (!altar) return;
    [
      "width",
      "max-width",
      "height",
      "max-height",
      "min-width",
      "min-height",
      "margin",
      "margin-left",
      "margin-right",
      "top",
      "right",
      "bottom",
      "left",
      "translate",
      "transform",
      "scale",
      "transition",
      "animation",
      "opacity",
      "filter"
    ].forEach(function (property) {
      altar.style.removeProperty(property);
    });
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
    var marked = document.querySelector('[data-codex-theme-background="true"]');
    if (marked) return marked;
    var nodes = Array.from(document.querySelectorAll("#root div"));
    return nodes.find(function (node) {
      var style = node.style || {};
      return style.backgroundImage && style.backgroundSize === "cover";
    }) || nodes.find(function (node) {
      var style = node.style || {};
      return style.backgroundSize === "cover" || style.backgroundPosition;
    }) || null;
  }

  function applyBaseVisuals(themeName, options) {
    var config = BASE_THEME_BACKGROUNDS[themeName];
    if (!config) return;
    currentActiveTheme = themeName;
    document.body.removeAttribute("data-theme");
    document.body.removeAttribute("data-extra-theme");
    document.body.dataset.currentTheme = themeName;
    document.body.style.backgroundColor = config.color;
    if (!options || !options.silent) {
      document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: "base" } }));
    }

    applyLoadedBackground(themeName, config);
    window.setTimeout(function () {
      if (document.body.dataset.currentTheme !== themeName) return;
      resetBaseAltar(themeName);
    }, THEME_SWAP_DELAY);
    updateFooterThemeLabel(themeName);
  }

  var ALTAR_RELOAD_SOURCES = new Set([
    "assets/g_dessert.webp",
    "assets/b_night.webp",
    "assets/b_woods.webp",
    "assets/b_mark.webp",
    "assets/b_jonah.webp",
    "assets/b_sinal.webp"
  ]);

  function reloadAltarSrc(altar) {
    if (!altar) return;
    var src = altar.getAttribute("src") || "";
    var base = src.split("?")[0];
    if (!ALTAR_RELOAD_SOURCES.has(base)) return;
    if (/\bv=theme-assets-11\b/.test(src)) return;
    altar.setAttribute("src", versionedAssetSrc(base));
  }

  function bindAltarSrcObserver() {
    sanitizeAltarStyles(document.querySelector('img[alt="altar"]'));
    reloadAltarSrc(document.querySelector('img[alt="altar"]'));
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "src") {
          var target = mutation.target;
          if (target.matches && target.matches('img[alt="altar"]')) {
            reloadAltarSrc(target);
          }
        }
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          var styleTarget = mutation.target;
          if (styleTarget.matches && styleTarget.matches('img[alt="altar"]')) {
            sanitizeAltarStyles(styleTarget);
          }
        }
        if (mutation.type === "childList") {
          Array.from(mutation.addedNodes).forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches('img[alt="altar"]')) {
              sanitizeAltarStyles(node);
              reloadAltarSrc(node);
            }
            Array.from(node.querySelectorAll ? node.querySelectorAll('img[alt="altar"]') : []).forEach(function (altar) {
              sanitizeAltarStyles(altar);
              reloadAltarSrc(altar);
            });
          });
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "style"]
    });
  }

  function preloadAltarImages() {
    Object.keys(BASE_THEME_ALTARS).forEach(function (themeName) {
      var src = BASE_THEME_ALTARS[themeName];
      var image = new Image();
      image.src = versionedAssetSrc(src);
    });
  }

  function markCurrentTheme() {
    if (document.body.dataset.theme) return;
    var footerTheme = "";
    if (currentActiveTheme) {
      footerTheme = currentActiveTheme;
      updateFooterThemeLabel(currentActiveTheme);
    }
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (footerTheme) return;
      if (node.closest && node.closest("button")) return;
      var value = text(node);
      if (BASE_THEME_LABELS.indexOf(value) !== -1) footerTheme = value;
    });
    var themeClasses = [
      "codex-theme-golbang",
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
      "은밀한 골방": "codex-theme-golbang",
      "사막의 제단": "codex-theme-desert",
      "겟세마네 동산": "codex-theme-gethsemane",
      "어두운 밤": "codex-theme-night",
      "여름 녹음": "codex-theme-summer",
      "마가 다락방": "codex-theme-mark",
      "요나의 고래뱃속": "codex-theme-jonah",
      "모세의 시내산": "codex-theme-sinal"
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
    preloadBackgroundImages();
    preloadAltarImages();
    bindAltarSrcObserver();
    markAltarStage();
    markCurrentTheme();

    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      if (button.dataset.codexTheme) return;
      var themeName = findThemeFromButton(button);
      if (!themeName) return;
      if (allowNativeThemeClick) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();

      if (transitionInProgress || document.body.dataset.themeTransitioning === "true") return;

      markThemeMenu(button);
      startFade();
      closeThemeMenu(button);
      if (EXTRA_THEME_BY_LABEL[themeName]) {
        document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: EXTRA_THEME_BY_LABEL[themeName] } }));
        return;
      }
      if (BASE_THEME_ALTARS[themeName]) {
        window.setTimeout(function () {
          document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: "base", label: themeName } }));
          allowNativeThemeClick = true;
          button.click();
          allowNativeThemeClick = false;
          window.setTimeout(function () {
            applyBaseVisuals(themeName, { silent: true });
          }, 80);
          scheduleBaseReset(themeName);
        }, THEME_SWAP_DELAY);
      } else {
        window.setTimeout(markCurrentTheme, 900);
      }

      window.setTimeout(function () {
        var currentTheme = document.body.dataset.currentTheme;
        if (currentTheme) updateAltarFilter(currentTheme);
      }, 100);
    }, true);

    document.addEventListener("codex-extra-theme-change", function () {
      if (!transitionInProgress && document.body.dataset.themeTransitioning !== "true") startFade();
    });

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
