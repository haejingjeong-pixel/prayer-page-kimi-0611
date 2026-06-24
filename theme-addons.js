(function () {
  "use strict";

  window.__codexUnifiedThemeController = true;

  var THEMES = {
    golbang: {
      id: "golbang",
      label: "은밀한 골방",
      background: "assets/back_golbang_new.webp",
      altar: "assets/b_golbang9.webp",
      bgm: "assets/X_golbang_ccm.mp3",
      layer: "golbang-theme-layer",
      bodyClass: "codex-theme-golbang",
      color: "#d6b99c",
      position: "center 23%",
      size: "auto 130%",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M2 14V6.5l6-4.5 6 4.5V14"/><path d="M6 14v-3.5h4V14"/><path d="M8 4V2"/><path d="M7 3h2"/></svg>'
    },
    desert: {
      id: "desert",
      label: "사막의 제단",
      background: "assets/back_dessert.webp",
      altar: "assets/g_dessert.webp",
      bgm: "assets/ccm_prayer.mp3",
      layer: "desert-theme-layer",
      bodyClass: "codex-theme-desert",
      color: "#b77c61",
      position: "center",
      size: "cover"
    },
    gethsemane: {
      id: "gethsemane",
      label: "겟세마네 동산",
      background: "assets/back_gathe3.webp",
      altar: "assets/g_dessert.webp",
      bgm: "assets/sound_gathe.mp3",
      layer: "gethsemane-theme-layer",
      bodyClass: "codex-theme-gethsemane",
      color: "#000000",
      position: "48.25% center",
      size: "cover"
    },
    night: {
      id: "night",
      label: "어두운 밤",
      background: "assets/back_night.webp",
      altar: "assets/b_night.webp",
      bgm: "assets/ccm_night5.mp3",
      layer: "night-theme-layer",
      bodyClass: "codex-theme-night",
      color: "#000114",
      position: "center",
      size: "cover"
    },
    summer: {
      id: "summer",
      label: "여름 녹음",
      background: "assets/back_woods7.webp",
      altar: "assets/b_woods.webp",
      bgm: "assets/Forest%20Prayer3.mp3",
      layer: "summer-theme-layer",
      bodyClass: "codex-theme-summer",
      color: "#091c1f",
      position: "center 70%",
      size: "cover"
    },
    mark: {
      id: "mark",
      label: "마가 다락방",
      background: "assets/back_mark.webp",
      altar: "assets/b_mark.webp",
      bgm: "assets/ccm_maga2.mp3",
      layer: "mark-theme-layer",
      bodyClass: "codex-theme-mark",
      color: "#3e2b21",
      position: "center 52%",
      size: "cover",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M2 14V7l6-5 6 5v7"/><path d="M6 14v-4h4v4"/></svg>'
    },
    jonah: {
      id: "jonah",
      label: "요나의 고래뱃속",
      background: "assets/back_jonah.webp",
      altar: "assets/b_jonah.webp",
      bgm: "assets/ccm_yona6.mp3",
      layer: "jonah-theme-layer",
      bodyClass: "codex-theme-jonah",
      color: "#000204",
      position: "center calc(50% - 8vh)",
      size: "cover",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M6 3.5l2 2.5 2-2.5"/><path d="M2 11.5c2-1 3-1 5 0s3 1 5 0"/><path d="M2 13c2-1 3-1 5 0s3 1 5 0"/><circle cx="13" cy="8" r=".5" fill="currentColor" stroke="none"/></svg>'
    },
    sinal: {
      id: "sinal",
      label: "모세의 시내산",
      background: "assets/back_sinal.webp",
      altar: "assets/b_sinal.webp",
      bgm: "assets/ccm_sinae.mp3",
      layer: "sinal-theme-layer",
      bodyClass: "codex-theme-sinal",
      color: "#536a83",
      position: "center calc(50% - 30vh)",
      size: "cover",
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M2 13l4.5-9 2 4"/><path d="M6.5 8l2.5-5 4 10"/><path d="M10 2l-1.5 2.5h2.5l-2 3"/></svg>'
    }
  };

  var THEME_ORDER = ["golbang", "desert", "sinal", "mark", "summer", "jonah", "night", "gethsemane"];
  var LABEL_TO_THEME = {};
  var CLASS_NAMES = THEME_ORDER.map(function (id) { return THEMES[id].bodyClass; });
  var activeTheme = "";
  var pendingTheme = "";
  var timers = [];

  THEME_ORDER.forEach(function (id) {
    LABEL_TO_THEME[THEMES[id].label] = id;
  });

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

  function normalizeThemeId(value) {
    if (THEMES[value]) return value;
    return LABEL_TO_THEME[value] || "";
  }

  function setLater(fn, delay) {
    var timer = window.setTimeout(fn, delay);
    timers.push(timer);
    return timer;
  }

  function clearTimers() {
    timers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    timers = [];
  }

  function ensureGolbangBackgroundImage(layer, theme) {
    if (!layer || theme.id !== "golbang") return;
    var img = layer.querySelector(".golbang-bg-img");
    if (!img) {
      img = document.createElement("img");
      img.className = "golbang-bg-img";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      layer.insertBefore(img, layer.firstChild);
    }
    if ((img.getAttribute("src") || "").split("?")[0] !== theme.background) {
      img.setAttribute("src", theme.background);
    }
  }

  function ensureLayer(theme) {
    var layer = document.getElementById(theme.layer);
    if (layer) {
      ensureGolbangBackgroundImage(layer, theme);
      return layer;
    }
    layer = document.createElement("div");
    layer.id = theme.layer;
    layer.setAttribute("aria-hidden", "true");
    layer.className = "codex-managed-theme-layer";
    ensureGolbangBackgroundImage(layer, theme);

    if (theme.id === "sinal") {
      ["left", "right"].forEach(function (side) {
        var cloud = document.createElement("span");
        cloud.className = "sinal-top-cloud sinal-top-cloud-" + side;
        layer.appendChild(cloud);
      });
      seedLayer(layer, "sinal-mist", 4, { xMin: 0, xMax: 86, yMin: 50, yMax: 82, sizeMin: 1, sizeMax: 2, durationMin: 42, durationMax: 64, delayMax: 30, widthMin: 170, widthMax: 300, heightMin: 50, heightMax: 92 });
      seedLayer(layer, "sinal-air-dust", 10, { xMin: 8, xMax: 92, yMin: 14, yMax: 84, sizeMin: 0.7, sizeMax: 1.6, durationMin: 48, durationMax: 76, delayMax: 38 });
    }

    if (theme.id === "mark") {
      seedLayer(layer, "mark-dust", 34, { xMin: 4, xMax: 84, yMin: 14, yMax: 86, sizeMin: 1.2, sizeMax: 3.2, durationMin: 11, durationMax: 19, delayMax: 20 });
    }

    if (theme.id === "jonah") {
      seedLayer(layer, "jonah-particle", 36, { xMin: 4, xMax: 84, yMin: 12, yMax: 88, sizeMin: 1.3, sizeMax: 3.6, durationMin: 12, durationMax: 22, delayMax: 24 });
    }

    if (theme.id === "golbang") {
      seedLayer(layer, "golbang-dust", 12, { xMin: 4, xMax: 92, yMin: 8, yMax: 88, sizeMin: 1, sizeMax: 2.5, durationMin: 14, durationMax: 24, delayMax: 20 });
    }

    if (theme.id === "gethsemane") {
      var darkness = document.createElement("div");
      darkness.id = "gethsemane-darkness-overlay";
      layer.appendChild(darkness);

      var front = document.createElement("div");
      front.className = "gethsemane-front-layer";
      layer.appendChild(front);

      var atmosphere = document.createElement("div");
      atmosphere.className = "gethsemane-atmosphere-dim";
      layer.appendChild(atmosphere);

      var haze = document.createElement("div");
      haze.className = "gethsemane-haze-layer";
      for (var hazeIndex = 0; hazeIndex < 3; hazeIndex += 1) {
        var hazeCloud = document.createElement("span");
        hazeCloud.style.setProperty("--left", (10 + hazeIndex * 20) + "%");
        hazeCloud.style.setProperty("--top", (64 + hazeIndex * 7) + "%");
        hazeCloud.style.setProperty("--w", (200 + hazeIndex * 54) + "px");
        hazeCloud.style.setProperty("--h", (60 + hazeIndex * 20) + "px");
        hazeCloud.style.setProperty("--duration", (24 + hazeIndex * 4) + "s");
        hazeCloud.style.setProperty("--delay", (-hazeIndex * 2.5) + "s");
        haze.appendChild(hazeCloud);
      }
      layer.appendChild(haze);

      var wind = document.createElement("div");
      wind.className = "gethsemane-wind-layer";
      for (var windIndex = 0; windIndex < 8; windIndex += 1) {
        var windLine = document.createElement("span");
        windLine.style.setProperty("--top", (54 + windIndex * 5) + "%");
        windLine.style.setProperty("--duration", (10 + windIndex * 1.4) + "s");
        windLine.style.setProperty("--delay", (-windIndex * 0.9) + "s");
        wind.appendChild(windLine);
      }
      layer.appendChild(wind);

      var stars = document.createElement("div");
      stars.className = "gethsemane-star-layer";
      seedLayer(stars, "gethsemane-star", 28, { xMin: 24, xMax: 78, yMin: 4, yMax: 46, sizeMin: 1, sizeMax: 2.8, durationMin: 3, durationMax: 7, delayMax: 8 });
      layer.appendChild(stars);
    }

    document.body.insertBefore(layer, document.getElementById("root"));
    return layer;
  }

  function seedLayer(layer, className, count, options) {
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
      layer.appendChild(dot);
    }
  }

  function ensureLayers() {
    THEME_ORDER.forEach(function (id) {
      ensureLayer(THEMES[id]);
    });
  }

  function pauseInactiveAnimations(activeId) {
    THEME_ORDER.forEach(function (id) {
      var theme = THEMES[id];
      var layer = document.getElementById(theme.layer);
      if (!layer) return;
      var active = id === activeId;
      layer.style.setProperty("display", active ? "block" : "none", "important");
      layer.style.setProperty("opacity", active ? "1" : "0", "important");
      layer.style.setProperty("pointer-events", "none", "important");
      layer.style.setProperty("animation-play-state", active ? "running" : "paused", "important");
      Array.from(layer.querySelectorAll("*")).forEach(function (node) {
        node.style.setProperty("animation-play-state", active ? "running" : "paused", "important");
      });
      if (!active) {
        layer.removeAttribute("data-active");
        layer.removeAttribute("data-codex-theme-background");
      }
    });
  }

  function getGolbangBackgroundFit() {
    var width = window.innerWidth || document.documentElement.clientWidth || 1024;
    if (width <= 390) return { position: "center 20%", size: "auto 118%" };
    if (width <= 480) return { position: "center 20%", size: "auto 122%" };
    if (width <= 768) return { position: "center 20%", size: "auto 126%" };
    return { position: "center 23%", size: "auto 130%" };
  }

  function getLayerFit(theme) {
    if (theme && theme.id === "golbang") return getGolbangBackgroundFit();
    return { position: theme.position, size: theme.size };
  }

  function applyLayer(theme) {
    var layer = ensureLayer(theme);
    var fit = getLayerFit(theme);
    layer.dataset.active = "true";
    layer.dataset.codexThemeBackground = "true";
    layer.style.setProperty("background-color", theme.color, "important");
    layer.style.setProperty("background-image", theme.id === "golbang" ? "none" : 'url("' + theme.background + '")', "important");
    layer.style.setProperty("background-position", fit.position, "important");
    layer.style.setProperty("background-size", fit.size, "important");
    layer.style.setProperty("background-repeat", "no-repeat", "important");
    layer.style.setProperty("display", "block", "important");
    layer.style.setProperty("opacity", "1", "important");
  }

  function cleanupReactThemeArtifacts(activeId) {
    var root = document.getElementById("root");
    if (!root) return;
    Array.from(root.querySelectorAll("div, img")).forEach(function (node) {
      if (node.tagName === "IMG" && node.getAttribute("alt") === "altar") return;
      if (node.closest && node.closest("button")) return;
      if (node.closest && node.closest(".codex-altar-stage")) return;
      var className = typeof node.className === "string" ? node.className : "";
      var preservePrayerEffect = /prayer-|summer-praying-|summer-holy-|summer-leaf|night-praying-|night-sacred-|night-star-|night-shooting|darknight-waiting|gethsemane-|sinal-|mark-|jonah-|golbang-/.test(className);
      if (preservePrayerEffect) return;
      var style = node.style || {};
      var src = node.getAttribute && (node.getAttribute("src") || "");
      var bg = style.backgroundImage || "";
      var shouldHide = src.indexOf("assets/back_") !== -1 || src.indexOf("/back_") !== -1 ||
        bg.indexOf("assets/back_") !== -1 || bg.indexOf("/back_") !== -1;
      if (shouldHide) {
        node.dataset.codexThemeSuppressed = activeId;
        node.style.setProperty("display", "none", "important");
        node.style.setProperty("opacity", "0", "important");
        node.style.setProperty("animation", "none", "important");
      }
    });
  }

  function clearSuppressedReactArtifacts() {
    document.querySelectorAll("[data-codex-theme-suppressed]").forEach(function (node) {
      node.style.removeProperty("display");
      node.style.removeProperty("opacity");
      node.style.removeProperty("animation");
      node.removeAttribute("data-codex-theme-suppressed");
    });
  }

  function updateBodyState(theme) {
    CLASS_NAMES.forEach(function (className) {
      document.body.classList.remove(className);
      document.documentElement.classList.remove(className);
    });
    document.body.classList.add(theme.bodyClass);
    document.documentElement.classList.add(theme.bodyClass);
    document.body.dataset.theme = theme.id;
    document.body.dataset.currentTheme = theme.label;
    document.body.style.backgroundColor = theme.color;
  }

  function updateAltar(theme) {
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    var base = (altar.getAttribute("src") || "").split("?")[0];
    if (base !== theme.altar) altar.setAttribute("src", theme.altar);
    altar.style.removeProperty("filter");
    altar.style.removeProperty("transition");
    markAltarStage(altar);
  }

  function markAltarStage(altar) {
    var node = altar && altar.parentElement;
    while (node && node.id !== "root") {
      var className = typeof node.className === "string" ? node.className : "";
      if (className.indexOf("left-1/2") !== -1 && className.indexOf("z-10") !== -1) {
        node.classList.add("codex-altar-stage");
        return;
      }
      node = node.parentElement;
    }
  }

  function updateLabels(theme) {
    var themeLabels = THEME_ORDER.map(function (id) { return THEMES[id].label; });
    Array.from(document.querySelectorAll("#root span, #root div, #root p")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (node.childElementCount) return;
      if (themeLabels.indexOf(getText(node)) !== -1) node.textContent = theme.label;
    });
  }

  function findThemeIdFromButton(button) {
    if (!button) return "";
    var explicit = button.dataset && normalizeThemeId(button.dataset.codexTheme);
    if (explicit) return explicit;
    var label = getText(button);
    var found = "";
    Object.keys(LABEL_TO_THEME).some(function (themeLabel) {
      if (label.indexOf(themeLabel) === -1) return false;
      found = LABEL_TO_THEME[themeLabel];
      return true;
    });
    return found;
  }

  function bindThemeButton(button) {
    var id = findThemeIdFromButton(button);
    if (!id || !button.dataset) return;
    button.dataset.codexTheme = id;
    button.setAttribute("type", "button");
  }

  function injectAiDisclaimer() {
    var menus = document.querySelectorAll('div[class*="bg-black/60"], div[class*="backdrop-blur-md"], .codex-theme-menu');
    Array.from(menus).forEach(function (menu) {
      if (menu.querySelector(".codex-ai-disclaimer")) return;
      if (!menu.querySelector('button[data-codex-theme]')) return;
      var disclaimer = document.createElement("p");
      disclaimer.className = "codex-ai-disclaimer";
      disclaimer.textContent = "이 페이지는 AI로 제작되었습니다.";
      menu.appendChild(disclaimer);
    });
  }

  function updateMenuButtons() {
    Array.from(document.querySelectorAll("button")).forEach(bindThemeButton);
    var anchor = Array.from(document.querySelectorAll("button")).find(function (button) {
      return getText(button).indexOf("은밀한 골방") !== -1 || getText(button).indexOf("사막의 제단") !== -1;
    });
    if (!anchor || !anchor.parentElement) return;
    var menu = anchor.parentElement;
    THEME_ORDER.forEach(function (id) {
      var exists = Array.from(menu.querySelectorAll("button")).some(function (button) {
        return findThemeIdFromButton(button) === id;
      });
      if (!exists) menu.appendChild(createThemeButton(id));
    });
  }

  function createThemeButton(id) {
    var theme = THEMES[id];
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.codexTheme = id;
    button.dataset.codexAddedTheme = "true";
    button.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white";
    button.innerHTML = '<span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;opacity:.78">' + (theme.icon || "✦") + '</span><span>' + theme.label + '</span>';
    return button;
  }

  function updateMenuActive(themeId) {
    Array.from(document.querySelectorAll("button")).forEach(function (button) {
      var buttonTheme = findThemeIdFromButton(button);
      if (!buttonTheme) return;
      var isActive = buttonTheme === themeId;
      button.dataset.codexTheme = buttonTheme;
      button.classList.toggle("codex-theme-active", isActive);
      button.toggleAttribute("aria-current", isActive);
      button.classList.remove("bg-white/20", "text-amber-300");
      if (isActive) {
        button.classList.remove("text-white/70", "hover:bg-white/10", "hover:text-white");
        button.classList.add("bg-white/20", "text-amber-300");
      } else {
        button.classList.add("text-white/70", "hover:bg-white/10", "hover:text-white");
      }
    });
  }

  function ensurePrayerSaveNotice() {
    Array.from(document.querySelectorAll("h3")).forEach(function (title) {
      if (getText(title) !== "기도문 작성") return;
      var header = title.parentElement;
      var panel = header && header.parentElement;
      if (!panel || panel.querySelector(".prayer-save-notice")) return;
      var notice = document.createElement("p");
      notice.className = "prayer-save-notice";
      notice.textContent = "작성한 기도문은 따로 저장되지 않습니다.";
      var divider = header.nextElementSibling;
      if (divider && divider.parentElement === panel) {
        divider.insertAdjacentElement("afterend", notice);
      } else {
        header.insertAdjacentElement("afterend", notice);
      }
    });
  }

  function syncPrayerStateFromButtons() {
    var praying = Array.from(document.querySelectorAll("button")).some(function (button) {
      return getText(button) === "기도 중...";
    });
    document.body.dataset.prayerState = praying ? "praying" : "waiting";
  }

  function closeThemeMenu(sourceButton) {
    var menu = sourceButton && sourceButton.parentElement;
    var wrapper = menu && menu.parentElement;
    if (!wrapper) return;
    var toggle = Array.from(wrapper.children).find(function (node) {
      return node.tagName === "BUTTON" && getText(node).length === 0 && !findThemeIdFromButton(node);
    });
    if (toggle) setLater(function () { toggle.click(); }, 30);
  }

  function switchBgm(theme) {
    document.dispatchEvent(new CustomEvent("codex-bgm-theme-change", { detail: { theme: theme.id } }));
  }

  function commitTheme(theme) {
    clearSuppressedReactArtifacts();
    pauseInactiveAnimations("");
    updateBodyState(theme);
    applyLayer(theme);
    pauseInactiveAnimations(theme.id);
    updateAltar(theme);
    updateLabels(theme);
    updateMenuButtons();
    updateMenuActive(theme.id);
    cleanupReactThemeArtifacts(theme.id);
    switchBgm(theme);
    activeTheme = theme.id;
    pendingTheme = "";
    window.dispatchEvent(new CustomEvent("codex-theme-applied", { detail: { theme: theme.id, label: theme.label } }));
  }

  function applyTheme(themeId, options) {
    var theme = THEMES[themeId] || THEMES.golbang;
    if ((!options || !options.silent) && activeTheme === theme.id && !pendingTheme) return;
    if ((!options || !options.silent) && typeof window.codexIsThemeTransitioning === "function" && window.codexIsThemeTransitioning()) return;
    if (pendingTheme === theme.id && activeTheme === theme.id) return;
    pendingTheme = theme.id;
    clearTimers();
    if (options && options.silent) {
      commitTheme(theme);
      return;
    }

    if (typeof window.codexRunThemeFadeTransition === "function") {
      window.codexRunThemeFadeTransition(function () {
        commitTheme(theme);
      });
      return;
    }

    commitTheme(theme);
  }

  function handleThemeClick(event) {
    var button = event.target && event.target.closest ? event.target.closest("button") : null;
    if (!button) return;
    var themeId = findThemeIdFromButton(button);
    if (!themeId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (themeId !== activeTheme) applyTheme(themeId);
    closeThemeMenu(button);
  }

  function installObservers() {
    document.addEventListener("click", handleThemeClick, true);
    document.addEventListener("codex-extra-theme-change", function (event) {
      var id = normalizeThemeId(event.detail && event.detail.theme);
      if (THEMES[id]) applyTheme(id);
    });
    var root = document.getElementById("root");
    if (!root) return;
    var scheduled = false;
    new MutationObserver(function (mutations) {
      if (scheduled) return;
      var needsMenuUpdate = false;
      var needsCleanup = false;
      mutations.some(function (mutation) {
        return Array.from(mutation.addedNodes || []).some(function (node) {
          if (!node || node.nodeType !== 1) return false;
          var element = node;
          var text = getText(element);
          var style = element.getAttribute && (element.getAttribute("style") || "");
          var src = element.getAttribute && (element.getAttribute("src") || "");
          var className = typeof element.className === "string" ? element.className : "";
          if (element.tagName === "BUTTON" || element.querySelector && element.querySelector("button")) needsMenuUpdate = true;
          if (text.indexOf("기도문 작성") !== -1 || element.tagName === "H3") needsMenuUpdate = true;
          if (style.indexOf("assets/back_") !== -1 || style.indexOf("/back_") !== -1 || src.indexOf("assets/back_") !== -1 || src.indexOf("/back_") !== -1) needsCleanup = true;
          if (/absolute z-0/.test(className) && style.indexOf("background-image") !== -1) needsCleanup = true;
          return needsMenuUpdate && needsCleanup;
        });
      });
      syncPrayerStateFromButtons();
      if (!needsMenuUpdate && !needsCleanup) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        if (needsMenuUpdate) {
          updateMenuButtons();
          updateMenuActive(activeTheme || document.body.dataset.theme || "golbang");
          ensurePrayerSaveNotice();
        }
        if (activeTheme) {
          updateAltar(THEMES[activeTheme]);
          if (needsCleanup) cleanupReactThemeArtifacts(activeTheme);
        }
      });
    }).observe(root, { childList: true, subtree: true });
  }

  function installResponsiveLayerResize() {
    var timer = 0;
    window.addEventListener("resize", function () {
      if (!activeTheme || !THEMES[activeTheme]) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        applyLayer(THEMES[activeTheme]);
      }, 80);
    });
  }

  function init() {
    ensureLayers();
    updateMenuButtons();
    installObservers();
    installResponsiveLayerResize();
    applyTheme(document.body.dataset.theme || "golbang", { silent: true });
    ensurePrayerSaveNotice();
    syncPrayerStateFromButtons();
    injectIphoneMuteGuide();
    window.setInterval(injectAiDisclaimer, 500);
    window.setInterval(injectIphoneMuteGuide, 500);
  }

  /* ==========================================================================
     [아이폰 무음 안낸문] 번들에 없는 UI 스크립트로 강제 동적 주입 (DOM 생성)
     ========================================================================== */
  function injectIphoneMuteGuide() {
    if (document.querySelector('.iphone-mute-guide')) return;

    const guideDiv = document.createElement('div');
    guideDiv.className = 'iphone-mute-guide';
    guideDiv.innerHTML = `
      <p>아이폰 유저분들은 무음 모드(진동 스위치)를</p>
      <p>해제하셔야 배경음악과 기도 소리가 정상적으로 들립니다.</p>
    `;
    guideDiv.style.cssText = `
      display: block !important;
      visibility: visible !important;
      position: fixed !important;
      right: calc(18px + env(safe-area-inset-right, 0px)) !important;
      bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important;
      z-index: 99999 !important;
      max-width: min(280px, calc(100vw - 36px)) !important;
      margin: 0 !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      color: rgba(255, 246, 230, 0.72) !important;
      text-align: right !important;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35) !important;
      opacity: 0.72 !important;
      pointer-events: none !important;
      user-select: none !important;
    `;

    const root = document.getElementById('root') || document.body;
    root.appendChild(guideDiv);
  }

  window.codexApplyTheme = applyTheme;
  window.codexThemeConfig = THEMES;

  ready(init);
})();


