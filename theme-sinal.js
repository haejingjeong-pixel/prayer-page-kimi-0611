(function () {
  "use strict";

  var SINAL = {
    label: "모세의 시내산",
    background: "assets/back_sinal.webp",
    altar: "assets/b_sinal.webp",
    color: "#536a83",
    position: "center calc(50% - 30vh)"
  };
  var BASE_LABELS = ["은밀한 골방", "사막의 제단", "겟세마네 동산", "어두운 밤", "여름 녹음"];
  var active = false;
  var injectScheduled = false;

  function text(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function isPrayerActive() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      return text(button).indexOf("기도 중...") !== -1;
    });
  }

  function findBackgroundNode() {
    return Array.from(document.querySelectorAll("#root div")).find(function (node) {
      var style = node.style || {};
      return style.backgroundImage && style.backgroundSize === "cover";
    }) || null;
  }

  function ensureLayer() {
    if (document.getElementById("sinal-theme-soft-layer")) return;
    var layer = document.createElement("div");
    layer.id = "sinal-theme-soft-layer";
    layer.setAttribute("aria-hidden", "true");

    [
      { x: "22%", y: "67%", w: "42vw", h: "14vh", s: "1.10", o: "0.28", d: "18s", delay: "-3s" },
      { x: "56%", y: "70%", w: "54vw", h: "18vh", s: "1.00", o: "0.24", d: "21s", delay: "-9s" },
      { x: "78%", y: "63%", w: "38vw", h: "13vh", s: "0.92", o: "0.20", d: "19s", delay: "-5s" },
      { x: "46%", y: "42%", w: "34vw", h: "11vh", s: "0.82", o: "0.16", d: "23s", delay: "-13s" }
    ].forEach(function (config) {
      var mist = document.createElement("span");
      mist.className = "sinal-mist";
      mist.style.setProperty("--x", config.x);
      mist.style.setProperty("--y", config.y);
      mist.style.setProperty("--w", config.w);
      mist.style.setProperty("--h", config.h);
      mist.style.setProperty("--s", config.s);
      mist.style.setProperty("--o", config.o);
      mist.style.setProperty("--duration", config.d);
      mist.style.setProperty("--delay", config.delay);
      layer.appendChild(mist);
    });
    document.body.insertBefore(layer, document.getElementById("root"));
  }

  function updateBottomLabel() {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (node.childElementCount) return;
      if (/^(사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(text(node))) {
        if (node.textContent !== SINAL.label) node.textContent = SINAL.label;
      }
    });
  }

  function applySinal() {
    if (!active) return;
    ensureLayer();
    document.body.dataset.extraTheme = "sinal";
    document.body.style.backgroundColor = SINAL.color;

    var background = findBackgroundNode();
    if (background) {
      background.style.backgroundImage = 'url("' + SINAL.background + '")';
      background.style.backgroundPosition = SINAL.position;
      background.style.backgroundColor = SINAL.color;
      background.style.opacity = "1";
    }

    var prayerActive = isPrayerActive();
    var altar = document.querySelector('img[alt="altar"]');
    if (altar) {
      var altarSrc = (altar.getAttribute("src") || "").split("?")[0];
      if (altarSrc !== SINAL.altar) altar.setAttribute("src", SINAL.altar);
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
    }

    var layer = document.getElementById("sinal-theme-soft-layer");
    if (layer) {
      layer.style.opacity = prayerActive ? "0.28" : "1";
      layer.style.filter = prayerActive ? "brightness(1.03)" : "";
    }

    updateBottomLabel();
    Array.from(document.querySelectorAll("button[data-sinal-theme]")).forEach(function (button) {
      button.classList.toggle("sinal-theme-active", active);
    });
  }

  function clearSinal() {
    active = false;
    if (document.body.dataset.extraTheme === "sinal") {
      document.body.removeAttribute("data-extra-theme");
      document.body.style.backgroundColor = "";
    }
    Array.from(document.querySelectorAll("button[data-sinal-theme]")).forEach(function (button) {
      button.classList.remove("sinal-theme-active");
    });
  }

  function makeButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.sinalTheme = "true";
    button.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white";
    button.innerHTML = '<span style="width:16px;text-align:center;opacity:.78">✦</span><span>' + SINAL.label + '</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: "sinal" } }));
      active = true;
      applySinal();
      window.setTimeout(applySinal, 140);
      window.setTimeout(applySinal, 520);
    });
    return button;
  }

  function injectButton() {
    var desertButton = Array.from(document.querySelectorAll("button")).find(function (button) {
      return text(button).indexOf("사막의 제단") !== -1;
    });
    if (!desertButton || !desertButton.parentElement) return;
    var menu = desertButton.parentElement;
    if (!menu.querySelector("button[data-sinal-theme]")) {
      var jonahButton = menu.querySelector("button[data-jonah-theme]");
      if (jonahButton) {
        jonahButton.insertAdjacentElement("afterend", makeButton());
      } else {
        menu.appendChild(makeButton());
      }
    }
  }

  function scheduleInject() {
    if (injectScheduled) return;
    injectScheduled = true;
    [80, 220, 520, 960].forEach(function (delay) {
      window.setTimeout(function () {
        injectButton();
        if (delay === 960) injectScheduled = false;
      }, delay);
    });
  }

  function start() {
    ensureLayer();
    scheduleInject();
    if (window.location.search.indexOf("sinal") !== -1 || window.location.search.indexOf("sinai") !== -1) {
      [180, 760, 1500, 2800].forEach(function (delay) {
        window.setTimeout(function () {
          active = true;
          applySinal();
        }, delay);
      });
    }
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = text(button);
      if (BASE_LABELS.some(function (baseLabel) { return label.indexOf(baseLabel) !== -1; })) {
        clearSinal();
      }
      if (label.length < 2 || label === "CCM") {
        scheduleInject();
      }
    }, true);
    document.addEventListener("codex-extra-theme-change", function (event) {
      if (!event.detail || event.detail.theme !== "sinal") clearSinal();
    });
    new MutationObserver(function () {
      scheduleInject();
      if (active) applySinal();
    }).observe(document.getElementById("root"), { childList: true, subtree: true });
    window.setInterval(function () {
      if (active) applySinal();
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
