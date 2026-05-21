import { Plugin } from "obsidian";

export default class DraftZeroPlugin extends Plugin {
  async onload() {
    console.log("Draft Zero loaded");
  }

  onunload() {}
}
