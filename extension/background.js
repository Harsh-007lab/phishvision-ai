// PhishVision AI - Background Service Worker (MV3)
// Cross-browser: use globalThis.browser fallback to chrome
import { ENDPOINT, SUPABASE_ANON_KEY, CACHE_TTL, HISTORY_LIMIT, shouldSkip, classify } from "./config.js";

const api = (typeof browser !== "undefined" ? browser : chrome);

// In-memory caches
const tabResults = new Map(); // tabId -> result
const urlCache = new Map();   // url -> { result, ts }
const inFlight = new Map();   // url -> Promise

const DEFAULT_SETTINGS = {
  autoScan: true,
  aggressive: false,
  notifications: true,
  whitelist: [],
  blacklist: [],
};

async function getSettings() {
  const { settings } = await api.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

async function pushHistory(entry) {
  const { history = [] } = await api.storage.local.get("history");
  history.unshift(entry);
  await api.storage.local.set({ history: history.slice(0, HISTORY_LIMIT) });
}

function getDomain(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

async function setBadge(tabId, result) {
  const { level, color, badgeText } = classify(result.label, result.confidence);
  try {
    await api.action.setBadgeBackgroundColor({ color, tabId });
    await api.action.setBadgeText({ text: badgeText, tabId });
    await api.action.setTitle({
      tabId,
      title: `PhishVision AI\nStatus: ${level.toUpperCase()}\nConfidence: ${result.confidence}%`,
    });
  } catch (_) {}
}

async function clearBadge(tabId) {
  try {
    await api.action.setBadgeText({ text: "", tabId });
  } catch (_) {}
}

async function scanUrl(url) {
  // Cache
  const cached = urlCache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result;
  if (inFlight.has(url)) return inFlight.get(url);

  const promise = (async () => {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
    const data = await res.json();
    const result = {
      url,
      label: data.label,
      confidence: Number(data.confidence) || 0,
      score: Number(data.score) || 0,
      timestamp: Date.now(),
    };
    urlCache.set(url, { result, ts: Date.now() });
    return result;
  })();

  inFlight.set(url, promise);
  try { return await promise; } finally { inFlight.delete(url); }
}

async function maybeNotify(tabId, url, result, level) {
  const settings = await getSettings();
  if (!settings.notifications || level !== "dangerous") return;
  try {
    await api.notifications.create(`phishvision-${tabId}-${Date.now()}`, {
      type: "basic",
      iconUrl: api.runtime.getURL("icon.png"),
      title: "Phishing detected",
      message: `${getDomain(url)} looks dangerous (${result.confidence}% risk).`,
      priority: 2,
    });
  } catch (_) {}
}

async function handleUrl(tabId, url, opts = {}) {
  if (shouldSkip(url)) { await clearBadge(tabId); return; }
  const settings = await getSettings();
  const domain = getDomain(url);

  if (settings.whitelist.includes(domain)) {
    const result = { url, label: "safe", confidence: 100, score: 0, timestamp: Date.now(), whitelisted: true };
    tabResults.set(tabId, result);
    await setBadge(tabId, result);
    return;
  }
  if (settings.blacklist.includes(domain)) {
    const result = { url, label: "phishing", confidence: 100, score: 100, timestamp: Date.now(), blacklisted: true };
    tabResults.set(tabId, result);
    await setBadge(tabId, result);
    await injectOverlay(tabId, result);
    return;
  }

  if (!settings.autoScan && !opts.force) return;

  try {
    const result = await scanUrl(url);
    tabResults.set(tabId, result);
    await setBadge(tabId, result);
    const { level } = classify(result.label, result.confidence);
    await pushHistory({ ...result, domain });
    await maybeNotify(tabId, url, result, level);
    if (level === "dangerous" || (settings.aggressive && level === "suspicious")) {
      await injectOverlay(tabId, result);
    }
  } catch (e) {
    console.warn("[PhishVision] scan error", e);
  }
}

async function injectOverlay(tabId, result) {
  try {
    await api.tabs.sendMessage(tabId, { type: "PV_SHOW_OVERLAY", result });
  } catch (_) {
    // Content script may not be ready; ignore
  }
}

// Debounce per tab
const debounceTimers = new Map();
function debouncedHandle(tabId, url) {
  clearTimeout(debounceTimers.get(tabId));
  debounceTimers.set(tabId, setTimeout(() => handleUrl(tabId, url), 300));
}

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    debouncedHandle(tabId, tab.url);
  }
});

api.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await api.tabs.get(tabId);
    if (tab?.url) debouncedHandle(tabId, tab.url);
  } catch (_) {}
});

if (api.webNavigation?.onCompleted) {
  api.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) debouncedHandle(details.tabId, details.url);
  });
}

api.tabs.onRemoved.addListener((tabId) => {
  tabResults.delete(tabId);
  debounceTimers.delete(tabId);
});

// Messaging API for popup + content
api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      switch (msg?.type) {
        case "PV_GET_TAB_RESULT": {
          const tabId = msg.tabId ?? sender.tab?.id;
          sendResponse({ ok: true, result: tabResults.get(tabId) || null });
          break;
        }
        case "PV_SCAN_TAB": {
          const tabId = msg.tabId;
          const tab = await api.tabs.get(tabId);
          await handleUrl(tabId, tab.url, { force: true });
          sendResponse({ ok: true, result: tabResults.get(tabId) || null });
          break;
        }
        case "PV_REPORT_SUSPICIOUS": {
          // Forward to existing report endpoint if needed; for now store locally
          const { reports = [] } = await api.storage.local.get("reports");
          reports.unshift({ url: msg.url, ts: Date.now(), reason: msg.reason || "user-report" });
          await api.storage.local.set({ reports: reports.slice(0, 100) });
          sendResponse({ ok: true });
          break;
        }
        case "PV_CONTENT_SIGNAL": {
          // Content script reporting suspicious DOM (e.g. password form on http)
          const tabId = sender.tab?.id;
          if (tabId != null) {
            const existing = tabResults.get(tabId);
            if (existing) {
              existing.signals = [...(existing.signals || []), msg.signal];
              tabResults.set(tabId, existing);
            }
            const settings = await getSettings();
            if (settings.notifications && msg.signal === "insecure-login-form") {
              try {
                await api.notifications.create(`pv-signal-${tabId}-${Date.now()}`, {
                  type: "basic",
                  iconUrl: api.runtime.getURL("icon.png"),
                  title: "Insecure login form detected",
                  message: `${getDomain(sender.tab.url)} is asking for a password over an insecure connection.`,
                });
              } catch (_) {}
            }
          }
          sendResponse({ ok: true });
          break;
        }
        default:
          sendResponse({ ok: false, error: "unknown" });
      }
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
  })();
  return true; // async
});

api.runtime.onInstalled.addListener(async () => {
  const { settings } = await api.storage.local.get("settings");
  if (!settings) await api.storage.local.set({ settings: DEFAULT_SETTINGS });
});