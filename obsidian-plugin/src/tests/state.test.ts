import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionStateMachine, getAnnoyanceLevel } from "../state";
import type { SessionState } from "../state";

const defaultGoal = { type: "time" as const, value: 600 };
const defaultConfig = { noDelete: false, invisibleInk: false };

describe("SessionStateMachine", () => {
  let machine: SessionStateMachine;
  let changes: SessionState[];

  beforeEach(() => {
    changes = [];
    machine = new SessionStateMachine((s) => changes.push({ ...s }));
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it("starts in idle status", () => {
    expect(machine.state.status).toBe("idle");
  });

  it("initial state has zero wordCount and elapsedSeconds", () => {
    expect(machine.state.wordCount).toBe(0);
    expect(machine.state.elapsedSeconds).toBe(0);
    expect(machine.state.lastTypedAt).toBeNull();
    expect(machine.state.goal).toBeNull();
    expect(machine.state.originalGoal).toBeNull();
  });

  // ── START ──────────────────────────────────────────────────────────────────

  it("START transitions to running", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    expect(machine.state.status).toBe("running");
    expect(machine.state.goal).toEqual(defaultGoal);
    expect(machine.state.text).toBe("");
    expect(changes).toHaveLength(1);
  });

  it("START stores originalGoal equal to goal", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    expect(machine.state.originalGoal).toEqual(defaultGoal);
  });

  it("START resets elapsedSeconds to 0", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "some text", config: defaultConfig });
    expect(machine.state.elapsedSeconds).toBe(0);
  });

  it("START resets lastTypedAt to null", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "hello", config: defaultConfig });
    expect(machine.state.lastTypedAt).toBeNull();
  });

  it("START with pre-existing text sets wordCount correctly", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "one two three", config: defaultConfig });
    expect(machine.state.wordCount).toBe(3);
  });

  it("START with empty text sets wordCount to 0", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    expect(machine.state.wordCount).toBe(0);
  });

  it("START with whitespace-only text sets wordCount to 0", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "   \n\t  ", config: defaultConfig });
    expect(machine.state.wordCount).toBe(0);
  });

  it("START stores challengeConfig", () => {
    const config = { noDelete: true, invisibleInk: false };
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config });
    expect(machine.state.challengeConfig).toEqual(config);
  });

  it("START from a running session restarts cleanly", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "first run", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "START", goal: { type: "words", value: 50 }, text: "", config: defaultConfig });
    expect(machine.state.status).toBe("running");
    expect(machine.state.elapsedSeconds).toBe(0);
    expect(machine.state.text).toBe("");
    expect(machine.state.goal).toEqual({ type: "words", value: 50 });
  });

  // ── TICK ───────────────────────────────────────────────────────────────────

  it("TICK increments elapsedSeconds", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.elapsedSeconds).toBe(1);
  });

  it("TICK accumulates over multiple dispatches", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.elapsedSeconds).toBe(3);
  });

  it("TICK triggers completion when time goal met", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 2 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.status).toBe("completed");
  });

  it("TICK does not auto-complete for a word goal", () => {
    machine.dispatch({ type: "START", goal: { type: "words", value: 5 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.status).toBe("running");
  });

  it("TICK on idle does not change state or call onChange", () => {
    machine.dispatch({ type: "TICK" });
    expect(machine.state.status).toBe("idle");
    expect(machine.state.elapsedSeconds).toBe(0);
    expect(changes).toHaveLength(0);
  });

  it("TICK on paused does not change elapsed or status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    const elapsedBefore = machine.state.elapsedSeconds;
    machine.dispatch({ type: "TICK" });
    expect(machine.state.elapsedSeconds).toBe(elapsedBefore);
    expect(machine.state.status).toBe("paused");
    expect(changes).toHaveLength(2);
  });

  it("TICK on completed does not change elapsed or status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    const elapsedBefore = machine.state.elapsedSeconds;
    machine.dispatch({ type: "TICK" });
    expect(machine.state.status).toBe("completed");
    expect(machine.state.elapsedSeconds).toBe(elapsedBefore);
    expect(changes).toHaveLength(2);
  });

  it("TICK in freewriting increments elapsed but does not complete", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" }); // completes
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.status).toBe("freewriting");
    machine.dispatch({ type: "TICK" });
    expect(machine.state.status).toBe("freewriting");
    expect(machine.state.elapsedSeconds).toBe(2);
  });

  it("TICK does not reset lastTypedAt", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello" });
    const typedAt = machine.state.lastTypedAt;
    machine.dispatch({ type: "TICK" });
    expect(machine.state.lastTypedAt).toBe(typedAt);
  });

  // ── TYPE ───────────────────────────────────────────────────────────────────

  it("TYPE updates text and wordCount, sets lastTypedAt", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello world" });
    expect(machine.state.text).toBe("hello world");
    expect(machine.state.wordCount).toBe(2);
    expect(machine.state.lastTypedAt).not.toBeNull();
  });

  it("TYPE triggers completion when word goal met", () => {
    machine.dispatch({ type: "START", goal: { type: "words", value: 2 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello world" });
    expect(machine.state.status).toBe("completed");
  });

  it("TYPE does not complete when word count is one short of goal", () => {
    machine.dispatch({ type: "START", goal: { type: "words", value: 3 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello world" });
    expect(machine.state.status).toBe("running");
  });

  it("TYPE with whitespace-only text sets wordCount to 0", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "  \n  " });
    expect(machine.state.wordCount).toBe(0);
  });

  it("TYPE in freewriting updates text but does not auto-complete", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" }); // completes
    machine.dispatch({ type: "FREEWRITE" });
    machine.dispatch({ type: "TYPE", text: "keep writing indefinitely" });
    expect(machine.state.status).toBe("freewriting");
    expect(machine.state.text).toBe("keep writing indefinitely");
    expect(machine.state.wordCount).toBe(3);
  });

  it("TYPE on paused does not change text, status, or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "TYPE", text: "some text" });
    expect(machine.state.text).toBe("");
    expect(machine.state.status).toBe("paused");
    expect(changes).toHaveLength(2);
  });

  it("TYPE on idle does not change text or call onChange", () => {
    machine.dispatch({ type: "TYPE", text: "some text" });
    expect(machine.state.text).toBe("");
    expect(machine.state.status).toBe("idle");
    expect(changes).toHaveLength(0);
  });

  it("TYPE on completed does not change text, status, or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "TYPE", text: "some text" });
    expect(machine.state.text).toBe("");
    expect(machine.state.status).toBe("completed");
    expect(changes).toHaveLength(2);
  });

  // ── COMPLETE ───────────────────────────────────────────────────────────────

  it("COMPLETE directly transitions running to completed", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    expect(machine.state.status).toBe("completed");
  });

  it("COMPLETE transitions freewriting to completed", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    machine.dispatch({ type: "COMPLETE" });
    expect(machine.state.status).toBe("completed");
  });

  it("COMPLETE on idle does not change status or call onChange", () => {
    machine.dispatch({ type: "COMPLETE" });
    expect(machine.state.status).toBe("idle");
    expect(changes).toHaveLength(0);
  });

  it("COMPLETE on paused does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "COMPLETE" });
    expect(machine.state.status).toBe("paused");
    expect(changes).toHaveLength(2);
  });

  it("COMPLETE when already completed does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "COMPLETE" });
    expect(machine.state.status).toBe("completed");
    expect(changes).toHaveLength(2);
  });

  // ── PAUSE / RESUME ─────────────────────────────────────────────────────────

  it("PAUSE suspends a running session", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    expect(machine.state.status).toBe("paused");
  });

  it("RESUME restores paused session to running", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "RESUME" });
    expect(machine.state.status).toBe("running");
  });

  it("PAUSE on idle does not change status or call onChange", () => {
    machine.dispatch({ type: "PAUSE" });
    expect(machine.state.status).toBe("idle");
    expect(changes).toHaveLength(0);
  });

  it("PAUSE when already paused does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "PAUSE" });
    expect(machine.state.status).toBe("paused");
    expect(changes).toHaveLength(2);
  });

  it("PAUSE on completed does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "PAUSE" });
    expect(machine.state.status).toBe("completed");
    expect(changes).toHaveLength(2);
  });

  it("PAUSE on freewriting does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    machine.dispatch({ type: "PAUSE" });
    expect(machine.state.status).toBe("freewriting");
    expect(changes).toHaveLength(3);
  });

  it("RESUME on running does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "RESUME" });
    expect(machine.state.status).toBe("running");
    expect(changes).toHaveLength(1);
  });

  it("RESUME on idle does not change status or call onChange", () => {
    machine.dispatch({ type: "RESUME" });
    expect(machine.state.status).toBe("idle");
    expect(changes).toHaveLength(0);
  });

  it("RESUME on completed does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "RESUME" });
    expect(machine.state.status).toBe("completed");
    expect(changes).toHaveLength(2);
  });

  it("elapsed time does not advance while paused", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "TICK" }); // no-op
    machine.dispatch({ type: "TICK" }); // no-op
    machine.dispatch({ type: "RESUME" });
    expect(machine.state.elapsedSeconds).toBe(1);
  });

  // ── EXTEND ─────────────────────────────────────────────────────────────────

  it("EXTEND from completed resets timer and continues running", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.status).toBe("completed");
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.status).toBe("running");
    expect(machine.state.elapsedSeconds).toBe(0);
  });

  it("EXTEND uses original goal duration for time goal", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 300 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.goal).toEqual({ type: "time", value: 300 });
    expect(machine.state.elapsedSeconds).toBe(0);
  });

  it("EXTEND uses original goal word count for word goal", () => {
    machine.dispatch({ type: "START", goal: { type: "words", value: 100 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello world foo bar baz qux quux corge grault garply waldo fred plugh thud".repeat(8) });
    machine.dispatch({ type: "COMPLETE" });
    const wordCountAtCompletion = machine.state.wordCount;
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.goal).toEqual({ type: "words", value: wordCountAtCompletion + 100 });
  });

  it("EXTEND preserves originalGoal across multiple extensions", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 300 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "EXTEND" });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.goal).toEqual({ type: "time", value: 300 });
    expect(machine.state.originalGoal).toEqual({ type: "time", value: 300 });
  });

  it("EXTEND on running does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.status).toBe("running");
    expect(changes).toHaveLength(1);
  });

  it("EXTEND on idle does not change status or call onChange", () => {
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.status).toBe("idle");
    expect(changes).toHaveLength(0);
  });

  it("EXTEND on paused does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.status).toBe("paused");
    expect(changes).toHaveLength(2);
  });

  it("EXTEND on freewriting does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    machine.dispatch({ type: "EXTEND" });
    expect(machine.state.status).toBe("freewriting");
    expect(changes).toHaveLength(3);
  });

  // ── FREEWRITE ──────────────────────────────────────────────────────────────

  it("FREEWRITE from completed enters freewriting status", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.status).toBe("freewriting");
  });

  it("FREEWRITE on running does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.status).toBe("running");
    expect(changes).toHaveLength(1);
  });

  it("FREEWRITE on idle does not change status or call onChange", () => {
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.status).toBe("idle");
    expect(changes).toHaveLength(0);
  });

  it("FREEWRITE on paused does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.status).toBe("paused");
    expect(changes).toHaveLength(2);
  });

  it("FREEWRITE when already freewriting does not change status or call onChange", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.status).toBe("freewriting");
    expect(changes).toHaveLength(3);
  });

  it("freewriting preserves goal and text from the sprint", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "some words" });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.text).toBe("some words");
    expect(machine.state.goal).toEqual({ type: "time", value: 1 });
  });

  // ── END ────────────────────────────────────────────────────────────────────

  it("END transitions to idle and clears session", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "something", config: defaultConfig });
    machine.dispatch({ type: "END" });
    expect(machine.state.status).toBe("idle");
  });

  it("END resets all session fields to defaults", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "hello world", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello world" });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "END" });
    expect(machine.state.text).toBe("");
    expect(machine.state.wordCount).toBe(0);
    expect(machine.state.elapsedSeconds).toBe(0);
    expect(machine.state.goal).toBeNull();
    expect(machine.state.originalGoal).toBeNull();
    expect(machine.state.lastTypedAt).toBeNull();
  });

  it("END from paused state resets to idle", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "PAUSE" });
    machine.dispatch({ type: "END" });
    expect(machine.state.status).toBe("idle");
  });

  it("END from completed state resets to idle", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    machine.dispatch({ type: "END" });
    expect(machine.state.status).toBe("idle");
  });

  it("END from freewriting state resets to idle", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    machine.dispatch({ type: "END" });
    expect(machine.state.status).toBe("idle");
  });

  it("END always calls onChange", () => {
    machine.dispatch({ type: "END" });
    expect(changes).toHaveLength(1);
    expect(machine.state.status).toBe("idle");
  });

  // ── onChange notification ──────────────────────────────────────────────────

  it("onChange is called with the updated state on START", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "hi", config: defaultConfig });
    expect(changes).toHaveLength(1);
    expect(changes[0].status).toBe("running");
    expect(changes[0].text).toBe("hi");
  });

  it("onChange receives a snapshot, not a reference that mutates later", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    const snapshot = changes[0];
    machine.dispatch({ type: "TICK" });
    expect(snapshot.elapsedSeconds).toBe(0);
    expect(machine.state.elapsedSeconds).toBe(1);
  });

  // ── Word count edge cases ──────────────────────────────────────────────────

  it("word count treats multiple consecutive spaces as one delimiter", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "one   two   three" });
    expect(machine.state.wordCount).toBe(3);
  });

  it("word count handles leading and trailing spaces", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "  hello world  " });
    expect(machine.state.wordCount).toBe(2);
  });

  it("word count handles newlines as word delimiters", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "line one\nline two\nline three" });
    expect(machine.state.wordCount).toBe(6);
  });

  // ── challengeConfig preservation ──────────────────────────────────────────

  it("challengeConfig is preserved through TICK, TYPE, and PAUSE", () => {
    const config = { noDelete: true, invisibleInk: true };
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.challengeConfig).toEqual(config);
    machine.dispatch({ type: "TYPE", text: "word" });
    expect(machine.state.challengeConfig).toEqual(config);
    machine.dispatch({ type: "PAUSE" });
    expect(machine.state.challengeConfig).toEqual(config);
    machine.dispatch({ type: "RESUME" });
    expect(machine.state.challengeConfig).toEqual(config);
  });

  it("challengeConfig is cleared on END", () => {
    const config = { noDelete: true, invisibleInk: true };
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config });
    machine.dispatch({ type: "END" });
    expect(machine.state.challengeConfig).toEqual({ noDelete: false, invisibleInk: false });
  });
});

describe("getAnnoyanceLevel", () => {
  it("returns 0 when lastTypedAt is null", () => {
    expect(getAnnoyanceLevel(null, Date.now())).toBe(0);
  });

  it("returns 0 when idle < 10s", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 9000, now)).toBe(0);
  });

  it("returns 0 at exactly 9 seconds idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 9999, now)).toBe(0);
  });

  it("returns 1 at exactly 10s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 10000, now)).toBe(1);
  });

  it("returns 1 between 10s and 20s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 15000, now)).toBe(1);
    expect(getAnnoyanceLevel(now - 19999, now)).toBe(1);
  });

  it("returns 2 at exactly 20s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 20000, now)).toBe(2);
  });

  it("returns 2 between 20s and 30s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 25000, now)).toBe(2);
    expect(getAnnoyanceLevel(now - 29999, now)).toBe(2);
  });

  it("returns 3 at exactly 30s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 30000, now)).toBe(3);
  });

  it("returns 3 beyond 30s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 60000, now)).toBe(3);
    expect(getAnnoyanceLevel(now - 300000, now)).toBe(3);
  });

  it("returns 0 when now equals lastTypedAt (zero idle)", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now, now)).toBe(0);
  });
});
