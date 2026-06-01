import Phaser from "phaser";
import { LAYERS } from "./Layers";
import { FONT } from "./Theme";

export function floatingMoneyText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: string,
  depth: number = LAYERS.gameplayPayoffBehindPrompts,
): void {
  const label = scene.add.text(x, y, text, {
    fontFamily: FONT,
    fontSize: "22px",
    fontStyle: "700",
    color,
    stroke: "#fffaf1",
    strokeThickness: 4,
  }).setOrigin(0.5).setDepth(depth);

  label.setScale(0.7);
  scene.tweens.add({
    targets: label,
    scale: 1.08,
    duration: 110,
    ease: "Back.easeOut",
  });

  scene.tweens.add({
    targets: label,
    y: y - 34,
    alpha: 0,
    duration: 850,
    ease: "Cubic.easeOut",
    onComplete: () => label.destroy(),
  });
}
