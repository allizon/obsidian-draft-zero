import { App, Modal } from "obsidian";

export class ExitConfirmModal extends Modal {
  private elapsedSeconds: number;
  private wordCount: number;
  private onSave: () => void;
  private onDiscard: () => void;
  private onCancel: () => void;
  private buttonClicked = false;

  constructor(
    app: App,
    elapsedSeconds: number,
    wordCount: number,
    onSave: () => void,
    onDiscard: () => void,
    onCancel: () => void
  ) {
    super(app);
    this.elapsedSeconds = elapsedSeconds;
    this.wordCount = wordCount;
    this.onSave = onSave;
    this.onDiscard = onDiscard;
    this.onCancel = onCancel;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("dz-exit-modal");

    const m = Math.floor(this.elapsedSeconds / 60);
    const s = this.elapsedSeconds % 60;
    const timeStr = `${m}:${String(s).padStart(2, "0")}`;

    const statsEl = contentEl.createDiv({ cls: "dz-exit-stats" });
    statsEl.createEl("p", {
      text: `${timeStr} · ${this.wordCount} words`,
      cls: "dz-exit-stats-line",
    });
    statsEl.createEl("p", {
      text: "Exit this sprint?",
      cls: "dz-exit-prompt",
    });

    const btnRow = contentEl.createDiv({ cls: "dz-exit-buttons" });

    if (this.wordCount > 0) {
      const saveBtn = btnRow.createEl("button", { text: "Save", cls: "mod-cta" });
      saveBtn.addEventListener("click", () => {
        this.buttonClicked = true;
        this.close();
        this.onSave();
      });
    }

    const discardBtn = btnRow.createEl("button", { text: "Discard" });
    discardBtn.addEventListener("click", () => {
      this.buttonClicked = true;
      this.close();
      this.onDiscard();
    });
  }

  onClose(): void {
    this.contentEl.empty();
    if (!this.buttonClicked) this.onCancel();
  }
}
