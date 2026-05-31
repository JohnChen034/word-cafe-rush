import Phaser from "phaser";
import type { OwnedReward } from "../game/rewards/RewardTypes";
import { punch } from "../juice/TweenPresets";
import { LAYERS } from "./Layers";
import { COLORS, FONT } from "./Theme";

export class ItemShelfView {
  readonly container: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly badges: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const plate = scene.add.rectangle(0, 0, 214, 92, 0xfffaf1, 0.92).setStrokeStyle(2, 0xd8c4a5);
    this.title = scene.add.text(-94, -36, "BUILD", {
      fontFamily: FONT,
      fontSize: "12px",
      fontStyle: "700",
      color: COLORS.muted,
    });
    this.container = scene.add.container(x, y, [plate, this.title]).setDepth(LAYERS.hud).setVisible(false);
  }

  update(rewards: OwnedReward[]): void {
    this.badges.forEach((item) => item.destroy());
    this.badges.length = 0;
    this.container.setVisible(rewards.length > 0);

    const visible = rewards.slice(0, 6);
    visible.forEach((reward, index) => {
      const x = -54 + (index % 2) * 108;
      const y = -8 + Math.floor(index / 2) * 27;
      const badge = this.container.scene.add.rectangle(x, y, 96, 22, this.colorFor(reward.id), 1).setStrokeStyle(2, 0x8a5a3d);
      const text = this.container.scene.add.text(x, y, `${this.effectFor(reward.id, reward.level)}`, {
        fontFamily: FONT,
        fontSize: "12px",
        fontStyle: "700",
        color: "#fffaf1",
      }).setOrigin(0.5);
      this.container.add([badge, text]);
      this.badges.push(badge, text);
    });
  }

  pulse(): void {
    punch(this.container.scene, this.container, 1.08, 130);
  }

  private effectFor(id: OwnedReward["id"], level: number): string {
    if (id === "tip_jar") return `tips + L${level}`;
    if (id === "golden_register") return `$ x L${level}`;
    if (id === "latte_art") return `long x L${level}`;
    if (id === "perfect_pour") return `perfect L${level}`;
    if (id === "combo_foam") return `shield L${level}`;
    if (id === "rush_bell") return `rush L${level}`;
    if (id === "stamp_card") return `stamp L${level}`;
    return `last x L${level}`;
  }

  private colorFor(id: OwnedReward["id"]): number {
    if (id === "tip_jar" || id === "golden_register") return 0xe5a940;
    if (id === "combo_foam" || id === "perfect_pour") return 0x5ea787;
    if (id === "rush_bell" || id === "stamp_card") return 0x5b88c8;
    return 0xc8666f;
  }
}
