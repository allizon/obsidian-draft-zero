import { describe, it, expect } from "vitest";
import { defaultChallengeConfig, isChallengeActive, challengeLabel } from "../challenges";

describe("defaultChallengeConfig", () => {
  it("has both modes off by default", () => {
    expect(defaultChallengeConfig.noDelete).toBe(false);
    expect(defaultChallengeConfig.invisibleInk).toBe(false);
  });
});

describe("isChallengeActive", () => {
  it("returns true when any mode is on", () => {
    expect(isChallengeActive({ noDelete: true, invisibleInk: false })).toBe(true);
    expect(isChallengeActive({ noDelete: false, invisibleInk: true })).toBe(true);
    expect(isChallengeActive({ noDelete: true, invisibleInk: true })).toBe(true);
  });

  it("returns false when all modes off", () => {
    expect(isChallengeActive({ noDelete: false, invisibleInk: false })).toBe(false);
  });
});

describe("challengeLabel", () => {
  it("returns comma-joined names of active modes", () => {
    expect(challengeLabel({ noDelete: true, invisibleInk: false })).toBe("no-delete");
    expect(challengeLabel({ noDelete: false, invisibleInk: true })).toBe("invisible-ink");
    expect(challengeLabel({ noDelete: true, invisibleInk: true })).toBe("no-delete, invisible-ink");
  });

  it("returns empty string when no modes active", () => {
    expect(challengeLabel({ noDelete: false, invisibleInk: false })).toBe("");
  });
});
