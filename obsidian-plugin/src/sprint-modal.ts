import { App, Modal } from "obsidian";
import { SessionStateMachine, getAnnoyanceLevel } from "./state";
import type { Goal } from "./state";
import type { ChallengeConfig } from "./challenges";
import type { SetupResult } from "./setup-modal";

export class SprintModal extends Modal {
  private machine: SessionStateMachine;
  private setupResult: SetupResult;
  private seedText: string;
  private textarea: HTMLTextAreaElement | null = null;
  private annoyanceEl: HTMLElement | null = null;
  private bottomRowEl: HTMLElement | null = null;
  private statusKeyEl: HTMLElement | null = null;
  private statusDetailEl: HTMLElement | null = null;
  private pauseBtn: HTMLButtonElement | null = null;
  private exitBtn: HTMLButtonElement | null = null;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private annoyanceInterval: ReturnType<typeof setInterval> | null = null;
  onFinish: (text: string, goal: Goal, durationSeconds: number, completed: boolean) => void;

  constructor(
    app: App,
    setupResult: SetupResult,
    initialText: string,
    onFinish: (text: string, goal: Goal, durationSeconds: number, completed: boolean) => void,
    seedText = ""
  ) {
    super(app);
    this.setupResult = setupResult;
    this.seedText = seedText;
    this.onFinish = onFinish;
    this.machine = new SessionStateMachine(() => this.render());
    this.machine.dispatch({
      type: "START",
      goal: setupResult.goal,
      text: initialText,
      config: setupResult.challengeConfig,
    });
  }

  onOpen(): void {
    const { contentEl, modalEl } = this;
    modalEl.addClass("dz-sprint-modal");
    contentEl.addClass("dz-sprint-content");
    contentEl.empty();
    this.textarea = null;
    this.bottomRowEl = null;
    this.statusKeyEl = null;
    this.statusDetailEl = null;
    this.annoyanceEl = null;

    // Obsidian processes scope handlers LIFO, so this fires before the
    // Modal default Escape→close handler registered in the constructor.
    this.scope.register([], "Escape", () => {
      if (this.machine.state.status !== "idle") return false;
      this.close();
      return false;
    });

    this.render();
    this.machine.startTimer();

    this.autoSaveInterval = setInterval(() => {
      if (this.textarea) {
        // Trigger auto-save via callback to parent
        this.app.workspace.trigger("draft-zero:autosave", {
          text: this.machine.state.text,
          goal: this.machine.state.goal,
        });
      }
    }, 30000);

    this.annoyanceInterval = setInterval(() => {
      this.updateAnnoyance();
    }, 1000);
  }

  private render(): void {
    const { contentEl } = this;
    const { status, goal, text, challengeConfig, elapsedSeconds, wordCount } =
      this.machine.state;

    // On first render, build the skeleton
    if (!this.textarea) {
      contentEl.empty();

      if (this.seedText) {
        const seedEl = contentEl.createDiv({ cls: "dz-seed-text" });
        seedEl.setText(this.seedText);
      }

      this.textarea = contentEl.createEl("textarea", { cls: "dz-textarea" });
      this.textarea.value = text;
      this.textarea.addEventListener("input", () => {
        if (this.textarea) {
          this.machine.dispatch({ type: "TYPE", text: this.textarea.value });
        }
      });

      // No-delete: block Backspace, Delete, Ctrl/Cmd+X while running
      this.textarea.addEventListener("keydown", (e) => {
        if (this.machine.state.status !== "running") return;
        if (!this.machine.state.challengeConfig.noDelete) return;
        if (["Backspace", "Delete"].includes(e.key)) e.preventDefault();
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x")
          e.preventDefault();
      });

      this.bottomRowEl = contentEl.createDiv({ cls: "dz-bottom-row" });

      const statusSpan = this.bottomRowEl.createSpan({ cls: "dz-bottom-status" });
      this.statusKeyEl = statusSpan.createSpan({ cls: "dz-status-key" });
      this.statusDetailEl = statusSpan.createSpan({ cls: "dz-status-detail" });

      const actionsSpan = this.bottomRowEl.createSpan({ cls: "dz-bottom-actions" });

      this.pauseBtn = actionsSpan.createEl("button", { text: "Pause", cls: "dz-controls-btn" });
      this.pauseBtn.addEventListener("click", () => {
        const { status } = this.machine.state;
        if (status === "running") {
          this.machine.dispatch({ type: "PAUSE" });
        } else if (status === "paused") {
          this.machine.dispatch({ type: "RESUME" });
          this.textarea?.focus();
        }
      });

      this.exitBtn = actionsSpan.createEl("button", { text: "Exit", cls: "dz-controls-btn dz-controls-exit" });
      this.exitBtn.addEventListener("click", () => {
        if (window.confirm("End your sprint early? Your progress will be saved.")) {
          this.finish();
        }
      });

      this.annoyanceEl = contentEl.createDiv({ cls: "dz-annoyance-badge" });

      // Invisible ink: toggle class based on status
      this.updateInvisibleInk();

      setTimeout(() => this.textarea?.focus(), 50);
    }

    // Update bottom row (status + controls)
    this.updateBottomRow(status, goal, elapsedSeconds, wordCount);

    // Show completion UI if completed or freewriting
    const existingCompletion = contentEl.querySelector(".dz-completion");
    if (status === "completed" && !existingCompletion) {
      this.renderCompletionUI();
    } else if (status !== "completed" && existingCompletion) {
      existingCompletion.remove();
    }

    // Update invisible ink
    this.updateInvisibleInk();

    // Update annoyance level CSS class
    this.updateAnnoyance();
  }

