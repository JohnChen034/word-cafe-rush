import Phaser from "phaser";
import type { DifficultyId } from "../game/Difficulty";
import type { RunEconomyStats } from "../game/economy/RunEconomy";
import type { OwnedReward } from "../game/rewards/RewardTypes";
import type { ResultsStats } from "../game/Scoring";
import { COLORS, FONT } from "../ui/Theme";

type ResultsData = {
  difficulty: DifficultyId;
  results: ResultsStats;
  ownedRewards?: OwnedReward[];
  economy?: RunEconomyStats;
};

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super("ResultsScene");
  }

  create(data: ResultsData): void {
    const { results, difficulty, ownedRewards = [], economy } = data;
    this.cameras.main.setBackgroundColor(COLORS.cream);
    this.saveBestScore(results.score);

    this.add
      .rectangle(480, 320, 820, 550, 0xfffaf1)
      .setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(COLORS.coffee).color);
    this.add.rectangle(480, 584, 720, 16, 0xf1dfc2, 1);

    this.add.text(480, 96, "Shift Complete", {
      fontFamily: FONT,
      fontSize: "48px",
      fontStyle: "700",
      color: COLORS.coffeeDark,
    }).setOrigin(0.5);

    const rating = this.add.text(480, 154, `Rating ${results.rating}`, {
      fontFamily: FONT,
      fontSize: "42px",
      fontStyle: "700",
      color: this.ratingColor(results.rating),
      stroke: "#fffaf1",
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: rating,
      scale: 1.12,
      yoyo: true,
      duration: 220,
      ease: "Back.easeOut",
    });

    this.add.text(480, 193, this.buildTitle(ownedRewards), {
      fontFamily: FONT,
      fontSize: "20px",
      fontStyle: "700",
      color: COLORS.gold,
    }).setOrigin(0.5);

    const best = Number(localStorage.getItem("word-cafe-rush-best") ?? results.score);
    const rows: Array<[string, string]> = [
      ["Income", `$${results.income}`],
      ["Score", `${results.score}`],
      ["Best", `${best}`],
      ["WPM", `${results.wpm}`],
      ["Raw WPM", `${results.rawWpm}`],
      ["Accuracy", `${results.accuracy}%`],
      ["Typos", `${results.typoCount}`],
      ["Max Combo", `x${results.maxCombo}`],
      ["Happy Customers", `${results.happyCustomers}`],
      ["Unhappy Customers", `${results.unhappyCustomers}`],
      ["Biggest Checkout", `$${economy?.biggestCheckout ?? 0}`],
      ["Rush Boxes", `${economy?.rushBoxesOpened ?? 0}`],
      ["Last Call", `${economy?.lastCallCheckouts ?? 0} checks`],
      ["Overtime", `+${Math.round(economy?.overtimeSecondsEarned ?? 0)}s`],
    ];

    rows.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = column === 0 ? 300 : 610;
      const y = 224 + row * 36;

      this.add.text(x - 110, y, label, {
        fontFamily: FONT,
        fontSize: "18px",
        color: COLORS.muted,
      }).setOrigin(0, 0.5);

      this.add.text(x + 120, y, value, {
        fontFamily: FONT,
        fontSize: "24px",
        fontStyle: "700",
        color: COLORS.ink,
      }).setOrigin(1, 0.5);
    });

    const perkText =
      ownedRewards.length > 0
        ? ownedRewards.map((reward) => `${reward.name} Lv.${reward.level}`).join("  •  ")
        : "No Rush Box rewards";
    this.add.text(480, 496, perkText, {
      fontFamily: FONT,
      fontSize: "16px",
      fontStyle: "700",
      color: COLORS.coffeeDark,
      align: "center",
      wordWrap: { width: 620 },
    }).setOrigin(0.5);

    const stamp = this.add.text(730, 150, results.rating === "S" ? "JACKPOT SHIFT" : "SHIFT PAID", {
      fontFamily: FONT,
      fontSize: "20px",
      fontStyle: "700",
      color: this.ratingColor(results.rating),
      stroke: "#fffaf1",
      strokeThickness: 5,
    }).setOrigin(0.5).setAngle(-12).setAlpha(0.9);
    this.tweens.add({
      targets: stamp,
      scale: 1.08,
      yoyo: true,
      repeat: 2,
      duration: 180,
      ease: "Back.easeOut",
    });

    this.createButton(360, 548, "Replay", () => {
      this.scene.start("GameScene", { difficulty });
    });
    this.createButton(600, 548, "Menu", () => {
      this.scene.start("MenuScene");
    });
  }

  private saveBestScore(score: number): void {
    const best = Number(localStorage.getItem("word-cafe-rush-best") ?? 0);
    if (score > best) localStorage.setItem("word-cafe-rush-best", String(score));
  }

  private ratingColor(rating: ResultsStats["rating"]): string {
    if (rating === "S") return COLORS.gold;
    if (rating === "A") return COLORS.mint;
    if (rating === "B") return COLORS.blue;
    return COLORS.berry;
  }

  private buildTitle(rewards: OwnedReward[]): string {
    if (rewards.length === 0) return "Fresh Shift";
    const top = [...rewards].sort((a, b) => b.level - a.level)[0];
    if (top.id === "tip_jar") return "Tip Storm Build";
    if (top.id === "golden_register") return "Golden Register Build";
    if (top.id === "latte_art") return "Fancy Menu Build";
    if (top.id === "perfect_pour") return "Perfect Pour Build";
    if (top.id === "combo_foam") return "Foam Shield Build";
    if (top.id === "rush_bell") return "Rush Bell Build";
    if (top.id === "stamp_card") return "Stamp Rush Build";
    if (top.id === "closing_bell") return "Last Call Build";
    return "House Special Build";
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add
      .rectangle(x, y, 190, 58, 0x8a5a3d, 8)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: "#fffaf1",
    }).setOrigin(0.5);

    button.on("pointerdown", onClick);
    button.on("pointerover", () => button.setFillStyle(0x5d3927));
    button.on("pointerout", () => button.setFillStyle(0x8a5a3d));
  }
}
