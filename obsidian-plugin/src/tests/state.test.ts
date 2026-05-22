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

  it("starts in idle status", () => {
    expect(machine.state.status).toBe("idle");
  });

  it("START transitions to running", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    expect(machine.state.status).toBe("running");
    expect(machine.state.goal).toEqual(defaultGoal);
    expect(machine.state.text).toBe("");
    expect(changes).toHaveLength(1);
  });

  it("TICK increments elapsedSeconds", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.elapsedSeconds).toBe(1);
  });

  it("TICK triggers COMPLETE when time goal met", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 2 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "TICK" });
    expect(machine.state.status).toBe("completed");
  });

  it("TYPE updates text and wordCount, sets lastTypedAt", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello world" });
    expect(machine.state.text).toBe("hello world");
    expect(machine.state.wordCount).toBe(2);
    expect(machine.state.lastTypedAt).not.toBeNull();
  });

  it("TYPE triggers COMPLETE when word goal met", () => {
    machine.dispatch({ type: "START", goal: { type: "words", value: 2 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TYPE", text: "hello world" });
    expect(machine.state.status).toBe("completed");
  });

  it("PAUSE suspends running session", () => {
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

  it("FREEWRITE from completed enters freewriting status", () => {
    machine.dispatch({ type: "START", goal: { type: "time", value: 1 }, text: "", config: defaultConfig });
    machine.dispatch({ type: "TICK" });
    machine.dispatch({ type: "FREEWRITE" });
    expect(machine.state.status).toBe("freewriting");
  });

  it("END transitions to idle and clears session", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "something", config: defaultConfig });
    machine.dispatch({ type: "END" });
    expect(machine.state.status).toBe("idle");
  });

  it("COMPLETE action directly triggers completion", () => {
    machine.dispatch({ type: "START", goal: defaultGoal, text: "", config: defaultConfig });
    machine.dispatch({ type: "COMPLETE" });
    expect(machine.state.status).toBe("completed");
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

  it("returns 1 at 10s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 10000, now)).toBe(1);
  });

  it("returns 2 at 20s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 20000, now)).toBe(2);
  });

  it("returns 3 at 30s idle", () => {
    const now = Date.now();
    expect(getAnnoyanceLevel(now - 30000, now)).toBe(3);
  });
});
