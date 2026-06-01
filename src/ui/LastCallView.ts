import Phaser from "phaser";
import { LAYERS } from "./Layers";
import { COLORS, FONT } from "./Theme";

export class LastCallView {
  readonly container: Phaser.GameObjects.Container;
  private readonly edge: Phaser.GameObjects.Rectangle;
  private readonly banner: Phaser.GameObjects.Text;
  private readonly overtime: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.edge = scene.add
      .rectangle(480, 320, 948, 628, 0xffffff, 0)
      .setStrokeStyle(7, 0xc8666f, 0)
      .setDepth(LAYERS.hud);
    this.banner = scene.add.text(126, 114, "LAST CALL", {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "700",
      color: COLORS.berry,
      stroke: "#fffaf1",
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(LAYERS.hudJuice);
    this.overtime = scene.add.text(126, 142, "", {
      fontFamily: FONT,
      fontSize: "15px",
      fontStyle: "700",
      color: COLORS.gold,
      stroke: "#fffaf1",
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(LAYERS.hudJuice);
    this.subtitle = scene.add.text(480, 118, "TIPS x2 - CHECKOUT ADDS OVERTIME", {
      fontFamily: FONT,
      fontSize: "18px",
      fontStyle: "700",
      color: COLORS.berry,
      stroke: "#fffaf1",
      strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0).setDepth(LAYERS.hudJuice);
    this.container = scene.add.container(0, 0, [this.edge, this.banner, this.overtime, this.subtitle]).setDepth(LAYERS.hudJuice);
  }

  start(): void {
    this.edge.setAlpha(1);
    this.edge.setStrokeStyle(7, 0xc8666f, 0.78);
    this.banner.setAlpha(1).setScale(0.8);
    this.banner.scene.tweens.add({
      targets: this.banner,
      scale: 1,
      duration: 260,
      ease: "Back.easeOut",
    });
    this.subtitle.setAlpha(1).setScale(0.88);
    this.subtitle.scene.tweens.add({
      targets: this.subtitle,
      scale: 1,
      duration: 220,
      ease: "Back.easeOut",
    });
    this.subtitle.scene.tweens.add({
      targets: this.subtitle,
      alpha: 0,
      delay: 1250,
      duration: 300,
      ease: "Sine.easeIn",
    });
    this.banner.scene.tweens.add({
      targets: this.edge,
      alpha: 0.62,
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
