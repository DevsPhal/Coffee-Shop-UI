export type BankAppId = "aba" | "acleda";

export interface BankApp {
  name: string;
  shortName: string;
  color: string;
  ink: string;
  androidPackage: string;
  iosScheme?: string;
  appStoreUrl: string;
  galleryHint: string;
  khqrLink?: (khqr: string) => string;
}

export const BANK_APPS: Record<BankAppId, BankApp> = {
  aba: {
    name: "ABA Mobile",
    shortName: "ABA",
    color: "#005D7E",
    ink: "#ffffff",
    androidPackage: "com.paygo24.ibank",
    iosScheme: "abamobilebank://ababank.com",
    appStoreUrl: "https://apps.apple.com/app/id968860649",
    galleryHint: "tap Scan QR, then the gallery icon",
    khqrLink: (khqr) =>
      `abamobilebank://ababank.com?${new URLSearchParams({ type: "payway", qrcode: khqr }).toString()}`,
  },
  acleda: {
    name: "ACLEDA mobile",
    shortName: "ACLEDA",
    color: "#173F73",
    ink: "#ffffff",
    androidPackage: "com.domain.acledabankqr",
    appStoreUrl: "https://apps.apple.com/app/id1196285236",
    galleryHint: "tap Scan QR, then Select QR",
  },
};

const isAndroid = () => /Android/i.test(navigator.userAgent);

export const storeUrl = (app: BankApp) =>
  isAndroid() ? `https://play.google.com/store/apps/details?id=${app.androidPackage}` : app.appStoreUrl;

export function bankAppLaunch(app: BankApp): { url: string; storePage: boolean } {
  if (isAndroid()) {
    const fallback = encodeURIComponent(storeUrl(app));
    return {
      url:
        "intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;" +
        `package=${app.androidPackage};S.browser_fallback_url=${fallback};end`,
      storePage: false,
    };
  }
  return app.iosScheme ? { url: app.iosScheme, storePage: false } : { url: app.appStoreUrl, storePage: true };
}

export function bankAppPayLaunch(app: BankApp, khqr: string): string | null {
  if (!app.khqrLink) return null;
  const link = app.khqrLink(khqr);
  if (!isAndroid()) return link;
  const [scheme, rest] = link.split("://");
  const fallback = encodeURIComponent(storeUrl(app));
  return `intent://${rest}#Intent;scheme=${scheme};package=${app.androidPackage};S.browser_fallback_url=${fallback};end`;
}