  private updateBottomRow(
    status: string,
    goal: Goal | null,
    elapsedSeconds: number,
    wordCount: number
  ): void {
    if (!this.statusKeyEl || !this.statusDetailEl || !this.pauseBtn || !this.exitBtn || !goal) return;

    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    const timeStr = `${m}:${String(s).padStart(2, "0")}`;

    let key: string;
    let detail: string;

    if (goal.type === "time") {
      const remaining = Math.max(0, goal.value - elapsedSeconds);
      const rm = Math.floor(remaining / 60);
      const rs = remaining % 60;
      key = `${rm}:${String(rs).padStart(2, "0")}`;
      detail = ` · ${timeStr} elapsed · ${wordCount} words`;
    } else {
      key = `${wordCount} / ${goal.value}`;
      detail = ` · ${timeStr}`;
    }

    if (status === "paused") {
      key = "Paused";
      detail = ` · ${timeStr} · ${wordCount} words`;
    } else if (status === "freewriting") {
      key = "Freewriting";
      const og = this.machine.state.originalGoal;
      let goalIndicator = "";
      if (og) {
        if (og.type === "time") {
          const gm = Math.floor(og.value / 60);
          const gs = og.value % 60;
          goalIndicator = ` · ✓ ${gm}:${String(gs).padStart(2, "0")}`;
        } else {
          goalIndicator = ` · ✓ ${og.value} words`;
        }
      }
      detail = `${goalIndicator} · ${timeStr} elapsed / ${wordCount} words`;
    } else if (status === "completed") {
      detail = ` · ${timeStr} · ${wordCount} words`;
    }

    this.statusKeyEl.setText(key);
    this.statusDetailEl.setText(detail);

    // Buttons: hidden in completed state, pause hidden in freewriting
    const showButtons = status !== "completed";
    this.exitBtn.style.display = showButtons ? "" : "none";
    if (status === "paused") {
      this.pauseBtn.setText("Resume");
      this.pauseBtn.style.display = "";
    } else if (status === "running") {
      this.pauseBtn.setText("Pause");
      this.pauseBtn.style.display = "";
    } else {
      this.pauseBtn.style.display = "none";
    }
  }

  private renderCompletionUI(): void {
    const { contentEl } = this;
    const div = contentEl.createDiv({ cls: "dz-completion" });
    div.createEl("p", { text: "Goal reached! Keep going?" });

    const { originalGoal } = this.machine.state;
    let extendLabel = "Extend";
    if (originalGoal) {
      if (originalGoal.type === "time") {
        const mins = Math.round(originalGoal.value / 60);
        extendLabel = `Extend (+${mins} min)`;
      } else {
        extendLabel = `Extend (+${originalGoal.value} words)`;
      }
    }
    const extendBtn = div.createEl("button", { text: extendLabel });
    extendBtn.addEventListener("click", () => {
      this.machine.dispatch({ type: "EXTEND" });
      div.remove();
      this.textarea?.focus();
    });

    const freeBtn = div.createEl("button", { text: "Freewrite" });
    freeBtn.addEventListener("click", () => {
      this.machine.dispatch({ type: "FREEWRITE" });
      div.remove();
      this.textarea?.focus();
    });

    const finishBtn = div.createEl("button", { text: "Finish", cls: "mod-cta" });
    finishBtn.addEventListener("click", () => {
      this.finish();
    });
  }

  private updateInvisibleInk(): void {
    if (!this.textarea) return;
    const { status, challengeConfig } = this.machine.state;
    if (challengeConfig.invisibleInk && status === "running") {
      this.textarea.addClass("dz-invisible-ink");
    } else {
      this.textarea.removeClass("dz-invisible-ink");
    }
  }

  private updateAnnoyance(): void {
    const { modalEl, annoyanceEl } = this;
    if (!annoyanceEl) return;
    const { status, lastTypedAt } = this.machine.state;

    if (status !== "running") {
      modalEl.removeClass("dz-annoyance-1", "dz-annoyance-2", "dz-annoyance-3");
      annoyanceEl.style.display = "none";
      return;
    }

    const level = getAnnoyanceLevel(lastTypedAt, Date.now());
    modalEl.removeClass("dz-annoyance-1", "dz-annoyance-2", "dz-annoyance-3");
    if (level > 0) {
      modalEl.addClass(`dz-annoyance-${level}`);
      annoyanceEl.style.display = "";
      const msgs = ["", "Keep writing...", "Don't stop!", "WRITE!"];
      annoyanceEl.setText(msgs[level]);
    } else {
      annoyanceEl.style.display = "none";
    }
  }

  private finish(): void {
    const { text, goal, elapsedSeconds } = this.machine.state;
    const completed = this.machine.state.status === "completed" || this.machine.state.status === "freewriting";
    const finalText = this.textarea?.value ?? text;
    this.machine.dispatch({ type: "END" });
    this.close();
    this.onFinish(finalText, goal!, elapsedSeconds, completed);
  }

  close(): void {
    // Block Escape (and any other close trigger) while a session is active.
    // finish() dispatches END first, setting status to idle, so it always gets through.
    if (this.machine.state.status !== "idle") return;
    super.close();
  }

  onClose(): void {
    this.machine.stopTimer();
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    if (this.annoyanceInterval) clearInterval(this.annoyanceInterval);
    this.contentEl.empty();
  }
}
