import Phaser from "phaser";
import { DIFFICULTIES, type DifficultyId } from "../game/Difficulty";
import { COLORS, FONT } from "../ui/Theme";

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty: DifficultyId = "easy";

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.cream);

    this.add
      .rectangle(480, 320, 820, 520, 0xfffaf1)
      .setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(COLORS.coffee).color);

    this.add.text(480, 118, "Word Cafe Rush", {
      fontFamily: FONT,
      fontSize: "56px",
      fontStyle: "700",
      color: COLORS.coffeeDark,
    }).setOrigin(0.5);

    this.add.text(480, 176, "Serve a 90-second Stamp Rush by typing each cafe prompt.", {
      fontFamily: FONT,
      fontSize: "22px",
      color: COLORS.ink,
    }).setOrigin(0.5);

    this.add.text(480, 222, "Checkouts fill Rush Boxes. Boxes level up your build.", {
      fontFamily: FONT,
      fontSize: "18px",
      color: COLORS.muted,
    }).setOrigin(0.5);

    this.createDifficultyButton(360, 304, "easy");
    this.createDifficultyButton(600, 304, "normal");

    this.createButton(480, 410, "Start Shift", () => {
      this.scene.start("GameScene", { difficulty: this.selectedDifficulty });
    });

    this.add.text(480, 516, "Type letters to target a prompt. Backspace corrects. Esc clears target.", {
      fontFamily: FONT,
      fontSize: "16px",
      color: COLORS.muted,
    }).setOrigin(0.5);
  }

  private createDifficultyButton(x: number, y: number, difficulty: DifficultyId): void {
    const selected = difficulty === this.selectedDifficulty;
    const bg = this.add
      .rectangle(x, y, 180, 74, selected ? 0x5ea787 : 0xf1dfc2, 8)
      .setStrokeStyle(3, selected ? 0x2b6f55 : 0x8a5a3d)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y - 12, DIFFICULTIES[difficulty].label, {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: selected ? "#ffffff" : COLORS.ink,
    }).setOrigin(0.5);

    const sub = this.add.text(x, y + 18, difficulty === "easy" ? "slower shift" : "full rush", {
      fontFamily: FONT,
      fontSize: "14px",
      color: selected ? "#eafff5" : COLORS.muted,
    }).setOrigin(0.5);

    bg.on("pointerdown", () => {
      this.selectedDifficulty = difficulty;
      this.scene.restart();
    });

    bg.on("pointerover", () => bg.setScale(1.03));
    bg.on("pointerout", () => bg.setScale(1));
    label.setDepth(1);
    sub.setDepth(1);
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add
      .rectangle(x, y, 240, 72, 0x8a5a3d, 8)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontFamily: FONT,
      fontSize: "28px",
      fontStyle: "700",
      color: "#fffaf1",
    }).setOrigin(0.5);

    button.on("pointerdown", onClick);
    button.on("pointerover", () => button.setFillStyle(0x5d3927));
    button.on("pointerout", () => button.setFillStyle(0x8a5a3d));
  }
}
