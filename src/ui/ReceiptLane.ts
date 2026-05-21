import Phaser from "phaser";
import { COLORS, FONT } from "./Theme";

type ReceiptOptions = {
  amount: number;
  baseValue: number;
  labels: string[];
  biggest: boolean;
};

export class ReceiptLane {
  private readonly container: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y).setDepth(460);
  }

  show(options: ReceiptOptions): void {
    this.container.removeAll(true);

    const height = options.labels.length > 0 ? 148 : 92;
    const panel = this.scene.add.rectangle(0, 0, 244, height, 0xfffaf1, 0.94).setStrokeStyle(3, 0xe5a940);
    const title = this.scene.add.text(0, -height / 2 + 22, options.biggest ? "BIGGEST CHECKOUT" : "CHECKOUT", {
      fontFamily: FONT,
      fontSize: "14px",
      fontStyle: "700",
      color: options.biggest ? COLORS.berry : COLORS.coffeeDark,
    }).setOrigin(0.5);
    const amount = this.scene.add.text(0, -height / 2 + 54, `+$${options.amount}`, {
      fontFamily: FONT,
      fontSize: options.biggest ? "34px" : "30px",
      fontStyle: "700",
      color: COLORS.gold,
      stroke: "#fffaf1",
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.container.add([panel, title, amount]);

    if (options.labels.length > 0) {
      const formula = this.scene.add.text(0, -height / 2 + 88, this.formula(options), {
        fontFamily: FONT,
        fontSize: "14px",
        fontStyle: "700",
        color: COLORS.ink,
        align: "center",
        wordWrap: { width: 208 },
      }).setOrigin(0.5);
      this.container.add(formula);

      options.labels.slice(0, 3).forEach((label, index) => {
        const tag = this.scene.add.text(0, -height / 2 + 118 + index * 18, this.compactLabel(label), {
          fontFamily: FONT,
          fontSize: "12px",
          fontStyle: "700",
          color: COLORS.blue,
        }).setOrigin(0.5);
        this.container.add(tag);
      });
    }

    this.container.setAlpha(0).setScale(0.94);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 130,
      ease: "Back.easeOut",
    });
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      delay: options.biggest ? 1350 : 1050,
      duration: 260,
      ease: "Sine.easeIn",
    });
  }

  private formula(options: ReceiptOptions): string {
    return `=$${options.baseValue} ${options.labels.map((label) => this.compactLabel(label)).join(" ")}`;
  }

  private compactLabel(label: string): string {
    return label
      .replace("Golden Register", "GR")
      .replace("Last Call", "LC")
      .replace("Closing Bell", "Bell")
      .replace("Combo Stamps", "Stamps");
  }
}
