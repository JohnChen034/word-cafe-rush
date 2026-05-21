import Phaser from "phaser";
import { COLORS, FONT } from "./Theme";

export class LastCallView {
  readonly container: Phaser.GameObjects.Container;
  private readonly edge: Phaser.GameObjects.Rectangle;
  private readonly banner: Phaser.GameObjects.Text;
  private readonly overtime: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.edge = scene.add
      .rectangle(480, 320, 948, 628, 0xffffff, 0)
      .setStrokeStyle(7, 0xc8666f, 0)
      .setDepth(90);
    this.banner = scene.add.text(126, 114, "LAST CALL", {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: COLORS.berry,
      stroke: "#fffaf1",
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(95);
    this.overtime = scene.add.text(126, 142, "", {
      fontFamily: FONT,
      fontSize: "15px",
      fontStyle: "700",
      color: COLORS.gold,
      stroke: "#fffaf1",
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(95);
    this.container = scene.add.container(0, 0, [this.edge, this.banner, this.overtime]).setDepth(95);
  }

  start(): void {
    this.edge.setStrokeStyle(7, 0xc8666f, 0.7);
    this.banner.setAlpha(1).setScale(0.8);
    this.banner.scene.tweens.add({
      targets: this.banner,
      scale: 1,
      duration: 260,
      ease: "Back.easeOut",
    });
    this.banner.scene.tweens.add({
      targets: this.edge,
      alpha: 0.45,
      yoyo: true,
      repeat: -1,
      duration: 520,
      ease: "Sine.easeInOut",
    });
  }

  setOvertime(seconds: number): void {
    if (seconds <= 0) {
      this.overtime.setText("");
      return;
    }

    this.overtime.setText(`OVERTIME +${Math.round(seconds)}s`).setAlpha(1);
  }
}
