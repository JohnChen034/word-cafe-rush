import Phaser from "phaser";
import { punch } from "../juice/TweenPresets";
import { LAYERS } from "./Layers";
import { COLORS, FONT } from "./Theme";

export class ComboDisplay {
  readonly container: Phaser.GameObjects.Container;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const plate = scene.add.rectangle(0, 0, 160, 42, 0xfffaf1, 1).setStrokeStyle(3, 0x5ea787);
    this.label = scene.add.text(0, 0, "Combo x0", {
      fontFamily: FONT,
      fontSize: "21px",
      fontStyle: "700",
      color: COLORS.ink,
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y, [plate, this.label]).setDepth(LAYERS.hud);
  }

  setCombo(combo: number): void {
    this.label.setText(`Combo x${combo}`);
    this.label.setColor(combo >= 20 ? COLORS.gold : combo >= 10 ? COLORS.mint : COLORS.ink);
  }

  pulse(): void {
    punch(this.label.scene, this.container, 1.1, 110);
  }
}
