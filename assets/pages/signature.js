/* ============================================
   HK POS eSignature - Signature Pad
   - Signature pad initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const Utils = window.HKPOS.Utils;

  const { qs, load, save, toast } = Utils;

  function initSignaturePad() {
    const canvas = qs("#signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // match CSS size with device pixels
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const saved = load(STORAGE.signature, null);
      if (saved && typeof saved.dataUrl === "string") {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = saved.dataUrl;
      }
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let drawing = false;
    let last = null;
    function pointFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return { x, y };
    }

    function start(e) {
      drawing = true;
      last = pointFromEvent(e);
      e.preventDefault();
    }
    function move(e) {
      if (!drawing) return;
      const p = pointFromEvent(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      e.preventDefault();
    }
    function end() {
      if (!drawing) return;
      drawing = false;
      last = null;
      save(STORAGE.signature, { dataUrl: canvas.toDataURL("image/png"), savedAt: new Date().toISOString() });
      toast("서명 저장됨", "1회 수집된 서명이 모든 서명 필요 양식에 공통 적용됩니다(설계).");
    }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);

    const clearBtn = qs("#clear-signature");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        // transform 상태와 관계없이 캔버스 버퍼 전체를 지우기
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        localStorage.removeItem(STORAGE.signature);
        // 실명도 함께 삭제 (서명과 함께 증적 자료이므로)
        const realNameInput = qs("#customer-real-name");
        if (realNameInput) {
          realNameInput.value = "";
          localStorage.removeItem(STORAGE.customerRealName);
        }
        toast("서명 삭제됨", "서명과 실명이 삭제되었습니다. 고객이 다시 입력해야 합니다(설계).");
      });
    }
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initSignaturePad = initSignaturePad;
})();
