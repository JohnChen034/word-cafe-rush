import Phaser from "phaser";
import { LAYERS } from "../ui/Layers";

export class ParticleFactory {
  constructor(private readonly scene: Phaser.Scene) {
    this.ensureTextures();
  }

  coinBurst(x: number, y: number, count = 12, depth: number = LAYERS.gameplayJuiceBehindPrompts): void {
    for (let index = 0; index < count; index += 1) {
      const coin = this.scene.add.image(x, y, "juice-coin").setDepth(depth).setScale(0.8);
      const angle = Phaser.Math.FloatBetween(-Math.PI * 0.9, -Math.PI * 0.1);
      const speed = Phaser.Math.Between(70, 170);
      this.scene.tweens.add({
        targets: coin,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        scale: 0.2,
        alpha: 0,
        rotation: Phaser.Math.FloatBetween(-3, 3),
        duration: Phaser.Math.Between(460, 760),
        ease: "Cubic.easeOut",
        onComplete: () => coin.destroy(),
      });
    }
  }

  sparkleBurst(x: number, y: number, count = 9, depth: number = LAYERS.gameplayJuiceBehindPrompts): void {
    for (let index = 0; index < count; index += 1) {
      const sparkle = this.scene.add.image(x, y, "juice-spark").setDepth(depth);
      const angle = (Math.PI * 2 * index) / count + Phaser.Math.FloatBetween(-0.18, 0.18);
      const distance = Phaser.Math.Between(28, 82);
      this.scene.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        scale: 0.1,
        alpha: 0,
        duration: 420,
        ease: "Cubic.easeOut",
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  stampPuff(x: number, y: number, depth: number = LAYERS.hudJuice): void {
    for (let index = 0; index < 8; index += 1) {
      const puff = this.scene.add.image(x, y, "juice-puff").setDepth(depth).setScale(0.7);
      const angle = (Math.PI * 2 * index) / 8;
      const distance = Phaser.Math.Between(16, 42);
      this.scene.tweens.add({
        targets: puff,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        scale: 1.35,
        alpha: 0,
        duration: 360,
        ease: "Quad.easeOut",
        onComplete: () => puff.destroy(),
      });
    }
  }

  ring(x: number, y: number, color = 0xe5a940, radius = 36, depth: number = LAYERS.gameplayJuiceBehindPrompts): void {
    const circle = this.scene.add.circle(x, y, radius, color, 0).setStrokeStyle(4, color, 0.9).setDepth(depth);
    this.scene.tweens.add({
      targets: circle,
      scale: 1.65,
      alpha: 0,
      duration: 430,
      ease: "Cubic.easeOut",
      onComplete: () => circle.destroy(),
    });
  }

  private ensureTextures(): void {
    if (this.scene.textures.exists("juice-coin")) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xe5a940, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.lineStyle(2, 0xfffaf1, 0.85);
    graphics.strokeCircle(8, 8, 5);
    graphics.generateTexture("juice-coin", 16, 16);
    graphics.clear();

    graphics.fillStyle(0xfffaf1, 1);
    graphics.fillTriangle(8, 0, 11, 7, 16, 8);
    graphics.fillTriangle(8, 16, 5, 9, 0, 8);
    graphics.fillStyle(0xe5a940, 1);
    graphics.fillCircle(8, 8, 3);
    graphics.generateTexture("juice-spark", 16, 16);
    graphics.clear();

    graphics.fillStyle(0xe5a940, 0.72);
    graphics.fillCircle(8, 8, 7);
    graphics.generateTexture("juice-puff", 16, 16);
    graphics.destroy();
  }
}
