(function () {
  "use strict";

  var extraThemes = {
    mark: {
      label: "마가 다락방",
      bg: "assets/back_mark.webp",
      altar: "assets/b_mark.webp",
      color: "#3e2b21",
      position: "center 52%",
      waitingFilter: "brightness(1.02) saturate(1.02) drop-shadow(0 18px 34px rgba(55, 30, 18, 0.34))",
      prayingFilter: "brightness(1.12) saturate(1.06) drop-shadow(0 0 22px rgba(255, 190, 105, 0.28))"
    },
    jonah: {
      label: "요나의 고래뱃속",
      bg: "assets/back_jonah.webp",
      altar: "assets/b_jonah.webp",
      color: "#010d12",
      position: "center 52%",
      waitingFilter: "brightness(0.92) saturate(0.92) drop-shadow(0 18px 34px rgba(0, 16, 20, 0.46))",
      prayingFilter: "brightness(1.08) saturate(1.02) drop-shadow(0 0 20px rgba(40, 220, 220, 0.24))"
    },
    sinal: {
      label: "모세의 시내산",
      bg: "assets/back_sinal.webp",
      altar: "assets/b_sinal.webp",
      color: "#536a83",
      gradient: "linear-gradient(to bottom, #3a7296 50%, #2a3a4d 50%)",
      position: "center 48%",
      waitingFilter: "brightness(1.0) saturate(0.95) drop-shadow(0 18px 34px rgba(50, 70, 96, 0.32))",
      prayingFilter: "brightness(1.13) saturate(1.0) drop-shadow(0 0 24px rgba(255, 214, 160, 0.30))"
    }
  };

  var baseThemeLabels = ["사막의 제단", "겟세마네 동산", "어두운 밤", "여름 녹음"];
  var activeExtraTheme = "";
  var seeded = false;

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
    var nodes = Array.from(document.querySelectorAll("#root div"));
    return nodes.find(function (node) {
      var bg = node.style && node.style.backgroundImage;
      return bg && bg.indexOf("assets/back_") !== -1;
    }) || nodes.find(function (node) {
      var style = node.style || {};
      return style.backgroundSize === "cover" || style.backgroundPosition;
    }) || null;
  }

  function createLayers() {
    var root = document.getElementById("root");
    if (!root) return;
    Object.keys(extraThemes).forEach(function (theme) {
      var id = theme + "-theme-layer";
      if (document.getElementById(id)) return;
      var layer = document.createElement("div");
      layer.id = id;
      layer.setAttribute("aria-hidden", "true");
      if (theme === "sinal") {
        var lightning = document.createElement("span");
        lightning.className = "sinal-lightning";
        layer.appendChild(lightning);
      }
      document.body.insertBefore(layer, root);
    });
  }

  function seedLayer(layerId, className, count, options) {
    var layer = document.getElementById(layerId);
    if (!layer || layer.dataset.seeded === "true") return;
    layer.dataset.seeded = "true";
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

  function seedEffects() {
    if (seeded) return;
    seeded = true;
    seedLayer("mark-theme-layer", "mark-dust", 24, {
      xMin: 12, xMax: 88, yMin: 18, yMax: 78, sizeMin: 1.4, sizeMax: 3.3, durationMin: 9, durationMax: 16, delayMax: 10
    });
    seedLayer("jonah-theme-layer", "jonah-particle", 28, {
      xMin: 10, xMax: 90, yMin: 16, yMax: 86, sizeMin: 1.5, sizeMax: 4.2, durationMin: 11, durationMax: 21, delayMax: 14
    });
    seedLayer("sinal-theme-layer", "sinal-mist", 5, {
      xMin: 0, xMax: 86, yMin: 50, yMax: 82, sizeMin: 1, sizeMax: 2, durationMin: 15, durationMax: 26, delayMax: 12, widthMin: 180, widthMax: 340, heightMin: 56, heightMax: 110
    });
  }

  function isPrayerActive() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      return getText(button).indexOf("기도 중...") !== -1;
    });
  }

  function updateThemeLabels(label) {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (!node.childElementCount && /^(사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(getText(node))) {
        node.textContent = label;
      }
    });
  }

  function updateMenuActive(theme) {
    Array.from(document.querySelectorAll("button[data-codex-theme]")).forEach(function (button) {
      button.classList.toggle("codex-theme-active", button.dataset.codexTheme === theme);
    });
  }

  function applyExtraTheme(theme) {
    var config = extraThemes[theme];
    if (!config) return;
    activeExtraTheme = theme;
    document.body.dataset.theme = theme;
    document.body.classList.add("codex-theme-" + theme);
    if (config.gradient) {
      document.body.style.setProperty("background", config.gradient, "important");
    } else {
      document.body.style.backgroundColor = config.color;
    }

    var background = findBackgroundNode();
    if (background) {
      background.dataset.codexThemeBackground = "true";
      background.style.backgroundImage = 'url("' + config.bg + '")';
      background.style.backgroundPosition = config.position;
      if (!config.gradient) {
        background.style.backgroundColor = config.color;
      }
      background.style.opacity = "1";
    }

    var altar = document.querySelector('img[alt="altar"]');
    if (altar) {
      var reloadSrc = config.altar + "?reload=" + Date.now();
      if (altar.getAttribute("src") !== reloadSrc) altar.setAttribute("src", reloadSrc);
      altar.style.removeProperty("transform");
      altar.style.filter = isPrayerActive() ? config.prayingFilter : config.waitingFilter;
      altar.style.setProperty("width", "90%", "important");
      altar.style.setProperty("max-width", "774px", "important");
      altar.style.setProperty("min-width", "558px", "important");
      altar.style.setProperty("margin-left", "auto", "important");
      altar.style.setProperty("margin-right", "auto", "important");
      altar.style.setProperty("position", "relative", "important");
      altar.style.setProperty("object-position", "center bottom", "important");
      altar.style.setProperty("display", "block", "important");
    }

    updateThemeLabels(config.label);
    updateMenuActive(theme);
    window.setTimeout(function () {
      if (activeExtraTheme === theme) applyExtraTheme(theme);
    }, 160);
  }

  function clearExtraThemeSoon() {
    activeExtraTheme = "";
    updateMenuActive("");
    document.body.removeAttribute("data-theme");
    document.body.style.backgroundColor = "";
    document.body.style.removeProperty("background");
    document.body.classList.remove("codex-theme-mark", "codex-theme-jonah", "codex-theme-sinal");
    Array.from(document.querySelectorAll("[data-codex-verse-overlay]")).forEach(function (node) {
      node.style.removeProperty("text-shadow");
      node.style.removeProperty("background");
      node.style.removeProperty("border-radius");
      node.style.removeProperty("padding");
      node.removeAttribute("data-codex-verse-overlay");
    });
    window.setTimeout(function () {
      var background = document.querySelector('[data-codex-theme-background="true"]');
      if (background) {
        background.removeAttribute("data-codex-theme-background");
        background.style.removeProperty("background-image");
        background.style.removeProperty("background-position");
        background.style.removeProperty("background-color");
        background.style.removeProperty("opacity");
      }
      var altar = document.querySelector('img[alt="altar"]');
      if (altar) {
        altar.style.removeProperty("filter");
        altar.style.removeProperty("width");
        altar.style.removeProperty("max-width");
        altar.style.removeProperty("min-width");
        altar.style.removeProperty("margin-left");
        altar.style.removeProperty("margin-right");
        altar.style.removeProperty("position");
        altar.style.removeProperty("object-position");
        altar.style.removeProperty("display");
      }
    }, 40);
  }

  function makeThemeButton(theme) {
    var config = extraThemes[theme];
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.codexTheme = theme;
    button.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white";
    button.innerHTML = '<span style="width:16px;text-align:center;color:white;opacity:1">✦</span><span>' + config.label + '</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      applyExtraTheme(theme);
    });
    return button;
  }

  function injectMenuButtons() {
    var desertButton = Array.from(document.querySelectorAll("button")).find(function (button) {
      return getText(button).indexOf("사막의 제단") !== -1;
    });
    if (!desertButton || !desertButton.parentElement) return;
    var menu = desertButton.parentElement;
    Object.keys(extraThemes).forEach(function (theme) {
      if (!menu.querySelector('[data-codex-theme="' + theme + '"]')) {
        menu.appendChild(makeThemeButton(theme));
      }
    });
    updateMenuActive(activeExtraTheme);
  }

  function scheduleMenuInjection() {
    [40, 160, 420, 900].forEach(function (delay) {
      window.setTimeout(injectMenuButtons, delay);
    });
  }

  ready(function () {
    createLayers();
    seedEffects();
    scheduleMenuInjection();
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = getText(button);
      if (baseThemeLabels.some(function (themeLabel) { return label.indexOf(themeLabel) !== -1; })) {
        clearExtraThemeSoon();
      }
      if (label.length < 2 || label === "CCM") {
        scheduleMenuInjection();
      }
    });
  });
})();
