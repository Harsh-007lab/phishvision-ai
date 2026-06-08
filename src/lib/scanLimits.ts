// Scan limits & local scan history (for guests).
// - Guests: 5 scans/day, store up to 5 recent scans in localStorage.
// - Authenticated free: 20 scans/day.
// - Pro: unlimited (no enforcement here; treated like high cap).

const DAY_KEY = "pv_scan_day";
const COUNT_KEY = "pv_scan_count";
const LOCAL_HISTORY_KEY = "pv_local_history";
const GUEST_PROMPT_KEY = "pv_guest_prompt_shown";

export const GUEST_DAILY_LIMIT = 5;
export const FREE_DAILY_LIMIT = 20;
export const LOCAL_HISTORY_MAX = 5;

export type Tier = "guest" | "free" | "pro";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCount(): number {
  try {
    const day = localStorage.getItem(DAY_KEY);
    if (day !== today()) {
      localStorage.setItem(DAY_KEY, today());
      localStorage.setItem(COUNT_KEY, "0");
      return 0;
    }
    return parseInt(localStorage.getItem(COUNT_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function getScanCountToday(): number {
  return readCount();
}

export function incrementScanCount(): number {
  const next = readCount() + 1;
  try {
    localStorage.setItem(DAY_KEY, today());
    localStorage.setItem(COUNT_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function getLimit(tier: Tier): number {
  if (tier === "pro") return Infinity;
  if (tier === "free") return FREE_DAILY_LIMIT;
  return GUEST_DAILY_LIMIT;
}

export function isOverLimit(tier: Tier): boolean {
  return readCount() >= getLimit(tier);
}

export interface LocalScan {
  id: string;
  url: string;
  verdict: string;
  threat_score: number;
  scanned_at: string;
}

export function getLocalHistory(): LocalScan[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function pushLocalHistory(scan: LocalScan): LocalScan[] {
  const items = [scan, ...getLocalHistory()].slice(0, LOCAL_HISTORY_MAX);
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  return items;
}

export function shouldShowGuestSignupPrompt(): boolean {
  try {
    if (localStorage.getItem(GUEST_PROMPT_KEY) === "1") return false;
    return getLocalHistory().length >= 3;
  } catch {
    return false;
  }
}

export function markGuestSignupPromptShown() {
  try {
    localStorage.setItem(GUEST_PROMPT_KEY, "1");
  } catch {
    /* ignore */
  }
}