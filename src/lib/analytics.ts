import { siteConfig } from "../../config/site";

type EventName =
  | "hero_cta_click"
  | "plan_click"
  | "whatsapp_click"
  | "lead_submit"
  | "lead_success";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: EventName, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    if (siteConfig.analytics.ga4 && typeof window.gtag === "function") {
      window.gtag("event", name, params ?? {});
    }
    if (siteConfig.analytics.metaPixel && typeof window.fbq === "function") {
      window.fbq("trackCustom", name, params ?? {});
    }
  } catch (e) {
    console.warn("[analytics] event failed", e);
  }
}

export function captureUtmParams() {
  if (typeof window === "undefined") return { source: "direct" as string };
  const url = new URL(window.location.href);
  const sp = url.searchParams;
  const ref = document.referrer || "";
  const refHost = (() => {
    try {
      return ref ? new URL(ref).hostname : "";
    } catch {
      return "";
    }
  })();

  const fromRef = (host: string): string => {
    if (!host) return "direct";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("facebook")) return "facebook";
    if (host.includes("google")) return "google";
    if (host.includes("linkedin")) return "linkedin";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("youtube")) return "youtube";
    return "organic";
  };

  return {
    source: sp.get("utm_source") || fromRef(refHost),
    utm_source: sp.get("utm_source") || undefined,
    utm_medium: sp.get("utm_medium") || undefined,
    utm_campaign: sp.get("utm_campaign") || undefined,
  };
}