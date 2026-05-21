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
    // Create a date explicitly via local constructor
    const d = new Date(2026, 4, 20); // May 20 2026
    expect(localDateKey(d)).toBe("2026-4-20");
  });
});

describe("isSameLocalDay", () => {
  it("returns true for same local day", () => {
    const a = new Date(2026, 4, 20, 8, 0, 0);
    const b = new Date(2026, 4, 20, 23, 59, 59);
    expect(isSameLocalDay(a, b)).toBe(true);
  });

  it("returns false for different days", () => {
    const a = new Date(2026, 4, 20, 23, 0, 0);
    const b = new Date(2026, 4, 21, 0, 0, 0);
    expect(isSameLocalDay(a, b)).toBe(false);
  });

  it("returns false for same time different months", () => {
    const a = new Date(2026, 3, 20);
    const b = new Date(2026, 4, 20);
    expect(isSameLocalDay(a, b)).toBe(false);
  });
});
