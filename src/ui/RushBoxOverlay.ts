import Phaser from "phaser";
import { getRewardDefinition } from "../game/rewards/RewardCatalog";
import type { RewardId } from "../game/rewards/RewardTypes";
import { LAYERS } from "./Layers";
import { COLORS, FONT } from "./Theme";

type RushBoxOverlayOptions = {
  levelFor: (id: RewardId) => number;
  onChoose: (id: RewardId) => void;
  quick?: boolean;
};

export class RushBoxOverlay {
  private readonly container: Phaser.GameObjects.Container;
  private readonly keyHandlers: Array<() => void> = [];
  private chosen = false;
  private canChoose = false;
  private queuedChoose: (() => void) | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    rewardIds: RewardId[],
    options: RushBoxOverlayOptions,
  ) {
    this.container = scene.add.container(0, 0).setDepth(LAYERS.overlay).setAlpha(0);

    const quick = options.quick ?? false;
    const backdrop = scene.add.rectangle(480, 320, 960, 640, 0x2b3038, quick ? 0.5 : 0.75);
    const panel = scene.add
      .rectangle(480, 320, 800, 440, 0xfffaf1, 1)
      .setStrokeStyle(5, 0xe5a940);
    const title = scene.add.text(480, 148, quick ? "Quick Pick!" : "Rush Box!", {
      fontFamily: FONT,
      fontSize: "46px",
      fontStyle: "700",
      color: COLORS.coffeeDark,
    }).setOrigin(0.5);
    const subtitle = scene.add.text(480, 190, "Opening...", {
      fontFamily: FONT,
      fontSize: "18px",
      color: COLORS.muted,
    }).setOrigin(0.5);
    const box = scene.add.rectangle(480, 252, 112, 42, 0xe5a940, 1).setStrokeStyle(4, 0x8a5a3d);
    const boxLid = scene.add.rectangle(480, 228, 132, 24, 0xd8a35d, 1).setStrokeStyle(4, 0x8a5a3d);

    this.container.add([backdrop, panel, title, subtitle, box, boxLid]);
    scene.tweens.add({ targets: this.container, alpha: 1, duration: 130, ease: "Sine.easeOut" });
    scene.tweens.add({ targets: panel, scaleX: 1.03, scaleY: 1.03, yoyo: true, duration: 180, ease: "Back.easeOut" });
    scene.tweens.add({ targets: boxLid, y: 212, angle: -8, duration: quick ? 90 : 180, delay: quick ? 20 : 80, ease: "Back.easeOut" });
    scene.tweens.add({ targets: [box, boxLid], x: "+=8", yoyo: true, repeat: quick ? 1 : 3, duration: 36, delay: quick ? 20 : 80 });
    scene.time.delayedCall(quick ? 90 : 280, () => {
      this.canChoose = true;
      subtitle.setText("Pick one reward. Press 1 / 2 / 3.");
      const queued = this.queuedChoose;
      this.queuedChoose = null;
      if (queued) queued();
    });

    rewardIds.forEach((id, index) => {
      const reward = getRewardDefinition(id);
      const nextLevel = Math.min(options.levelFor(id) + 1, reward.maxLevel);
      const x = 250 + index * 230;
      const card = scene.add
        .rectangle(x, 348, 198, 200, 0xf1dfc2, 1)
        .setStrokeStyle(3, 0x8a5a3d)
        .setInteractive({ useHandCursor: true });
      const key = scene.add.text(x - 78, 268, `[${index + 1}]`, {
        fontFamily: FONT,
        fontSize: "16px",
        fontStyle: "700",
        color: COLORS.gold,
      }).setOrigin(0.5);
      const name = scene.add.text(x, 304, reward.name, {
        fontFamily: FONT,
        fontSize: "23px",
        fontStyle: "700",
        color: COLORS.ink,
        align: "center",
      }).setOrigin(0.5);
      const currentLevel = options.levelFor(id);
      const level = scene.add.text(x, 338, currentLevel > 0 ? `LV ${currentLevel} -> ${nextLevel}` : `NEW  LV ${nextLevel}`, {
        fontFamily: FONT,
        fontSize: "15px",
        fontStyle: "700",
        color: COLORS.gold,
      }).setOrigin(0.5);
      const effect = scene.add.text(x, 386, reward.shortDescription(nextLevel), {
        fontFamily: FONT,
        fontSize: "17px",
        color: COLORS.coffeeDark,
        align: "center",
        wordWrap: { width: 160 },
      }).setOrigin(0.5);
      const tag = scene.add.text(x, 428, reward.category.replace("_", " ").toUpperCase(), {
        fontFamily: FONT,
        fontSize: "12px",
        fontStyle: "700",
        color: COLORS.muted,
      }).setOrigin(0.5);

      const cardParts = [card, key, name, level, effect, tag];
      cardParts.forEach((part) => {
        part.setAlpha(quick ? 1 : 0);
        part.setScale(0.94);
        part.y += 10;
      });
      scene.tweens.add({
        targets: cardParts,
        alpha: 1,
        y: "-=10",
        scaleX: 1,
        scaleY: 1,
        delay: quick ? 25 : 110 + index * 28,
        duration: quick ? 80 : 150,
        ease: "Back.easeOut",
      });

      const choose = () => {
        if (this.chosen) return;
        if (!this.canChoose) {
          subtitle.setText(`Queued [${index + 1}]...`);
          this.queuedChoose = choose;
          return;
        }
        this.chosen = true;
        this.keyHandlers.forEach((remove) => remove());
        this.burst(x, 348);
        scene.tweens.add({
          targets: cardParts,
          scaleX: 1.18,
          scaleY: 1.18,
          duration: quick ? 90 : 170,
          yoyo: true,
          ease: "Back.easeOut",
          onComplete: () => {
            scene.tweens.add({
              targets: this.container,
              alpha: 0,
              duration: quick ? 90 : 150,
              ease: "Sine.easeIn",
              onComplete: () => options.onChoose(id),
            });
          },
        });
      };
      card.on("pointerdown", choose);
      card.on("pointerover", () => card.setFillStyle(0xe5a940));
      card.on("pointerout", () => card.setFillStyle(0xf1dfc2));

      const keyName = ["ONE", "TWO", "THREE"][index];
      const keyboard = scene.input.keyboard;
      if (keyboard) {
        const handler = () => choose();
        keyboard.on(`keydown-${keyName}`, handler);
        this.keyHandlers.push(() => keyboard.off(`keydown-${keyName}`, handler));
      }

      this.container.add([card, key, name, level, effect, tag]);
    });
  }

  destroy(): void {
    this.keyHandlers.forEach((remove) => remove());
    this.container.destroy(true);
  }

  private burst(x: number, y: number): void {
    for (let index = 0; index < 14; index += 1) {
      const dot = this.scene.add.circle(x, y, Phaser.Math.Between(4, 8), 0xe5a940, 0.9);
      this.container.add(dot);
      const angle = (Math.PI * 2 * index) / 14;
      const distance = Phaser.Math.Between(50, 118);
      this.scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 360,
        ease: "Cubic.easeOut",
        onComplete: () => {
          if (dot.scene) dot.destroy();
        },
      });
    }
  }
}
