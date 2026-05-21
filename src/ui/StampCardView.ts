import Phaser from "phaser";
import { punch } from "../juice/TweenPresets";
import { COLORS, FONT } from "./Theme";

type StampSlot = {
  circle: Phaser.GameObjects.Arc;
  mark: Phaser.GameObjects.Text;
};

export class StampCardView {
  readonly container: Phaser.GameObjects.Container;
  private readonly label: Phaser.GameObjects.Text;
  private readonly slots: StampSlot[] = [];
  private value = 0;
  private threshold = 5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const card = scene.add.rectangle(0, 0, 270, 56, 0xfffaf1, 1).setStrokeStyle(3, 0x8a5a3d);
    this.label = scene.add.text(-122, -17, "STAMP CARD", {
      fontFamily: FONT,
      fontSize: "12px",
      fontStyle: "700",
      color: COLORS.coffeeDark,
    }).setOrigin(0, 0.5);

    this.container = scene.add.container(x, y, [card, this.label]);
    this.rebuildSlots(scene);
  }

  update(value: number, threshold: number): void {
    if (threshold !== this.threshold) {
      this.threshold = threshold;
      this.rebuildSlots(this.container.scene);
    }

    this.value = value;
    const remaining = Math.max(0, threshold - value);
    this.label.setText(remaining === 0 ? "BOX READY" : remaining === 1 ? "1 TO BOX" : "STAMP CARD");
    this.label.setColor(remaining <= 1 ? COLORS.gold : COLORS.coffeeDark);
    this.slots.forEach((slot, index) => {
      const filled = index < value;
      slot.circle.setFillStyle(filled ? 0xe5a940 : 0xf1dfc2, 1);
      slot.circle.setStrokeStyle(2, filled ? 0x5d3927 : 0xd8c4a5);
      slot.mark.setVisible(filled);
    });

    const nearFull = value >= threshold - 1;
    if (nearFull) punch(this.container.scene, this.container, 1.035, 95);
  }

  playStampGain(): Phaser.Math.Vector2 {
    const index = Phaser.Math.Clamp(this.value - 1, 0, this.slots.length - 1);
    const slot = this.slots[index];
    if (slot) punch(this.container.scene, [slot.circle, slot.mark], 1.42, 110);
    const matrix = this.container.getWorldTransformMatrix();
    return new Phaser.Math.Vector2(matrix.tx + slot.circle.x, matrix.ty + slot.circle.y);
  }

  playFull(): void {
    punch(this.container.scene, this.container, 1.12, 150);
  }

  private rebuildSlots(scene: Phaser.Scene): void {
    this.slots.forEach((slot) => {
      slot.circle.destroy();
      slot.mark.destroy();
    });
    this.slots.length = 0;

    const gap = Math.min(26, 170 / Math.max(this.threshold - 1, 1));
    const startX = -86;
    for (let index = 0; index < this.threshold; index += 1) {
      const circle = scene.add.circle(startX + index * gap, 12, 10, 0xf1dfc2).setStrokeStyle(2, 0xd8c4a5);
      const mark = scene.add.text(circle.x, circle.y - 1, "✓", {
        fontFamily: FONT,
        fontSize: "14px",
        fontStyle: "700",
        color: COLORS.coffeeDark,
      }).setOrigin(0.5).setVisible(false);
      this.container.add([circle, mark]);
      this.slots.push({ circle, mark });
    }

    this.update(Math.min(this.value, this.threshold), this.threshold);
  }
}
