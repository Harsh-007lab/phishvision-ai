// Shared URL validation + normalization for scan inputs.

const TLD_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,24}$/i;
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export interface UrlValidation {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function validateScanUrl(input: string): UrlValidation {
  const raw = input.trim();
  if (!raw) {
    return { valid: false, normalized: "", error: "Enter a URL to scan." };
  }
  if (/\s/.test(raw)) {
    return { valid: false, normalized: raw, error: "A URL can't contain spaces." };
  }

  const normalized = normalizeUrl(raw);
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, normalized, error: "That doesn't look like a valid URL. Try example.com or https://example.com" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, normalized, error: "Only http:// and https:// links can be scanned." };
  }

  const host = parsed.hostname.replace(/\.$/, "");
  if (!host) {
    return { valid: false, normalized, error: "Missing a domain name — try example.com" };
  }
  if (host === "localhost" || IPV4_RE.test(host)) {
    if (IPV4_RE.test(host) && host.split(".").some((o) => Number(o) > 255)) {
      return { valid: false, normalized, error: "That IP address isn't valid." };
    }
    return { valid: true, normalized };
  }
  if (!host.includes(".")) {
    return { valid: false, normalized, error: "Enter a full domain, like example.com — not just a word." };
  }
  if (!TLD_RE.test(host)) {
    return { valid: false, normalized, error: "That doesn't look like a valid domain. Try example.com or https://example.com" };
  }

  return { valid: true, normalized };
}
