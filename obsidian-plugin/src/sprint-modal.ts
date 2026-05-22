import { App, Modal } from "obsidian";
import { SessionStateMachine, getAnnoyanceLevel } from "./state";
import type { Goal } from "./state";
import type { ChallengeConfig } from "./challenges";
import type { SetupResult } from "./setup-modal";

export class SprintModal extends Modal {
  private machine: SessionStateMachine;
  private setupResult: SetupResult;
  private textarea: HTMLTextAreaElement | null = null;
  private annoyanceEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private statusKeyEl: HTMLElement | null = null;
  private statusDetailEl: HTMLElement | null = null;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private annoyanceInterval: ReturnType<typeof setInterval> | null = null;
  onFinish: (text: string, goal: Goal, durationSeconds: number, completed: boolean) => void;

  constructor(
    app: App,
    setupResult: SetupResult,
    initialText: string,
    onFinish: (text: string, goal: Goal, durationSeconds: number, completed: boolean) => void
  ) {
    super(app);
    this.setupResult = setupResult;
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
    this.statusEl = null;
    this.statusKeyEl = null;
    this.statusDetailEl = null;
    this.annoyanceEl = null;

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

      this.statusEl = contentEl.createDiv({ cls: "dz-status" });
      this.statusKeyEl = this.statusEl.createSpan({ cls: "dz-status-key" });
      this.statusDetailEl = this.statusEl.createSpan({ cls: "dz-status-detail" });

      this.annoyanceEl = contentEl.createDiv({ cls: "dz-annoyance-badge" });

      // Invisible ink: toggle class based on status
      this.updateInvisibleInk();

      setTimeout(() => this.textarea?.focus(), 50);
    }

    // Update status bar
    this.updateStatusBar(status, goal, elapsedSeconds, wordCount);

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

  private updateStatusBar(
    status: string,
    goal: Goal | null,
    elapsedSeconds: number,
    wordCount: number
  ): void {
    if (!this.statusKeyEl || !this.statusDetailEl || !goal) return;
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
      detail = ` · ${timeStr} · ${wordCount} words`;
    }

    this.statusKeyEl.setText(key);
    this.statusDetailEl.setText(detail);
  }

  private renderCompletionUI(): void {
    const { contentEl } = this;
    const div = contentEl.createDiv({ cls: "dz-completion" });
    div.createEl("p", { text: "Goal reached! Keep going?" });

    const extendBtn = div.createEl("button", { text: "Extend (+5 min / +100 words)" });
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
    this.machine.dispatch({ type: "END" });
    this.close();
    this.onFinish(text, goal!, elapsedSeconds, completed);
  }

  onClose(): void {
    this.machine.stopTimer();
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    if (this.annoyanceInterval) clearInterval(this.annoyanceInterval);
    this.contentEl.empty();
  }
}
