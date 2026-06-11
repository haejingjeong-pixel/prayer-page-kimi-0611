(function () {
  "use strict";

  var extraThemes = {
    mark: {
      label: "마가 다락방",
      bg: "assets/back_mark.webp",
      altar: "assets/b_mark.webp",
      color: "#3e2b21",
      position: "center 52%",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M2 14V7l6-5 6 5v7"/><path d="M6 14v-4h4v4"/></svg>'
    },
    jonah: {
      label: "요나의 고래뱃속",
      bg: "assets/back_jonah.webp",
      altar: "assets/b_jonah.webp",
      color: "#000204",
      position: "center calc(50% - 8vh)",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M6 3.5l2 2.5 2-2.5"/><path d="M2 11.5c2-1 3-1 5 0s3 1 5 0"/><path d="M2 13c2-1 3-1 5 0s3 1 5 0"/><circle cx="13" cy="8" r=".5" fill="currentColor" stroke="none"/></svg>'
    },
    sinal: {
      label: "모세의 시내산",
      bg: "assets/back_sinal.webp",
      altar: "assets/b_sinal.webp",
      color: "#536a83",
      position: "center calc(50% - 30vh)",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M2 13l4.5-9 2 4"/><path d="M6.5 8l2.5-5 4 10"/><path d="M10 2l-1.5 2.5h2.5l-2 3"/></svg>'
    },
    golbang: {
      label: "은밀한 골방",
      bg: "assets/back_golbang.webp",
      altar: "assets/b_golbang.webp",
      color: "#78563d",
      position: "48% top",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M2 14V6.5l6-4.5 6 4.5V14"/><path d="M6 14v-3.5h4V14"/><path d="M8 4V2"/><path d="M7 3h2"/></svg>'
    }
  };

  var baseThemeLabels = ["은밀한 골방", "사막의 제단", "겟세마네 동산", "어두운 밤", "여름 녹음"];
  var activeExtraTheme = "";
  var seeded = false;
  var cleanupTimers = [];
  var sinalBackgroundSize = { width: 2912, height: 1632 };
  var sinalPeakAnchor = { x: 0.54, y: 0.415 };
  var themeClassByExtraTheme = {
    mark: "codex-theme-mark",
    jonah: "codex-theme-jonah",
    sinal: "codex-theme-sinal",
    golbang: "codex-theme-golbang"
  };
  var allThemeClasses = [
    "codex-theme-desert",
    "codex-theme-gethsemane",
    "codex-theme-night",
    "codex-theme-summer",
    "codex-theme-mark",
    "codex-theme-jonah",
    "codex-theme-sinal",
    "codex-theme-golbang"
  ];
  var THEME_ASSET_VERSION = "theme-assets-34";
  var THEME_SWAP_DELAY = 620;
  var backgroundRequestId = 0;
  var imageLoadCache = {};
  var gethsemaneCleanupTimers = [];
  var lastPrayerState = "";
  var lastGethsemaneActive = false;
  var injectingMenu = false;

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

  function preloadThemeImages() {
    Object.keys(extraThemes).forEach(function (theme) {
      preloadImage(extraThemes[theme].bg).catch(function () {});
    });
  }

  function setBackgroundFrame(background, config) {
    console.log("[theme-addons] setBackgroundFrame position:", config.position, "element:", background && background.tagName, "id:", background && background.id);
    var isImg = background.tagName === "IMG";
    if (isImg) {
      background.style.setProperty("object-fit", "cover", "important");
      background.style.setProperty("object-position", config.position, "important");
      background.style.setProperty("width", "100vw", "important");
      background.style.setProperty("height", "100vh", "important");
      background.style.setProperty("position", "fixed", "important");
      background.style.setProperty("top", "0", "important");
      background.style.setProperty("left", "0", "important");
      background.style.setProperty("margin", "0", "important");
      background.style.setProperty("padding", "0", "important");
      background.style.setProperty("z-index", "-1", "important");
    } else {
      background.style.setProperty("background-position", config.position, "important");
      background.style.setProperty("background-size", "auto 90%", "important");
      background.style.setProperty("background-repeat", "no-repeat", "important");
    }
    background.style.backgroundColor = config.color;
    background.style.setProperty("opacity", "1", "important");
  }

  function applyLoadedBackground(theme, config) {
    var requestId = ++backgroundRequestId;
    var background = findBackgroundNode();
    var layer = document.getElementById(theme + "-theme-layer");
    if (!background && layer) background = layer;
    if (!background) return;
    background.dataset.codexThemeBackground = "true";
    background.dataset.codexBackgroundPending = theme;
    setBackgroundFrame(background, config);

    preloadImage(config.bg).then(function () {
      var target = document.querySelector('[data-codex-background-pending="' + theme + '"]') || background;
      if (requestId !== backgroundRequestId || activeExtraTheme !== theme || !target) return;
      if (target.tagName === "IMG") {
        target.setAttribute("src", versionedAssetSrc(config.bg));
      } else {
        target.style.setProperty("background-image", 'url("' + versionedAssetSrc(config.bg) + '")', "important");
      }
      if (layer && theme === "golbang") {
        layer.style.backgroundImage = 'url("' + versionedAssetSrc(config.bg) + '")';
        layer.style.backgroundSize = "auto 90%";
        layer.style.backgroundPosition = config.position;
        layer.style.backgroundRepeat = "no-repeat";
      }
      target.removeAttribute("data-codex-background-pending");
      if (theme === "sinal") syncSinalAnchor();
    }).catch(function () {
      var target = document.querySelector('[data-codex-background-pending="' + theme + '"]') || background;
      if (requestId !== backgroundRequestId || !target) return;
      if (target.tagName === "IMG") {
        target.setAttribute("src", versionedAssetSrc(config.bg));
      } else {
        target.style.setProperty("background-image", 'url("' + versionedAssetSrc(config.bg) + '")', "important");
      }
      if (layer && theme === "golbang") {
        layer.style.backgroundImage = 'url("' + versionedAssetSrc(config.bg) + '")';
        layer.style.backgroundSize = "auto 90%";
        layer.style.backgroundPosition = config.position;
        layer.style.backgroundRepeat = "no-repeat";
      }
      target.removeAttribute("data-codex-background-pending");
      if (theme === "sinal") syncSinalAnchor();
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function getText(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function findBackgroundNode() {
    var marked = document.querySelector('[data-codex-theme-background="true"]');
    if (marked) return marked;
    var root = document.getElementById("root");
    if (!root) return null;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    function isBackgroundSize(rect) {
      return rect.width >= vw * 0.7 && rect.height >= vh * 0.7;
    }

    var divNodes = Array.from(root.querySelectorAll("div"));
    var bgDiv = divNodes.find(function (node) {
      var bg = node.style && node.style.backgroundImage;
      return bg && bg.indexOf("assets/back_") !== -1 && isBackgroundSize(node.getBoundingClientRect());
    }) || divNodes.find(function (node) {
      var computed = window.getComputedStyle(node);
      return computed.backgroundImage && computed.backgroundImage !== "none" && isBackgroundSize(node.getBoundingClientRect());
    });
    if (bgDiv) return bgDiv;

    var imgNodes = Array.from(root.querySelectorAll("img")).filter(function (node) {
      return node.getAttribute("alt") !== "altar";
    });
    var bgImg = imgNodes.find(function (node) {
      var src = (node.getAttribute("src") || "");
      return src.indexOf("back_") !== -1;
    }) || imgNodes.find(function (node) {
      var computed = window.getComputedStyle(node);
      return computed.objectFit === "cover" && isBackgroundSize(node.getBoundingClientRect());
    }) || imgNodes.find(function (node) {
      return isBackgroundSize(node.getBoundingClientRect());
    });
    return bgImg || null;
  }

  function createLayers() {
    var root = document.getElementById("root");
    if (!root) return;
    if (!document.getElementById("gethsemane-darkness-overlay")) {
      var gethsemaneOverlay = document.createElement("div");
      gethsemaneOverlay.id = "gethsemane-darkness-overlay";
      gethsemaneOverlay.setAttribute("aria-hidden", "true");
      document.body.insertBefore(gethsemaneOverlay, root);
    }
    Object.keys(extraThemes).forEach(function (theme) {
      var id = theme + "-theme-layer";
      if (document.getElementById(id)) return;
      var layer = document.createElement("div");
      layer.id = id;
      layer.setAttribute("aria-hidden", "true");
      if (theme === "sinal") {
        ["left", "right"].forEach(function (side) {
          var cloud = document.createElement("span");
          cloud.className = "sinal-top-cloud sinal-top-cloud-" + side;
          layer.appendChild(cloud);
        });
      }
      document.body.insertBefore(layer, root);
    });

    removeSinalStormLayer();
  }

  function parseCssLength(value, axisSize) {
    var input = String(value || "").trim();
    if (!input || input === "center") return axisSize * 0.5;
    if (input === "top" || input === "left") return 0;
    if (input === "bottom" || input === "right") return axisSize;
    if (input.indexOf("calc(") === 0) {
      input = input.slice(5, -1).replace(/\s+/g, "");
      var match = input.match(/^(-?\d+(?:\.\d+)?)%([+-])(-?\d+(?:\.\d+)?)(vh|vw|px)$/);
      if (match) {
        var base = axisSize * (parseFloat(match[1]) / 100);
        var amount = parseFloat(match[3]);
        var unit = match[4];
        var delta = unit === "vh" ? window.innerHeight * amount / 100 : unit === "vw" ? window.innerWidth * amount / 100 : amount;
        return match[2] === "-" ? base - delta : base + delta;
      }
    }
    if (input.indexOf("%") !== -1) return axisSize * parseFloat(input) / 100;
    if (input.indexOf("vh") !== -1) return window.innerHeight * parseFloat(input) / 100;
    if (input.indexOf("vw") !== -1) return window.innerWidth * parseFloat(input) / 100;
    if (input.indexOf("px") !== -1 || /^-?\d/.test(input)) return parseFloat(input);
    return axisSize * 0.5;
  }

  function getBackgroundPositionParts(position) {
    var parts = String(position || "center center").trim().match(/calc\([^)]+\)|[^\s]+/g) || ["center", "center"];
    if (parts.length === 1) parts.push("center");
    return parts;
  }

  function syncSinalAnchor() {
    if (activeExtraTheme !== "sinal") return;
    var layer = document.getElementById("sinal-theme-layer");
    var background = findBackgroundNode();
    if (!layer || !background) return;
    var rect = background.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var scale = Math.max(rect.width / sinalBackgroundSize.width, rect.height / sinalBackgroundSize.height);
    var renderedWidth = sinalBackgroundSize.width * scale;
    var renderedHeight = sinalBackgroundSize.height * scale;
    var position = getBackgroundPositionParts(background.style.backgroundPosition || getComputedStyle(background).backgroundPosition);
    var offsetX = parseCssLength(position[0], rect.width - renderedWidth);
    var offsetY = parseCssLength(position[1], rect.height - renderedHeight);
    var peakX = rect.left + offsetX + renderedWidth * sinalPeakAnchor.x;
    var peakY = rect.top + offsetY + renderedHeight * sinalPeakAnchor.y;
    layer.style.setProperty("--sinal-peak-x", peakX.toFixed(2) + "px");
    layer.style.setProperty("--sinal-peak-y", peakY.toFixed(2) + "px");
    layer.style.setProperty("--sinal-bg-scale", scale.toFixed(4));
  }

  function removeSinalStormLayer() {
    var layer = document.getElementById("sinal-lightning-layer");
    if (layer) layer.remove();
  }

  function isGethsemaneActive() {
    return document.body.classList.contains("codex-theme-gethsemane") ||
      document.body.dataset.currentTheme === "겟세마네 동산";
  }

  function removeGethsemaneSkyEffects() {
    if (!isGethsemaneActive()) return;
    [
      ".gethsemane-atmosphere-dim",
      ".gethsemane-haze-layer",
      ".gethsemane-wind-layer",
      ".gethsemane-star-layer",
      ".gethsemane-altar-dim",
      ".night-shooting-stars"
    ].forEach(function (selector) {
      Array.from(document.querySelectorAll(selector)).forEach(function (node) {
        node.setAttribute("aria-hidden", "true");
        node.style.setProperty("display", "none", "important");
        node.style.setProperty("opacity", "0", "important");
        node.style.setProperty("animation", "none", "important");
        node.style.setProperty("transition", "none", "important");
        node.style.setProperty("filter", "none", "important");
        node.style.setProperty("backdrop-filter", "none", "important");
        node.style.setProperty("-webkit-backdrop-filter", "none", "important");
        if (node.getAnimations) {
          node.getAnimations({ subtree: true }).forEach(function (animation) {
            animation.cancel();
          });
        }
        Array.from(node.querySelectorAll("*")).forEach(function (child) {
          child.style.setProperty("display", "none", "important");
          child.style.setProperty("opacity", "0", "important");
          child.style.setProperty("animation", "none", "important");
          child.style.setProperty("transition", "none", "important");
          child.style.setProperty("filter", "none", "important");
          child.style.setProperty("backdrop-filter", "none", "important");
          child.style.setProperty("-webkit-backdrop-filter", "none", "important");
        });
      });
    });
  }

  function clearGethsemaneCleanupTimers() {
    gethsemaneCleanupTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    gethsemaneCleanupTimers = [];
  }

  function scheduleGethsemaneCleanup() {
    clearGethsemaneCleanupTimers();
    [0, 120].forEach(function (delay) {
      gethsemaneCleanupTimers.push(window.setTimeout(removeGethsemaneSkyEffects, delay));
    });
  }

  function seedLayer(layerId, className, count, options) {
    var layer = document.getElementById(layerId);
    var seedAttribute = "data-seeded-" + className;
    if (!layer || layer.hasAttribute(seedAttribute)) return;
    layer.setAttribute(seedAttribute, "true");
    for (var i = 0; i < count; i += 1) {
      var dot = document.createElement("span");
      dot.className = className;
      dot.style.setProperty("--x", (options.xMin + Math.random() * (options.xMax - options.xMin)).toFixed(2) + "%");
      dot.style.setProperty("--y", (options.yMin + Math.random() * (options.yMax - options.yMin)).toFixed(2) + "%");
      dot.style.setProperty("--size", (options.sizeMin + Math.random() * (options.sizeMax - options.sizeMin)).toFixed(2) + "px");
      dot.style.setProperty("--duration", (options.durationMin + Math.random() * (options.durationMax - options.durationMin)).toFixed(2) + "s");
      dot.style.setProperty("--delay", (-Math.random() * options.delayMax).toFixed(2) + "s");
      if (options.widthMin) dot.style.setProperty("--w", (options.widthMin + Math.random() * (options.widthMax - options.widthMin)).toFixed(2) + "px");
      if (options.heightMin) dot.style.setProperty("--h", (options.heightMin + Math.random() * (options.heightMax - options.heightMin)).toFixed(2) + "px");
      if (options.windXMin) dot.style.setProperty("--wind-x", (options.windXMin + Math.random() * (options.windXMax - options.windXMin)).toFixed(2) + "px");
      if (options.windYMin) dot.style.setProperty("--wind-y", (options.windYMin + Math.random() * (options.windYMax - options.windYMin)).toFixed(2) + "px");
      layer.appendChild(dot);
    }
  }

  function isPrayerActive() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      var label = getText(button);
      return label.indexOf("기도 중") !== -1 || label.indexOf("기도중") !== -1;
    });
  }

  function syncPrayerState() {
    var prayerState = isPrayerActive() ? "praying" : "waiting";
    var gethsemaneActive = isGethsemaneActive();
    document.body.dataset.prayerState = prayerState;
    if (gethsemaneActive && (prayerState !== lastPrayerState || gethsemaneActive !== lastGethsemaneActive)) {
      scheduleGethsemaneCleanup();
    } else if (!gethsemaneActive && lastGethsemaneActive) {
      clearGethsemaneCleanupTimers();
    }
    lastPrayerState = prayerState;
    lastGethsemaneActive = gethsemaneActive;
  }

  function seedEffects() {
    // seeded 플래그 제거: data-seeded-* 속성으로 중복 방지

    seedLayer("mark-theme-layer", "mark-dust", 34, {
      xMin: 4, xMax: 84, yMin: 14, yMax: 86, sizeMin: 1.2, sizeMax: 3.2, durationMin: 11, durationMax: 19, delayMax: 20,
      windXMin: 86, windXMax: 172, windYMin: -42, windYMax: -12
    });
    seedLayer("jonah-theme-layer", "jonah-particle", 36, {
      xMin: 4, xMax: 84, yMin: 12, yMax: 88, sizeMin: 1.3, sizeMax: 3.6, durationMin: 12, durationMax: 22, delayMax: 24,
      windXMin: 72, windXMax: 154, windYMin: -48, windYMax: -16
    });
    seedLayer("sinal-theme-layer", "sinal-mist", 5, {
      xMin: 0, xMax: 86, yMin: 50, yMax: 82, sizeMin: 1, sizeMax: 2, durationMin: 28, durationMax: 46, delayMax: 24, widthMin: 180, widthMax: 340, heightMin: 56, heightMax: 110
    });
    seedLayer("sinal-theme-layer", "sinal-air-dust", 14, {
      xMin: 8, xMax: 92, yMin: 14, yMax: 84, sizeMin: 0.8, sizeMax: 1.9, durationMin: 32, durationMax: 52, delayMax: 32
    });
    // 시내산 산지 먼지 (가까운 레이어)
    seedLayer("sinal-theme-layer", "sinal-mountain-dust-near", 50, {
      xMin: 2, xMax: 70, yMin: 6, yMax: 86, sizeMin: 2.5, sizeMax: 4.5, durationMin: 10, durationMax: 18, delayMax: 20,
      windXMin: 150, windXMax: 350, windYMin: -15, windYMax: 18
    });
    // 시내산 산지 먼지 (먼 레이어)
    seedLayer("sinal-theme-layer", "sinal-mountain-dust-far", 60, {
      xMin: 0, xMax: 80, yMin: 10, yMax: 90, sizeMin: 2, sizeMax: 3.5, durationMin: 14, durationMax: 24, delayMax: 24,
      windXMin: 100, windXMax: 280, windYMin: -12, windYMax: 14
    });
    // 은밀한 골방 은은한 빛 먼지
    seedLayer("golbang-theme-layer", "golbang-dust", 12, {
      xMin: 4, xMax: 92, yMin: 8, yMax: 88, sizeMin: 1, sizeMax: 2.5, durationMin: 14, durationMax: 24, delayMax: 20
    });
  }

  function updateThemeLabels(label) {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (!node.childElementCount && /^(은밀한 골방|사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(getText(node))) {
        node.textContent = label;
      }
    });
  }

  function watchThemeLabels(label) {
    var root = document.getElementById("root");
    if (!root) return;
    var observer = new MutationObserver(function () {
      updateThemeLabels(label);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  function updateMenuActive(theme) {
    Array.from(document.querySelectorAll("button[data-codex-theme]")).forEach(function (button) {
      button.classList.toggle("codex-theme-active", button.dataset.codexTheme === theme);
      button.toggleAttribute("aria-current", button.dataset.codexTheme === theme);
    });
    if (!theme) return;
    Array.from(document.querySelectorAll("button")).forEach(function (button) {
      if (button.dataset.codexTheme) return;
      var label = getText(button);
      if (!baseThemeLabels.some(function (themeLabel) { return label.indexOf(themeLabel) !== -1; })) return;
      button.classList.remove("bg-white/20", "text-amber-300");
      button.classList.add("text-white/70", "hover:bg-white/10", "hover:text-white");
      Array.from(button.querySelectorAll("div")).forEach(function (node) {
        var className = typeof node.className === "string" ? node.className : "";
        if (className.indexOf("bg-amber-400") !== -1) node.remove();
      });
    });
  }

  function clearScheduledWork() {
    cleanupTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    cleanupTimers = [];
  }

  function removeThemeEffectState() {
    ["mark", "jonah", "sinal", "golbang"].forEach(function (theme) {
      var layer = document.getElementById(theme + "-theme-layer");
      if (!layer) return;
      layer.removeAttribute("data-active");
      layer.removeAttribute("data-codex-background-pending");
    });
    allThemeClasses.forEach(function (className) {
      document.body.classList.remove(className);
    });
    document.body.removeAttribute("data-theme");
    document.body.removeAttribute("data-extra-theme");
    restoreReactBackground();
    var altarStage = document.querySelector(".codex-altar-stage");
    if (altarStage) {
      altarStage.style.removeProperty("transform");
    }
  }

  function markExtraThemeClass(theme) {
    allThemeClasses.forEach(function (className) {
      document.body.classList.remove(className);
    });
    if (themeClassByExtraTheme[theme]) document.body.classList.add(themeClassByExtraTheme[theme]);
  }

  function hideReactBackground() {
    var root = document.getElementById("root");
    if (!root) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    Array.from(root.querySelectorAll("div, img")).forEach(function (node) {
      if (node.tagName === "IMG" && node.getAttribute("alt") === "altar") return;
      var rect = node.getBoundingClientRect();
      var isLarge = rect.width >= vw * 0.5 && rect.height >= vh * 0.5;
      if (!isLarge) return;
      var computed = window.getComputedStyle(node);
      var isBackground = false;
      if (node.tagName === "DIV") {
        isBackground = computed.backgroundImage && computed.backgroundImage !== "none";
      } else if (node.tagName === "IMG") {
        var src = node.getAttribute("src") || "";
        isBackground = src.indexOf("back_") !== -1 || computed.objectFit === "cover";
      }
      if (isBackground) {
        node.dataset.codexHiddenBackground = "true";
        node.style.setProperty("opacity", "0", "important");
      }
    });
  }

  function restoreReactBackground() {
    document.querySelectorAll('[data-codex-hidden-background="true"]').forEach(function (node) {
      node.style.removeProperty("opacity");
      node.removeAttribute("data-codex-hidden-background");
    });
  }

  function closeThemeMenuSoon(sourceButton) {
    var menu = sourceButton && sourceButton.parentElement;
    var wrapper = menu && menu.parentElement;
    if (!wrapper) return;
    var toggle = Array.from(wrapper.children).find(function (node) {
      return node.tagName === "BUTTON" && !node.dataset.codexTheme && getText(node).length === 0;
    });
    if (!toggle) return;
    cleanupTimers.push(window.setTimeout(function () {
      toggle.click();
    }, 40));
  }

  function applyExtraTheme(theme) {
    var config = extraThemes[theme];
    if (!config) return;
    clearScheduledWork();
    removeThemeEffectState();
    activeExtraTheme = theme;
    document.body.dataset.theme = theme;
    document.body.dataset.currentTheme = config.label;
    document.body.removeAttribute("data-extra-theme");
    markExtraThemeClass(theme);
    document.body.style.backgroundColor = config.color;

    applyLoadedBackground(theme, config);
    if (theme === "golbang") {
      hideReactBackground();
      var altarStage = document.querySelector(".codex-altar-stage");
      if (altarStage) {
        altarStage.style.setProperty("transform", "translate(-50%, -50%) translateY(-20px) scale(0.85)", "important");
      }
    }

    cleanupTimers.push(window.setTimeout(function () {
      if (activeExtraTheme !== theme) return;
      var altar = document.querySelector('img[alt="altar"]');
      if (!altar) return;
      var altarSrc = (altar.getAttribute("src") || "").split("?")[0];
      if (altarSrc !== config.altar) altar.setAttribute("src", config.altar);
      altar.style.removeProperty("transform");
      altar.style.removeProperty("filter");
      altar.style.removeProperty("width");
      altar.style.removeProperty("max-width");
      altar.style.removeProperty("height");
      altar.style.removeProperty("max-height");
      altar.style.removeProperty("margin-left");
      altar.style.removeProperty("margin-right");
      altar.style.removeProperty("transition");
      altar.style.removeProperty("animation");
      fixAltarSize();
    }, THEME_SWAP_DELAY));

    updateThemeLabels(config.label);
    updateMenuActive(theme);
    syncPrayerState();
    if (theme === "sinal") {
      removeSinalStormLayer();
      syncSinalAnchor();
      window.setTimeout(syncSinalAnchor, 80);
      window.setTimeout(syncSinalAnchor, 260);
    }
    removeGethsemaneSkyEffects();
  }

  function clearExtraThemeSoon() {
    removeSinalStormLayer();
    clearScheduledWork();
    activeExtraTheme = "";
    updateMenuActive("");
    removeThemeEffectState();
    document.body.style.backgroundColor = "";
    cleanupTimers.push(window.setTimeout(function () {
      var background = document.querySelector('[data-codex-theme-background="true"]');
      if (background) {
        background.removeAttribute("data-codex-theme-background");
        background.removeAttribute("data-codex-background-pending");
      }
      var altar = document.querySelector('img[alt="altar"]');
      if (altar) {
        altar.style.removeProperty("filter");
        altar.style.removeProperty("width");
        altar.style.removeProperty("max-width");
        altar.style.removeProperty("margin-left");
        altar.style.removeProperty("margin-right");
      }
    }, 40));
  }

  function makeThemeButton(theme) {
    var config = extraThemes[theme];
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.codexTheme = theme;
    button.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white";
    button.innerHTML = '<span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;opacity:.78">' + (config.icon || '✦') + '</span><span>' + config.label + '</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      if (document.body.dataset.themeTransitioning === "true") return;
      document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: theme } }));
      closeThemeMenuSoon(button);
    });
    return button;
  }

  var menuOrderMap = {
    "은밀한 골방": 0,
    "사막의 제단": 1,
    "모세의 시내산": 2,
    "마가 다락방": 3,
    "여름 녹음": 4,
    "요나의 고래뱃속": 5,
    "어두운 밤": 6,
    "겟세마네 동산": 7
  };

  function reorderMenuButtons(menu) {
    if (!menu) return;
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    var buttons = Array.from(menu.querySelectorAll("button"));
    buttons.sort(function (a, b) {
      var labelA = getText(a);
      var labelB = getText(b);
      var orderA = 99, orderB = 99;
      Object.keys(menuOrderMap).forEach(function (key) {
        if (labelA.indexOf(key) !== -1) orderA = menuOrderMap[key];
        if (labelB.indexOf(key) !== -1) orderB = menuOrderMap[key];
      });
      var themeAttrA = a.dataset && a.dataset.codexTheme;
      var themeAttrB = b.dataset && b.dataset.codexTheme;
      if (themeAttrA && extraThemes[themeAttrA]) {
        orderA = menuOrderMap[extraThemes[themeAttrA].label] || 99;
      }
      if (themeAttrB && extraThemes[themeAttrB]) {
        orderB = menuOrderMap[extraThemes[themeAttrB].label] || 99;
      }
      return orderA - orderB;
    });
    buttons.forEach(function (button) {
      menu.appendChild(button);
    });
  }

  function restoreExtraThemeIcons(menu) {
    if (!menu) return;
    Object.keys(extraThemes).forEach(function (theme) {
      var config = extraThemes[theme];
      var button = Array.from(menu.querySelectorAll("button")).find(function (candidate) {
        return getText(candidate).indexOf(config.label) !== -1;
      });
      if (!button || !config.icon) return;
      var iconSlot = button.querySelector("span");
      if (!iconSlot) return;
      if (iconSlot.dataset.codexRestoredIcon === theme && iconSlot.querySelector("svg")) return;
      iconSlot.dataset.codexRestoredIcon = theme;
      iconSlot.style.width = "16px";
      iconSlot.style.height = "16px";
      iconSlot.style.display = "flex";
      iconSlot.style.alignItems = "center";
      iconSlot.style.justifyContent = "center";
      iconSlot.style.opacity = ".78";
      iconSlot.innerHTML = config.icon;
    });
  }

  function injectDisclaimer(menu) {
    if (!menu) return;
    var disclaimerId = "codex-ai-disclaimer";
    if (menu.querySelector("#" + disclaimerId)) return;
    var disclaimer = document.createElement("div");
    disclaimer.id = disclaimerId;
    disclaimer.className = "codex-ai-disclaimer";
    disclaimer.textContent = "일부 이미지·음악은 AI 도구를 활용해 제작되었습니다.";
    disclaimer.style.order = "100";
    menu.appendChild(disclaimer);
  }

  function injectMenuButtons() {
    if (injectingMenu) return;
    injectingMenu = true;
    var golbangButton = Array.from(document.querySelectorAll("button")).find(function (button) {
      return getText(button).indexOf("은밀한 골방") !== -1;
    });
    if (!golbangButton) {
      golbangButton = Array.from(document.querySelectorAll("button")).find(function (button) {
        return getText(button).indexOf("사막의 제단") !== -1;
      });
    }
    try {
      if (!golbangButton || !golbangButton.parentElement) return;
      var menu = golbangButton.parentElement;
      Object.keys(extraThemes).forEach(function (theme) {
        var label = extraThemes[theme].label;
        var hasNativeButton = Array.from(menu.querySelectorAll("button")).some(function (button) {
          return getText(button).indexOf(label) !== -1;
        });
        if (!hasNativeButton && !menu.querySelector('[data-codex-theme="' + theme + '"]')) {
          menu.appendChild(makeThemeButton(theme));
        }
      });
      reorderMenuButtons(menu);
      restoreExtraThemeIcons(menu);
      injectDisclaimer(menu);
      updateMenuActive(activeExtraTheme);
    } finally {
      injectingMenu = false;
    }
  }

  function scheduleMenuInjection() {
    [0, 40, 160, 420, 900, 1800].forEach(function (delay) {
      window.setTimeout(injectMenuButtons, delay);
    });
  }

  function fixCanvasSize() {
    document.querySelectorAll("canvas.absolute.inset-0").forEach(function (canvas) {
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.width = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    });
  }

  function fixAltarSize() {
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    var vw = document.documentElement.clientWidth;
    altar.style.setProperty("max-width", "760px", "important");
    altar.style.setProperty("max-height", "261.875px", "important");
    if (vw <= 900) {
      altar.style.setProperty("width", "min(84vw, 760px)", "important");
    } else {
      altar.style.removeProperty("width");
    }
    var wrapper = document.querySelector(".codex-altar-stage");
    if (wrapper) {
      wrapper.style.setProperty("max-width", "760px", "important");
    }
  }

  ready(function () {
    createLayers();
    preloadThemeImages();
    seedEffects();
    syncPrayerState();
    fixCanvasSize();
    fixAltarSize();
    window.addEventListener("resize", function () {
      syncSinalAnchor();
      fixCanvasSize();
      fixAltarSize();
    });
    scheduleMenuInjection();
    window.setTimeout(seedEffects, 800);
    window.setTimeout(seedEffects, 1800);
    applyExtraTheme("golbang");
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = getText(button);
      if (baseThemeLabels.some(function (themeLabel) { return label.indexOf(themeLabel) !== -1; })) {
        clearExtraThemeSoon();
      }
      if (label.length < 2 || label === "CCM") {
        scheduleMenuInjection();
    window.setTimeout(seedEffects, 800);
    window.setTimeout(seedEffects, 1800);
      }
      window.setTimeout(syncPrayerState, 40);
      window.setTimeout(syncPrayerState, 240);
      scheduleGethsemaneCleanup();
    });
    var root = document.getElementById("root");
    if (root) {
      /* MutationObserver removed to prevent React DOM conflict */
    }
    document.addEventListener("codex-extra-theme-change", function (event) {
      var theme = event.detail && event.detail.theme;
      if (theme && extraThemes[theme]) {
        clearScheduledWork();
        cleanupTimers.push(window.setTimeout(function () {
          applyExtraTheme(theme);
          document.dispatchEvent(new CustomEvent("codex-bgm-theme-change", { detail: { theme: theme } }));
        }, THEME_SWAP_DELAY));
        return;
      }
      if (!event.detail || event.detail.theme === "base") {
        clearExtraThemeSoon();
      }
    });
  });
})();
