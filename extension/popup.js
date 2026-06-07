import { classify, shouldSkip } from "./config.js";

const api = (typeof browser !== "undefined" ? browser : chrome);

const $ = (id) => document.getElementById(id);
const arc = $("meterArc");
const ARC_LEN = 326.7;

function setMeter(value, level) {
  const v = Math.max(0, Math.min(100, value));
  arc.style.strokeDashoffset = String(ARC_LEN * (1 - v / 100));
  $("meterValue").textContent = `${v}%`;
  $("meterLabel").textContent = level || "trust";
  const colors = { safe: "#10b981", suspicious: "#f59e0b", dangerous: "#ef4444" };
  arc.setAttribute("stroke", colors[level] || "#7c5cff");
}

function setStatus(level, label) {
  const status = $("status");
  status.classList.remove("loading", "safe", "suspicious", "dangerous");
  if (level) status.classList.add(level);
  const badge = $("levelBadge");
  badge.className = "level-badge " + (level || "");
  badge.textContent = label;
}

function dotClass(state) {
  const map = { ok: "safe", warn: "warn", bad: "bad" };
  return map[state] || "";
}

function updateSignals(url) {
  try {
    const u = new URL(url);
    const insecure = u.protocol === "http:";
    const suspiciousWords = /(login|verify|secure|account|update|wallet|signin|confirm)/i;
    const hasSuspicious = suspiciousWords.test(u.hostname + u.pathname);
    const lotsOfDots = (u.hostname.match(/\./g) || []).length >= 4;
    $("sig-https").textContent = insecure ? "✕" : "✓";
    $("sig-https").className = "dot " + dotClass(insecure ? "bad" : "ok");
    $("sig-pattern").textContent = hasSuspicious ? "!" : "✓";
    $("sig-pattern").className = "dot " + dotClass(hasSuspicious ? "warn" : "ok");
    $("sig-new").textContent = lotsOfDots ? "!" : "·";
    $("sig-new").className = "dot " + dotClass(lotsOfDots ? "warn" : "ok");
  } catch {}
}

async function loadHistory() {
  const { history = [] } = await api.storage.local.get("history");
  const ul = $("historyList");
  ul.textContent = "";
  if (!history.length) {
    const empty = document.createElement("li");
    empty.style.justifyContent = "center";
    empty.style.color = "var(--muted)";
    empty.textContent = "No scans yet";
    ul.appendChild(empty);
    return;
  }
  history.slice(0, 10).forEach((h) => {
    const { level } = classify(h.label, h.confidence);
    const li = document.createElement("li");
    const domainSpan = document.createElement("span");
    domainSpan.className = "h-domain";
    domainSpan.textContent = h.domain || h.url;
    const levelSpan = document.createElement("span");
    levelSpan.className = `h-level ${level}`;
    levelSpan.textContent = `${h.confidence}%`;
    li.appendChild(domainSpan);
    li.appendChild(levelSpan);
    ul.appendChild(li);
  });
}

async function loadSettings() {
  const { settings = {} } = await api.storage.local.get("settings");
  $("autoScan").checked = settings.autoScan !== false;
  $("aggressive").checked = !!settings.aggressive;
  $("notifications").checked = settings.notifications !== false;
}

async function saveSettings() {
  const { settings = {} } = await api.storage.local.get("settings");
  const next = {
    ...settings,
    autoScan: $("autoScan").checked,
    aggressive: $("aggressive").checked,
    notifications: $("notifications").checked,
  };
  await api.storage.local.set({ settings: next });
}

async function getActiveTab() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function renderResult(result, tabUrl) {
  if (!result) {
    setStatus(null, shouldSkip(tabUrl) ? "Not scannable" : "Not scanned");
    setMeter(0, "trust");
    $("explain").textContent = shouldSkip(tabUrl)
      ? "Browser system pages cannot be analyzed."
      : "Click rescan to analyze this page.";
    return;
  }
  const { level } = classify(result.label, result.confidence);
  const trust = level === "safe" ? Math.max(70, 100 - result.confidence) : 100 - result.confidence;
  setMeter(Math.round(trust), level);
  const labels = { safe: "Safe", suspicious: "Suspicious", dangerous: "Dangerous" };
  setStatus(level, labels[level]);
  try { $("domain").textContent = new URL(result.url).hostname; } catch { $("domain").textContent = result.url; }
  $("explain").textContent =
    level === "dangerous"
      ? "This site shows strong phishing indicators. Avoid entering credentials."
      : level === "suspicious"
      ? "Some suspicious signals detected. Proceed with caution."
      : "No significant phishing indicators were detected.";
}

async function refresh() {
  const tab = await getActiveTab();
  if (!tab?.url) return;
  $("domain").textContent = (() => { try { return new URL(tab.url).hostname; } catch { return tab.url; }})();
  updateSignals(tab.url);
  const resp = await api.runtime.sendMessage({ type: "PV_GET_TAB_RESULT", tabId: tab.id });
  renderResult(resp?.result || null, tab.url);
}

$("rescan").addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab) return;
  setStatus(null, "Scanning…");
  setMeter(0, "scanning");
  const resp = await api.runtime.sendMessage({ type: "PV_SCAN_TAB", tabId: tab.id });
  renderResult(resp?.result || null, tab.url);
  loadHistory();
});

$("report").addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab?.url) return;
  await api.runtime.sendMessage({ type: "PV_REPORT_SUSPICIOUS", url: tab.url });
  $("report").textContent = "Reported ✓";
  setTimeout(() => ($("report").textContent = "Report this site"), 1500);
});

$("export").addEventListener("click", async () => {
  const { history = [] } = await api.storage.local.get("history");
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `phishvision-logs-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

["autoScan", "aggressive", "notifications"].forEach((id) => {
  $(id).addEventListener("change", saveSettings);
});

(async function init() {
  await loadSettings();
  await refresh();
  await loadHistory();
})();