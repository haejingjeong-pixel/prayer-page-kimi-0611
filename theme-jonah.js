(function () {
  "use strict";

  var JONAH = {
    label: "요나의 고래뱃속",
    background: "assets/back_jonah.webp",
    altar: "assets/b_jonah.webp",
    color: "#000204",
    position: "center calc(50% - 8vh)"
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
    if (document.getElementById("jonah-theme-soft-layer")) return;
    var layer = document.createElement("div");
    layer.id = "jonah-theme-soft-layer";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 20; i += 1) {
      var particle = document.createElement("span");
      particle.className = "jonah-floating-particle";
      particle.style.setProperty("--x", (10 + Math.random() * 80).toFixed(2) + "%");
      particle.style.setProperty("--y", (16 + Math.random() * 70).toFixed(2) + "%");
      particle.style.setProperty("--size", (1.5 + Math.random() * 2.4).toFixed(2) + "px");
      particle.style.setProperty("--duration", (11 + Math.random() * 10).toFixed(2) + "s");
      particle.style.setProperty("--delay", (-Math.random() * 14).toFixed(2) + "s");
      layer.appendChild(particle);
    }
    document.body.insertBefore(layer, document.getElementById("root"));
  }

  function isPrayerActive() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      var label = text(button);
      return label.indexOf("기도 중") !== -1 || label.indexOf("기도중") !== -1;
    });
  }

  function syncPrayerState() {
    document.body.dataset.prayerState = isPrayerActive() ? "praying" : "waiting";
  }

  function updateBottomLabel() {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (node.childElementCount) return;
      if (/^(사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(text(node))) {
        if (node.textContent !== JONAH.label) node.textContent = JONAH.label;
      }
    });
  }

  function applyJonah() {
    if (!active) return;
    ensureLayer();
    document.body.dataset.extraTheme = "jonah";
    document.body.style.backgroundColor = JONAH.color;

    var background = findBackgroundNode();
    if (background) {
      background.style.backgroundImage = 'url("' + JONAH.background + '")';
      background.style.backgroundPosition = JONAH.position;
      background.style.backgroundColor = JONAH.color;
      background.style.opacity = "1";
    }

    var altar = document.querySelector('img[alt="altar"]');
    if (altar) {
      var altarSrc = (altar.getAttribute("src") || "").split("?")[0];
      if (altarSrc !== JONAH.altar) altar.setAttribute("src", JONAH.altar);
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

    syncPrayerState();
    updateBottomLabel();
    Array.from(document.querySelectorAll("button[data-jonah-theme]")).forEach(function (button) {
      button.classList.toggle("jonah-theme-active", active);
    });
  }

  function clearJonah() {
    active = false;
    if (document.body.dataset.extraTheme === "jonah") {
      document.body.removeAttribute("data-extra-theme");
      document.body.style.backgroundColor = "";
    }
    Array.from(document.querySelectorAll("button[data-jonah-theme]")).forEach(function (button) {
      button.classList.remove("jonah-theme-active");
    });
  }

  function makeButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.jonahTheme = "true";
    button.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white";
    button.innerHTML = '<span style="width:16px;text-align:center;opacity:.78">✦</span><span>' + JONAH.label + '</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: "jonah" } }));
      active = true;
      applyJonah();
      window.setTimeout(applyJonah, 120);
      window.setTimeout(applyJonah, 420);
    });
    return button;
  }

  function injectButton() {
    var desertButton = Array.from(document.querySelectorAll("button")).find(function (button) {
      return text(button).indexOf("사막의 제단") !== -1;
    });
    if (!desertButton || !desertButton.parentElement) return;
    var menu = desertButton.parentElement;
    if (!menu.querySelector("button[data-jonah-theme]")) {
      var markButton = menu.querySelector("button[data-mark-theme]");
      if (markButton) {
        markButton.insertAdjacentElement("afterend", makeButton());
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
    syncPrayerState();
    scheduleInject();
    if (window.location.search.indexOf("jonah") !== -1) {
      [160, 700, 1400, 2600].forEach(function (delay) {
        window.setTimeout(function () {
          active = true;
          applyJonah();
        }, delay);
      });
    }
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = text(button);
      if (BASE_LABELS.some(function (baseLabel) { return label.indexOf(baseLabel) !== -1; })) {
        clearJonah();
      }
      if (label.length < 2 || label === "CCM") {
        scheduleInject();
      }
      window.setTimeout(syncPrayerState, 40);
      window.setTimeout(syncPrayerState, 240);
    }, true);
    document.addEventListener("codex-extra-theme-change", function (event) {
      if (!event.detail || event.detail.theme !== "jonah") clearJonah();
    });
    new MutationObserver(function () {
      syncPrayerState();
      scheduleInject();
      if (active) applyJonah();
    }).observe(document.getElementById("root"), { childList: true, subtree: true, characterData: true });
    window.setInterval(function () {
      if (active) applyJonah();
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
