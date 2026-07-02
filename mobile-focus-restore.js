(function () {
  "use strict";

  var savedViewport = null;
  var restoreTimers = [];
  var preparingSubmit = false;

  function isEditable(node) {
    if (!node || !node.matches) return false;
    return node.matches("textarea, input");
  }

  function isPrayerTextInput(node) {
    if (!isEditable(node)) return false;
    var text = String(node.getAttribute("placeholder") || "");
    return text.indexOf("기도문") !== -1 || !!node.closest(".fixed");
  }

  function serializeRect(rect) {
    return {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    };
  }

  function describeActiveElement() {
    var active = document.activeElement;
    if (!active) return null;
    return {
      tagName: active.tagName,
      type: active.getAttribute("type") || "",
      id: active.id || "",
      className: typeof active.className === "string" ? active.className : "",
      placeholder: active.getAttribute("placeholder") || ""
    };
  }

  function readViewportState() {
    var visual = window.visualViewport;
    var scrollX = window.scrollX || window.pageXOffset || 0;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var offsetTop = visual ? visual.offsetTop : 0;
    var offsetLeft = visual ? visual.offsetLeft : 0;
    return {
      scrollX: scrollX,
      scrollY: scrollY,
      visualViewportOffsetTop: offsetTop,
      visualViewportOffsetLeft: offsetLeft,
      visualViewportPageTop: visual && typeof visual.pageTop === "number" ? visual.pageTop : scrollY + offsetTop,
      visualViewportPageLeft: visual && typeof visual.pageLeft === "number" ? visual.pageLeft : scrollX + offsetLeft,
      visualViewportHeight: visual ? visual.height : window.innerHeight,
      visualViewportWidth: visual ? visual.width : window.innerWidth,
      visualViewportScale: visual && typeof visual.scale === "number" ? visual.scale : 1,
      documentRect: serializeRect(document.documentElement.getBoundingClientRect()),
      activeElement: describeActiveElement()
    };
  }

  function logViewport(label, state) {
    if (!window.console || !console.debug) return;
    console.debug("[codex-focus-restore] " + label, state || readViewportState());
  }

  function saveViewportState() {
    savedViewport = readViewportState();
    logViewport("saved", savedViewport);
  }

  function clearRestoreTimers() {
    restoreTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    restoreTimers = [];
  }

  function getRestoreTarget() {
    if (!savedViewport) return null;
    var visual = window.visualViewport;
    var currentPageTop = visual && typeof visual.pageTop === "number"
      ? visual.pageTop
      : (window.scrollY || window.pageYOffset || 0) + (visual ? visual.offsetTop : 0);
    var currentPageLeft = visual && typeof visual.pageLeft === "number"
      ? visual.pageLeft
      : (window.scrollX || window.pageXOffset || 0) + (visual ? visual.offsetLeft : 0);
    var deltaY = currentPageTop - savedViewport.visualViewportPageTop;
    var deltaX = currentPageLeft - savedViewport.visualViewportPageLeft;
    return {
      x: Math.max(0, savedViewport.scrollX + deltaX),
      y: Math.max(0, savedViewport.scrollY + deltaY),
      deltaX: deltaX,
      deltaY: deltaY,
      currentPageTop: currentPageTop,
      currentPageLeft: currentPageLeft
    };
  }

  function restoreScrollPosition() {
    var target = getRestoreTarget();
    if (!target) return;
    logViewport("before-restore", {
      saved: savedViewport,
      target: target,
      current: readViewportState()
    });
    window.scrollTo(target.x, target.y);
    logViewport("after-restore");
  }

  function waitFrames(count) {
    return new Promise(function (resolve) {
      function step() {
        count -= 1;
        if (count <= 0) {
          resolve();
          return;
        }
        window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    });
  }

  function viewportSignature() {
    var state = readViewportState();
    return [
      Math.round(state.visualViewportOffsetTop),
      Math.round(state.visualViewportOffsetLeft),
      Math.round(state.visualViewportHeight),
      Math.round(state.visualViewportWidth),
      Math.round(state.visualViewportScale * 1000)
    ].join(":");
  }

  function waitForViewportSettle() {
    return new Promise(function (resolve) {
      var visual = window.visualViewport;
      var startedAt = Date.now();
      var stableSince = 0;
      var lastSignature = viewportSignature();
      var settledTimer = 0;
      var finished = false;

      function cleanup() {
        if (!visual) return;
        visual.removeEventListener("resize", onChange);
        visual.removeEventListener("scroll", onChange);
      }

      function finish() {
        if (finished) return;
        finished = true;
        cleanup();
        resolve();
      }

      function onChange() {
        stableSince = 0;
        if (settledTimer) window.clearTimeout(settledTimer);
        settledTimer = window.setTimeout(check, 160);
      }

      function check() {
        var currentSignature = viewportSignature();
        if (currentSignature !== lastSignature) {
          lastSignature = currentSignature;
          stableSince = 0;
        } else if (!stableSince) {
          stableSince = Date.now();
        }

        if ((stableSince && Date.now() - stableSince >= 180) || Date.now() - startedAt >= 1500) {
          finish();
          return;
        }

        window.requestAnimationFrame(check);
      }

      if (visual) {
        visual.addEventListener("resize", onChange, { passive: true });
        visual.addEventListener("scroll", onChange, { passive: true });
      }
      window.requestAnimationFrame(check);
    });
  }

  function reinforceRestore() {
    clearRestoreTimers();
    [0, 80, 180, 360, 700].forEach(function (delay) {
      restoreTimers.push(window.setTimeout(restoreScrollPosition, delay));
    });
  }

  function findPrayerTextarea() {
    var active = document.activeElement;
    if (isPrayerTextInput(active)) return active;
    var candidates = Array.prototype.slice.call(document.querySelectorAll(".fixed textarea, textarea"));
    return candidates.find(isPrayerTextInput) || null;
  }

  async function preparePrayerSubmit(runSubmit) {
    if (preparingSubmit) return;
    preparingSubmit = true;

    var textarea = findPrayerTextarea();
    if (!savedViewport) saveViewportState();

    logViewport("submit-requested");
    if (textarea && document.activeElement === textarea) textarea.blur();

    await waitFrames(3);
    await waitForViewportSettle();
    await new Promise(function (resolve) {
      window.setTimeout(resolve, 180);
    });

    restoreScrollPosition();
    reinforceRestore();
    logViewport("submit-after-restore");

    preparingSubmit = false;
    runSubmit();
    window.setTimeout(function () {
      savedViewport = null;
    }, 900);
  }

  document.addEventListener("pointerdown", function (event) {
    if (isPrayerTextInput(event.target)) saveViewportState();
  }, true);

  document.addEventListener("touchstart", function (event) {
    if (isPrayerTextInput(event.target)) saveViewportState();
  }, true);

  document.addEventListener("focusin", function (event) {
    if (isPrayerTextInput(event.target)) saveViewportState();
  }, true);

  window.__codexPreparePrayerSubmit = function (runSubmit) {
    if (typeof runSubmit !== "function") return;
    preparePrayerSubmit(runSubmit).catch(function (error) {
      preparingSubmit = false;
      if (window.console && console.warn) console.warn("[codex-focus-restore] fallback submit", error);
      runSubmit();
    });
  };
})();
