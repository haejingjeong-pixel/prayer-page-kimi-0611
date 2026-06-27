(function () {
  "use strict";

  var REMOVE_PATTERNS = [
    "기도 장소 이름이 궁금하다면",
    "말풍선을 눌러보세요",
    "기도의 몰입감을 위해",
    "기도음악을 함께 들어보세요",
    "기도를 올려두려면"
  ];

  var KEEP_PATTERNS = [
    "마음을 올려두려면",
    "이번주",
    "기도문 작성하기"
  ];

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function shouldKeep(text) {
    if (!text) return true;
    if (text === "기도하기") return true;
    return KEEP_PATTERNS.some(function (word) {
      return text.indexOf(word) !== -1;
    });
  }

  function shouldRemove(text) {
    if (!text) return false;
    if (shouldKeep(text)) return false;
    return REMOVE_PATTERNS.some(function (word) {
      return text.indexOf(word) !== -1;
    });
  }

  function hideNode(node) {
    if (!node || !node.style) return;
    node.setAttribute("aria-hidden", "true");
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.style.setProperty("opacity", "0", "important");
    node.style.setProperty("pointer-events", "none", "important");
  }

  function cleanupOldGuides() {
    Array.from(document.querySelectorAll("p, span, div")).forEach(function (node) {
      var text = clean(node.textContent);
      if (!shouldRemove(text)) return;

      var childHasTarget = Array.from(node.children || []).some(function (child) {
        return shouldRemove(clean(child.textContent));
      });

      if (!childHasTarget) {
        hideNode(node);
      } else {
        node.style.setProperty("pointer-events", "none", "important");
      }
    });
  }

  function start() {
    cleanupOldGuides();

    var target = document.getElementById("root") || document.body;

    new MutationObserver(cleanupOldGuides).observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    });

    [50, 150, 300, 700, 1200, 2000, 3500, 5000].forEach(function (delay) {
      window.setTimeout(cleanupOldGuides, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
