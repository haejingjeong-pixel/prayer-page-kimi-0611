(function () {
  "use strict";

  var MARK = {
    label: "마가 다락방",
    background: "assets/back_mark.webp",
    altar: "assets/b_mark.webp",
    color: "#3e2b21",
    position: "center 52%"
  };
  var BASE_LABELS = ["은밀한 골방", "사막의 제단", "겟세마네 동산", "어두운 밤", "여름 녹음"];
  var active = false;
  var injectScheduled = false;

  function text(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function findBackgroundNode() {
    return Array.from(document.querySelectorAll("#root div")).find(function (node) {
      var style = node.style || {};
      return style.backgroundImage && style.backgroundSize === "cover";
    }) || null;
  }

  function ensureLayer() {
    if (document.getElementById("mark-theme-soft-layer")) return;
    var layer = document.createElement("div");
    layer.id = "mark-theme-soft-layer";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 18; i += 1) {
      var dust = document.createElement("span");
      dust.className = "mark-gold-dust";
      dust.style.setProperty("--x", (12 + Math.random() * 76).toFixed(2) + "%");
      dust.style.setProperty("--y", (18 + Math.random() * 60).toFixed(2) + "%");
      dust.style.setProperty("--size", (1.4 + Math.random() * 1.8).toFixed(2) + "px");
      dust.style.setProperty("--duration", (9 + Math.random() * 7).toFixed(2) + "s");
      dust.style.setProperty("--delay", (-Math.random() * 10).toFixed(2) + "s");
      layer.appendChild(dust);
    }
    document.body.insertBefore(layer, document.getElementById("root"));
  }

  function updateBottomLabel() {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (node.childElementCount) return;
      if (/^(사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(text(node))) {
        if (node.textContent !== MARK.label) node.textContent = MARK.label;
      }
    });
  }

  function applyMark() {
    if (!active) return;
    ensureLayer();
    document.body.dataset.extraTheme = "mark";
    document.body.style.backgroundColor = MARK.color;

    var background = findBackgroundNode();
    if (background) {
      background.style.backgroundImage = 'url("' + MARK.background + '")';
      background.style.backgroundPosition = MARK.position;
      background.style.backgroundColor = MARK.color;
      background.style.opacity = "1";
    }

    var altar = document.querySelector('img[alt="altar"]');
    if (altar) {
      var altarSrc = (altar.getAttribute("src") || "").split("?")[0];
      if (altarSrc !== MARK.altar) altar.setAttribute("src", MARK.altar);
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

    updateBottomLabel();
    Array.from(document.querySelectorAll("button[data-mark-theme]")).forEach(function (button) {
      button.classList.toggle("mark-theme-active", active);
    });
  }

  function clearMark() {
    active = false;
    document.body.removeAttribute("data-extra-theme");
    document.body.style.backgroundColor = "";
    Array.from(document.querySelectorAll("button[data-mark-theme]")).forEach(function (button) {
      button.classList.remove("mark-theme-active");
    });
  }

  function makeButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.markTheme = "true";
    button.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white";
    button.innerHTML = '<span style="width:16px;text-align:center;opacity:.78">✦</span><span>' + MARK.label + '</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: "mark" } }));
      active = true;
      applyMark();
      window.setTimeout(applyMark, 120);
      window.setTimeout(applyMark, 420);
    });
    return button;
  }

  function injectButton() {
    var desertButton = Array.from(document.querySelectorAll("button")).find(function (button) {
      return text(button).indexOf("사막의 제단") !== -1;
    });
    if (!desertButton || !desertButton.parentElement) return;
    if (!desertButton.parentElement.querySelector("button[data-mark-theme]")) {
      desertButton.parentElement.appendChild(makeButton());
    }
  }

  function scheduleInject() {
    if (injectScheduled) return;
    injectScheduled = true;
    [60, 180, 460, 900].forEach(function (delay) {
      window.setTimeout(function () {
        injectButton();
        if (delay === 900) injectScheduled = false;
      }, delay);
    });
  }

  function start() {
    ensureLayer();
    scheduleInject();
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = text(button);
      if (BASE_LABELS.some(function (baseLabel) { return label.indexOf(baseLabel) !== -1; })) {
        clearMark();
      }
      if (label.length < 2 || label === "CCM") {
        scheduleInject();
      }
    }, true);
    document.addEventListener("codex-extra-theme-change", function (event) {
      if (!event.detail || event.detail.theme !== "mark") clearMark();
    });
    new MutationObserver(function () {
      scheduleInject();
      if (active) applyMark();
    }).observe(document.getElementById("root"), { childList: true, subtree: true });
    window.setInterval(function () {
      if (active) applyMark();
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
