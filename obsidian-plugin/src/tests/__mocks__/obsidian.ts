import { vi } from "vitest";

// Returns an object whose every method returns itself, calling any function
// argument with another fluent instance. Good enough for Setting chains.
// A proxy whose every method returns itself. Does NOT invoke function args —
// that is the caller's (Setting's) responsibility for setup callbacks only.
function fluent(): any {
  const proxy: any = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === Symbol.toPrimitive) return () => "";
        if (prop === "toString" || prop === "valueOf") return () => "";
        return (..._args: any[]) => proxy;
      },
    }
  );
  return proxy;
}

export class App {}

export class Modal {
  app: App;
  contentEl: HTMLElement & {
    empty: () => void;
    addClass: (cls: string) => void;
    createEl: (tag: string, opts?: object) => HTMLElement;
    createDiv: (opts?: object) => HTMLElement;
  };
  close = vi.fn();

  constructor(app: App) {
    this.app = app;
    const el = document.createElement("div") as any;
    el.empty = () => { el.innerHTML = ""; };
    el.addClass = (cls: string) => { el.classList.add(cls); };
    el.createEl = (tag: string, opts: any = {}) => {
      const child = document.createElement(tag);
      if (opts.text) child.textContent = opts.text;
      if (opts.cls) child.className = opts.cls;
      el.appendChild(child);
      return child;
    };
    el.createDiv = (opts: any = {}) => {
      const child = document.createElement("div");
      if (opts.cls) child.className = opts.cls;
      el.appendChild(child);
      return child;
    };
    this.contentEl = el;
  }
}

export class Setting {
  constructor(_containerEl: HTMLElement) {}
  setName() { return this; }
  setDesc() { return this; }
  addDropdown(cb: (d: any) => any) { cb(fluent()); return this; }
  addText(cb: (t: any) => any) { cb(fluent()); return this; }
  addToggle(cb: (t: any) => any) { cb(fluent()); return this; }
  addButton(cb: (b: any) => any) { cb(fluent()); return this; }
}
