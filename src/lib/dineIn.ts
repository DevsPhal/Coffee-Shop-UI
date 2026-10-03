"use client";

import { useSyncExternalStore } from "react";

// Remembers that the customer is ordering at the shop, so checkout sends the order as dine-in.
// The shop-wide menu QR starts dine-in without a table (the customer types it at checkout);
// a table's own QR, or typing the number, also remembers which table.
// A scan only counts for one visit: it expires after a few hours.
const STORAGE_KEY = "dinein:table";
const EVENT = "dinein-change";
const TTL_MS = 6 * 60 * 60 * 1000;

type Stored = { tableNumber: string | null; scannedAt: number };
export type DineIn = { active: boolean; tableNumber: string | null };

const INACTIVE: DineIn = { active: false, tableNumber: null };
let cachedRaw: string | null = null;
let cachedValue: DineIn = INACTIVE;

function read(): DineIn {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = INACTIVE;
    if (!raw) return cachedValue;
    const stored = JSON.parse(raw) as Stored;
    if (Date.now() - stored.scannedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      cachedRaw = null;
      return cachedValue;
    }
    cachedValue = { active: true, tableNumber: stored.tableNumber || null };
    return cachedValue;
  } catch {
    return INACTIVE;
  }
}

function write(value: Stored | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
  window.dispatchEvent(new Event(EVENT));
}

export function normalizeTableNumber(value: string) {
  return value.trim().toUpperCase();
}

export const TABLE_NUMBER_PATTERN = /^[A-Z0-9-]{1,20}$/;

/** Start dine-in from the shop-wide menu QR; keeps a table already chosen this visit. */
export function startDineIn() {
  write({ tableNumber: read().tableNumber, scannedAt: Date.now() });
}

export function setDineInTable(tableNumber: string) {
  write({ tableNumber: normalizeTableNumber(tableNumber), scannedAt: Date.now() });
}

export function clearDineInTable() {
  write(null);
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useDineIn(): DineIn {
  return useSyncExternalStore(subscribe, read, () => INACTIVE);
}

export function useDineInTable(): string | null {
  return useDineIn().tableNumber;
}
