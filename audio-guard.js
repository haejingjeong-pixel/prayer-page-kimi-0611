(function () {
  "use strict";

  var BGM_KEY = "codex-user-bgm-enabled";

  function isEnabled() {
    var v = localStorage.getItem(BGM_KEY);
    return v === null ? true : v === "true";
  }

  function setEnabled(v) {
    localStorage.setItem(BGM_KEY, v ? "true" : "false");
  }

  function pauseAllAudio() {
    document.querySelectorAll("audio").forEach(function (a) {
      a.pause();
    });
  }

  // 1. play 이벤트 캡처: OFF 상태면 즉시 pause
  document.addEventListener("play", function (e) {
    if (e.target.tagName !== "AUDIO") return;
    if (!isEnabled()) {
      e.target.pause();
    }
  }, true);

  // 2. visibilitychange: 탭 복귀 시 OFF면 전체 audio pause
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && !isEnabled()) {
      pauseAllAudio();
    }
  });

  // 3. 테마 변경 시 OFF면 pause
  document.addEventListener("codex-bgm-theme-change", function () {
    if (!isEnabled()) {
      pauseAllAudio();
    }
  });

  // 4. 사용자 명시적 ON/OFF 감지 (버튼 클릭)
  var THEME_LABELS = /은밀한 골방|사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산/;

  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;

    var text = (btn.textContent || "").replace(/\s+/g, " ").trim();
    // 테마 변경 버튼은 상태 추론에서 제외
    if (THEME_LABELS.test(text)) return;

    var beforePlaying = Array.from(document.querySelectorAll("audio")).some(function (a) {
      return !a.paused;
    });

    window.setTimeout(function () {
      var afterPlaying = Array.from(document.querySelectorAll("audio")).some(function (a) {
        return !a.paused;
      });

      if (beforePlaying && !afterPlaying) {
        // 재생 -> 멈춤: 사용자가 끈 것으로 간주
        setEnabled(false);
      } else if (!beforePlaying && afterPlaying) {
        // 멈춤 -> 재생: 사용자가 켠 것으로 간주
        setEnabled(true);
      }
    }, 400);
  }, true);

  // 5. 초기 로드 시 OFF 상태면 실행 중인 audio 멈춤
  if (!isEnabled()) {
    pauseAllAudio();
  }
})();
