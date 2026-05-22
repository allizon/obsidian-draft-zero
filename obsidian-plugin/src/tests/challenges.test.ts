import { describe, it, expect } from "vitest";
import { defaultChallengeConfig, isChallengeActive, challengeLabel } from "../challenges";
import type { ChallengeConfig } from "../challenges";

describe("defaultChallengeConfig", () => {
  it("has both modes off by default", () => {
    expect(defaultChallengeConfig.noDelete).toBe(false);
    expect(defaultChallengeConfig.invisibleInk).toBe(false);
  });

  it("is a ChallengeConfig with exactly the two expected keys", () => {
    const keys = Object.keys(defaultChallengeConfig);
    expect(keys).toContain("noDelete");
    expect(keys).toContain("invisibleInk");
  });
});

describe("isChallengeActive", () => {
  it("returns true when noDelete is on", () => {
    expect(isChallengeActive({ noDelete: true, invisibleInk: false })).toBe(true);
  });

  it("returns true when invisibleInk is on", () => {
    expect(isChallengeActive({ noDelete: false, invisibleInk: true })).toBe(true);
  });

  it("returns true when both modes are on", () => {
    expect(isChallengeActive({ noDelete: true, invisibleInk: true })).toBe(true);
  });

  it("returns false when all modes are off", () => {
    expect(isChallengeActive({ noDelete: false, invisibleInk: false })).toBe(false);
  });

  it("returns false for the default config", () => {
    expect(isChallengeActive(defaultChallengeConfig)).toBe(false);
  });
});

describe("challengeLabel", () => {
  it("returns 'no-delete' when only noDelete is on", () => {
    expect(challengeLabel({ noDelete: true, invisibleInk: false })).toBe("no-delete");
  });

  it("returns 'invisible-ink' when only invisibleInk is on", () => {
    expect(challengeLabel({ noDelete: false, invisibleInk: true })).toBe("invisible-ink");
  });

  it("returns comma-joined labels when both modes are on", () => {
    expect(challengeLabel({ noDelete: true, invisibleInk: true })).toBe("no-delete, invisible-ink");
  });

  it("returns empty string when no modes are active", () => {
    expect(challengeLabel({ noDelete: false, invisibleInk: false })).toBe("");
  });

  it("returns empty string for the default config", () => {
    expect(challengeLabel(defaultChallengeConfig)).toBe("");
  });

  it("noDelete always appears before invisibleInk in the label", () => {
    const label = challengeLabel({ noDelete: true, invisibleInk: true });
    const noDeleteIdx = label.indexOf("no-delete");
    const invisibleIdx = label.indexOf("invisible-ink");
    expect(noDeleteIdx).toBeLessThan(invisibleIdx);
  });
});