/* ==========================================================================
   [UI 동적 주입] 아이폰 무음 안낸문 & AI 안낸문 세트 강제 생성
   ========================================================================== */
(function() {
  const body = document.body;

  // 1. 아이폰 무음 안낸문: .fullscreen-guide 요소를 찾거나 생성한 뒤 내용 항상 교체
  let guide = document.querySelector('.fullscreen-guide');
  if (!guide) {
    guide = document.createElement('div');
    guide.className = 'fullscreen-guide';
    body.appendChild(guide);
  }
  guide.innerHTML = `
    <p>아이폰 유저분들은 무음 모드(진동 스위치)를</p>
    <p>해제하셔야 배경음악과 기도 소리가 정상적으로 들립니다.</p>
  `;
  guide.style.cssText = `
    display: block !important; visibility: visible !important; position: fixed !important;
    right: calc(18px + env(safe-area-inset-right, 0px)) !important;
    bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important;
    z-index: 99999 !important; max-width: min(280px, calc(100vw - 36px)) !important;
    margin: 0 !important; font-size: 12px !important; line-height: 1.4 !important;
    color: rgba(255, 246, 230, 0.72) !important; text-align: right !important;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35) !important; opacity: 0.72 !important;
    pointer-events: none !important; user-select: none !important;
  `;

  // 2. AI 안낸문 주입 (테마 메뉴 하단, 없으면 생성)
  function injectAiDisclaimerForce() {
    const menu = document.querySelector('.theme-menu, [data-theme-menu], .codex-theme-menu') || document.getElementById('root') || body;
    if (menu.querySelector('.ai-disclaimer, .codex-ai-disclaimer')) return;
    const ai = document.createElement('div');
    ai.className = 'ai-disclaimer';
    ai.innerHTML = '<p>이 페이지는 AI로 제작되었습니다.</p>';
    ai.style.cssText = `
      display: block !important; visibility: visible !important;
      padding: 10px 14px !important; font-size: 11px !important;
      color: rgba(255, 246, 230, 0.55) !important; text-align: center !important;
      opacity: 0.55 !important; pointer-events: none !important; user-select: none !important;
    `;
    menu.appendChild(ai);
  }
  injectAiDisclaimerForce();
  setInterval(injectAiDisclaimerForce, 500);
})();
