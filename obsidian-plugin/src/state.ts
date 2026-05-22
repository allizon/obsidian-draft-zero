import type { ChallengeConfig } from "./challenges";

export interface Goal {
  type: "time" | "words";
  value: number;
}

export type SessionStatus = "idle" | "running" | "paused" | "completed" | "freewriting";

export interface SessionState {
  status: SessionStatus;
  goal: Goal | null;
  originalGoal: Goal | null;
  text: string;
  challengeConfig: ChallengeConfig;
  elapsedSeconds: number;
  lastTypedAt: number | null;
  wordCount: number;
}

export type SessionAction =
  | { type: "START"; goal: Goal; text: string; config: ChallengeConfig }
  | { type: "TICK" }
  | { type: "TYPE"; text: string }
  | { type: "COMPLETE" }
  | { type: "EXTEND" }
  | { type: "FREEWRITE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "END" };

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function isGoalMet(state: SessionState): boolean {
  if (!state.goal) return false;
  if (state.goal.type === "time") return state.elapsedSeconds >= state.goal.value;
  if (state.goal.type === "words") return state.wordCount >= state.goal.value;
  return false;
}

const idleState: SessionState = {
  status: "idle",
  goal: null,
  originalGoal: null,
  text: "",
  challengeConfig: { noDelete: false, invisibleInk: false },
  elapsedSeconds: 0,
  lastTypedAt: null,
  wordCount: 0,
};

export function getAnnoyanceLevel(lastTypedAt: number | null, now: number): 0 | 1 | 2 | 3 {
  if (lastTypedAt === null) return 0;
  const idleSeconds = (now - lastTypedAt) / 1000;
  if (idleSeconds >= 30) return 3;
  if (idleSeconds >= 20) return 2;
  if (idleSeconds >= 10) return 1;
  return 0;
}

export class SessionStateMachine {
  state: SessionState = { ...idleState };
  onChange: (state: SessionState) => void;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(onChange: (state: SessionState) => void) {
    this.onChange = onChange;
  }

  dispatch(action: SessionAction): void {
    const prev = this.state;
    let next = { ...prev };

    switch (action.type) {
      case "START":
        next = {
          status: "running",
          goal: action.goal,
          originalGoal: action.goal,
          text: action.text,
          challengeConfig: action.config,
          elapsedSeconds: 0,
          lastTypedAt: null,
          wordCount: countWords(action.text),
        };
        break;

      case "TICK":
        if (prev.status !== "running") break;
        next.elapsedSeconds = prev.elapsedSeconds + 1;
        if (isGoalMet(next)) next.status = "completed";
        break;

      case "TYPE":
        if (prev.status !== "running" && prev.status !== "freewriting") break;
        next.text = action.text;
        next.wordCount = countWords(action.text);
        next.lastTypedAt = Date.now();
        if (prev.status === "running" && isGoalMet(next)) next.status = "completed";
        break;

      case "COMPLETE":
        if (prev.status === "running" || prev.status === "freewriting") {
          next.status = "completed";
        }
        break;

      case "EXTEND":
        if (prev.status === "completed" && prev.goal && prev.originalGoal) {
          const extension = prev.originalGoal.value;
          next.status = "running";
          next.elapsedSeconds = 0;
          next.goal =
            prev.goal.type === "time"
              ? { type: "time", value: extension }
              : { type: "words", value: prev.wordCount + extension };
        }
        break;

      case "FREEWRITE":
        if (prev.status === "completed") next.status = "freewriting";
        break;

      case "PAUSE":
        if (prev.status === "running") next.status = "paused";
        break;

      case "RESUME":
        if (prev.status === "paused") next.status = "running";
        break;

      case "END":
        next = { ...idleState };
        break;
    }

    if (next !== prev) {
      this.state = next;
      this.onChange(next);
    }
  }

  startTimer(): void {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => this.dispatch({ type: "TICK" }), 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
