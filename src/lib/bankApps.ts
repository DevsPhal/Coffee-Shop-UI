/**
 * Banking apps the payment page can open on a phone. Payment still goes to the shop's Bakong
 * account: these apps have no public link that takes a KHQR, so the page opens the app and the
 * customer scans a screenshot (or saved copy) of the order's QR from the gallery inside it.
 *
 * ACLEDA publishes no iOS URL scheme or universal link, so on iPhone it opens via its App Store
 * page (whose Open button launches the installed app). Fill in `iosScheme` if ACLEDA confirms one.
 */
export type BankAppId = "aba" | "acleda";

export interface BankApp {
  name: string;
  /** Short label for the bank picker tile. */
  shortName: string;
  /** Brand colour for the tile and the "Open" button; `ink` is the text drawn on it. */
  color: string;
  ink: string;
  androidPackage: string;
  /** URL scheme that opens the app on iOS, when the bank has one. */
  iosScheme?: string;
  appStoreUrl: string;
  /** Where the "scan from photo" button is inside the app. */
  galleryHint: string;
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

/**
 * How to open the app. On Android, Chrome falls back to the Play Store page by itself when the
 * app isn't installed. On iOS without a scheme, the App Store page (in a new tab, so this page
 * keeps checking for the payment) has an Open button.
 */
export function bankAppLaunch(app: BankApp): { url: string; storePage: boolean } {
  if (isAndroid()) {
    const fallback = encodeURIComponent(storeUrl(app));
    // MAIN + LAUNCHER is what the home-screen icon sends. With only a package, Chrome builds a
    // VIEW intent with no data, which a bank app's launcher doesn't match — so it would jump to
    // the Play Store even with the app installed.
    return {
      url:
        "intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;" +
        `package=${app.androidPackage};S.browser_fallback_url=${fallback};end`,
      storePage: false,
    };
  }
  return app.iosScheme ? { url: app.iosScheme, storePage: false } : { url: app.appStoreUrl, storePage: true };
}
