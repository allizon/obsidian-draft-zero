import { describe, it, expect } from "vitest";
import { localDateKey, isSameLocalDay } from "../date-utils";

describe("localDateKey", () => {
  it("returns YYYY-M-D with 0-based month", () => {
    // January is month 0
    const d = new Date(2026, 0, 5); // Jan 5 2026
    expect(localDateKey(d)).toBe("2026-0-5");
  });

  it("handles December (month 11)", () => {
    const d = new Date(2026, 11, 31);
    expect(localDateKey(d)).toBe("2026-11-31");
  });

  it("uses local time, not UTC", () => {
    const d = new Date(2026, 4, 20); // May 20 2026
    expect(localDateKey(d)).toBe("2026-4-20");
  });

  it("does not zero-pad month or day", () => {
    // month 0 (Jan) and day 1 — should be "2026-0-1" not "2026-00-01"
    const d = new Date(2026, 0, 1);
    expect(localDateKey(d)).toBe("2026-0-1");
    expect(localDateKey(d)).not.toContain("00");
  });

  it("handles a mid-year date", () => {
    const d = new Date(2024, 6, 4); // July 4 2024
    expect(localDateKey(d)).toBe("2024-6-4");
  });

  it("different times on the same local day produce the same key", () => {
    const morning = new Date(2026, 4, 20, 0, 0, 1);
    const evening = new Date(2026, 4, 20, 23, 59, 59);
    expect(localDateKey(morning)).toBe(localDateKey(evening));
  });

  it("consecutive days produce different keys", () => {
    const d1 = new Date(2026, 4, 20);
    const d2 = new Date(2026, 4, 21);
    expect(localDateKey(d1)).not.toBe(localDateKey(d2));
  });
});

describe("isSameLocalDay", () => {
  it("returns true for same local day", () => {
    const a = new Date(2026, 4, 20, 8, 0, 0);
    const b = new Date(2026, 4, 20, 23, 59, 59);
    expect(isSameLocalDay(a, b)).toBe(true);
  });

  it("returns true for exact same date objects", () => {
    const a = new Date(2026, 4, 20, 12, 0, 0);
    const b = new Date(2026, 4, 20, 12, 0, 0);
    expect(isSameLocalDay(a, b)).toBe(true);
  });

  it("returns false for adjacent days", () => {
    const a = new Date(2026, 4, 20, 23, 0, 0);
    const b = new Date(2026, 4, 21, 0, 0, 0);
    expect(isSameLocalDay(a, b)).toBe(false);
  });

  it("returns false for same time different months", () => {
    const a = new Date(2026, 3, 20);
    const b = new Date(2026, 4, 20);
    expect(isSameLocalDay(a, b)).toBe(false);
  });

  it("returns false for same day different years", () => {
    const a = new Date(2025, 4, 20);
    const b = new Date(2026, 4, 20);
    expect(isSameLocalDay(a, b)).toBe(false);
  });

  it("returns false for day 1 vs day 2 of same month", () => {
    const a = new Date(2026, 0, 1);
    const b = new Date(2026, 0, 2);
    expect(isSameLocalDay(a, b)).toBe(false);
  });

  it("is commutative — (a, b) equals (b, a)", () => {
    const a = new Date(2026, 4, 20, 8, 0, 0);
    const b = new Date(2026, 4, 20, 22, 0, 0);
    expect(isSameLocalDay(a, b)).toBe(isSameLocalDay(b, a));

    const c = new Date(2026, 4, 20);
    const d = new Date(2026, 4, 21);
    expect(isSameLocalDay(c, d)).toBe(isSameLocalDay(d, c));
  });

  it("handles month boundary correctly", () => {
    const endOfJan = new Date(2026, 0, 31, 23, 59, 59);
    const startOfFeb = new Date(2026, 1, 1, 0, 0, 0);
    expect(isSameLocalDay(endOfJan, startOfFeb)).toBe(false);
  });
});
