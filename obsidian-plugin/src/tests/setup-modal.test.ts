import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "obsidian";
import { SetupModal } from "../setup-modal";
import { DEFAULT_SETTINGS } from "../storage";
import type { SetupResult } from "../setup-modal";

const baseSettings = {
  ...DEFAULT_SETTINGS,
  lastUsedGoalType: "time" as const,
  lastUsedGoalValue: 600,
  lastUsedChallengeConfig: { noDelete: false, invisibleInk: false },
};

describe("SetupModal — Enter key", () => {
  let onSubmit: (result: SetupResult) => void;
  let modal: SetupModal;

  beforeEach(() => {
    onSubmit = vi.fn() as unknown as (result: SetupResult) => void;
    modal = new SetupModal(new App() as any, baseSettings, onSubmit);
    modal.onOpen();
  });

  it("pressing Enter calls onSubmit with the current form values", () => {
    modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      goal: { type: "time", value: 600 },
      challengeConfig: { noDelete: false, invisibleInk: false },
      saveDestination: "new-file",
    });
  });

  it("pressing a non-Enter key does not call onSubmit", () => {
    modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
