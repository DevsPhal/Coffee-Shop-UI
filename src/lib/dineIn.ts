"use client";

import { useSyncExternalStore } from "react";

// Remembers the table a customer scanned so checkout can send the order as dine-in.
// A scan only counts for one visit: it expires after a few hours.
const STORAGE_KEY = "dinein:table";
const EVENT = "dinein-change";
const TTL_MS = 6 * 60 * 60 * 1000;

type Stored = { tableNumber: string; scannedAt: number };

function read(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Stored;
    if (!stored.tableNumber || Date.now() - stored.scannedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored.tableNumber;
  } catch {
    return null;
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

export function setDineInTable(tableNumber: string) {
  write({ tableNumber: tableNumber.trim().toUpperCase(), scannedAt: Date.now() });
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

export function useDineInTable(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
