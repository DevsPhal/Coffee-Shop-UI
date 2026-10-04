// Banking apps customers pay our Bakong KHQR with. We don't deep-link into them: the customer
// saves or shares the QR, then scans it from their photos in whichever app they use.

export type BankAppId = "aba" | "acleda" | "bakong" | "other";

export interface BankApp {
  name: string;
  shortName: string;
  color: string;
  ink: string;
  /** Where the "scan from photos" button is, finishing "Open <app>, …". */
  galleryHint: string;
}

export const BANK_APPS: Record<BankAppId, BankApp> = {
  aba: {
    name: "ABA Mobile",
    shortName: "ABA",
    color: "#005D7E",
    ink: "#ffffff",
    galleryHint: "tap Scan QR, then the gallery icon",
  },
  acleda: {
    name: "ACLEDA mobile",
    shortName: "ACLEDA",
    color: "#173F73",
    ink: "#ffffff",
    galleryHint: "tap Scan QR, then Select QR",
  },
  bakong: {
    name: "Bakong",
    shortName: "Bakong",
    color: "#E21F26",
    ink: "#ffffff",
    galleryHint: "tap Scan, then the photo icon",
  },
  other: {
    name: "your bank app",
    shortName: "Other",
    color: "#374151",
    ink: "#ffffff",
    galleryHint: "open its KHQR scanner and choose a photo",
  },
};
