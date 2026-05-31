import Phaser from "phaser";
import { countText, punch } from "../juice/TweenPresets";
import { LAYERS } from "./Layers";
import { COLORS, FONT } from "./Theme";

export class MoneyDisplay {
  readonly container: Phaser.GameObjects.Container;
  private readonly label: Phaser.GameObjects.Text;
  private value = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const plate = scene.add.rectangle(0, 0, 154, 42, 0xfffaf1, 1).setStrokeStyle(3, 0xe5a940);
    const icon = scene.add.text(-58, 0, "$", {
      fontFamily: FONT,
      fontSize: "25px",
      fontStyle: "700",
      color: COLORS.gold,
    }).setOrigin(0.5);
    this.label = scene.add.text(12, 0, "$0", {
      fontFamily: FONT,
      fontSize: "25px",
      fontStyle: "700",
      color: COLORS.ink,
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y, [plate, icon, this.label]).setDepth(LAYERS.hud);
  }

  setValue(value: number, animated = true): void {
    if (!animated) {
      this.value = value;
      this.label.setText(`$${value}`);
      return;
    }

    countText(this.label.scene, this.label, this.value, value, (next) => `$${next}`);
    this.value = value;
  }

  pulse(): void {
    punch(this.label.scene, this.container, 1.12, 130);
  }
}
