// PhishVision AI - Content Script
(function () {
  const api = (typeof browser !== "undefined" ? browser : chrome);
  let overlayEl = null;

  function analyzeDom() {
    try {
      const isHttp = location.protocol === "http:";
      const passwordFields = document.querySelectorAll('input[type="password"]');
      if (isHttp && passwordFields.length > 0) {
        api.runtime.sendMessage({ type: "PV_CONTENT_SIGNAL", signal: "insecure-login-form" });
      }
      // Detect external form actions
      const forms = document.querySelectorAll("form");
      forms.forEach((f) => {
        const action = f.getAttribute("action") || "";
        if (action.startsWith("http") && !action.includes(location.hostname)) {
          api.runtime.sendMessage({ type: "PV_CONTENT_SIGNAL", signal: "external-form-action" });
        }
      });
    } catch (_) {}
  }

  function buildOverlay(result) {
    const host = document.createElement("div");
    host.id = "phishvision-overlay-host";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .pv-backdrop {
          position: fixed; inset: 0; z-index: 2147483647;
          background: rgba(5, 8, 22, 0.85); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #fff; padding: 24px;
        }
        .pv-card {
          max-width: 520px; width: 100%;
          background: linear-gradient(180deg, rgba(30, 9, 24, 0.9), rgba(20, 6, 16, 0.95));
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 18px; padding: 28px;
          box-shadow: 0 20px 80px rgba(239, 68, 68, 0.35), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .pv-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: radial-gradient(circle, #ef4444, #7f1d1d);
          display:flex; align-items:center; justify-content:center;
          margin: 0 auto 16px; font-size: 36px;
          box-shadow: 0 0 40px rgba(239,68,68,0.6);
        }
        h1 { font-size: 24px; margin: 0 0 8px; text-align:center; font-weight: 700; }
        p { margin: 0 0 16px; line-height: 1.5; opacity: 0.85; text-align:center; font-size: 14px; }
        .pv-meta {
          display:flex; justify-content:space-between; gap: 12px;
          background: rgba(255,255,255,0.04); border-radius: 12px;
          padding: 12px 16px; margin: 16px 0;
          font-size: 13px;
        }
        .pv-meta span:last-child { font-weight: 700; color: #fca5a5; }
        .pv-url { word-break: break-all; font-family: monospace; font-size: 12px; opacity: 0.7; text-align:center; margin-bottom: 16px;}
        .pv-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        button {
          flex: 1; min-width: 140px; padding: 12px 16px; border-radius: 10px;
          border: none; font-weight: 600; cursor: pointer; font-size: 14px;
          transition: transform .1s ease, opacity .15s ease;
        }
        button:hover { transform: translateY(-1px); }
        .pv-back { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
        .pv-proceed { background: rgba(255,255,255,0.08); color: #fca5a5; border: 1px solid rgba(252,165,165,0.3); }
        .pv-brand { text-align:center; margin-top: 16px; font-size: 11px; opacity: 0.5; letter-spacing: 1px; text-transform: uppercase; }
      </style>
      <div class="pv-backdrop" role="dialog" aria-modal="true">
        <div class="pv-card">
          <div class="pv-icon">\u26A0</div>
          <h1>Dangerous Site Detected</h1>
          <p>PhishVision AI detected signals consistent with a phishing or malicious website. Do not enter passwords or personal information.</p>
          <div class="pv-url">${(result.url || location.href).replace(/</g, "&lt;")}</div>
          <div class="pv-meta"><span>Risk Confidence</span><span>${result.confidence}%</span></div>
          <div class="pv-actions">
            <button class="pv-back">Back to safety</button>
            <button class="pv-proceed">Proceed anyway</button>
          </div>
          <div class="pv-brand">Protected by PhishVision AI</div>
        </div>
      </div>
    `;
    shadow.querySelector(".pv-back").addEventListener("click", () => {
      if (history.length > 1) history.back();
      else location.href = "about:blank";
    });
    shadow.querySelector(".pv-proceed").addEventListener("click", () => {
      host.remove();
      overlayEl = null;
    });
    return host;
  }

  function showOverlay(result) {
    if (overlayEl) return;
    overlayEl = buildOverlay(result);
    document.documentElement.appendChild(overlayEl);
  }

  api.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "PV_SHOW_OVERLAY" && msg.result) {
      showOverlay(msg.result);
    }
  });

  // Run DOM analysis once page is interactive, then watch for dynamic changes (debounced)
  const debounce = (fn, ms) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
  const debouncedAnalyze = debounce(analyzeDom, 800);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", debouncedAnalyze, { once: true });
  } else {
    debouncedAnalyze();
  }
  const mo = new MutationObserver(debouncedAnalyze);
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();