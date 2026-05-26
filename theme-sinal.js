(function () {
  "use strict";

  var SINAL = {
    label: "모세의 시내산",
    background: "assets/back_sinal.webp",
    altar: "assets/b_sinal.webp",
    color: "#536a83",
    position: "center 52%",
    waitingFilter: "brightness(0.92) saturate(0.96) contrast(1) drop-shadow(0 22px 42px rgba(24, 34, 48, 0.62))",
    prayingFilter: "brightness(1.03) saturate(1.04) contrast(1.02) drop-shadow(0 0 24px rgba(255, 224, 158, 0.30))"
  };
  var BASE_LABELS = ["사막의 제단", "겟세마네 동산", "어두운 밤", "여름 녹음"];
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

    var cloud1 = document.createElement("div");
    cloud1.className = "sinal-cloud sinal-cloud-1";
    layer.appendChild(cloud1);

    var cloud2 = document.createElement("div");
    cloud2.className = "sinal-cloud sinal-cloud-2";
    layer.appendChild(cloud2);

    var lightning = document.createElement("span");
    lightning.className = "sinal-lightning";
    layer.appendChild(lightning);

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
      var reloadSrc = SINAL.altar + "?reload=" + Date.now();
      if (altar.getAttribute("src") !== reloadSrc) altar.setAttribute("src", reloadSrc);
      altar.style.removeProperty("transform");
      altar.style.filter = prayerActive ? SINAL.prayingFilter : SINAL.waitingFilter;
    }

    var layer = document.getElementById("sinal-theme-soft-layer");
    if (layer) {
      layer.style.opacity = prayerActive ? "0.55" : "1";
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
    var background = document.querySelector("#root > div");
    if (background && background.style.backgroundImage && background.style.backgroundImage.indexOf("back_sinal") !== -1) {
      background.style.removeProperty("background-image");
      background.style.removeProperty("background-position");
      background.style.removeProperty("background-color");
      background.style.removeProperty("background-size");
      background.style.removeProperty("background-repeat");
      background.style.removeProperty("background-attachment");
      background.style.removeProperty("opacity");
    }
    Array.from(document.querySelectorAll("button[data-sinal-theme]")).forEach(function (button) {
      button.classList.remove("sinal-theme-active");
    });
  }

  function start() {
    ensureLayer();
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
    }, true);
    document.addEventListener("codex-extra-theme-change", function (event) {
      if (!event.detail) return;
      if (event.detail.theme === "sinal") {
        active = true;
        applySinal();
      } else {
        clearSinal();
      }
    });
    new MutationObserver(function () {
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
