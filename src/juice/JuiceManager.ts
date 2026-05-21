import Phaser from "phaser";
import { COLORS } from "../ui/Theme";
import { AudioManager } from "./AudioManager";
import { ParticleFactory } from "./ParticleFactory";
import { flashAlpha, punch, shakeX } from "./TweenPresets";

type HudTarget = Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[];

export class JuiceManager {
  readonly audio = new AudioManager();
  readonly particles: ParticleFactory;

  constructor(private readonly scene: Phaser.Scene) {
    this.particles = new ParticleFactory(scene);
  }

  unlockAudio(): void {
    this.audio.unlock();
  }

  correctKey(inputTarget?: HudTarget): void {
    this.audio.keyTick();
    if (inputTarget) punch(this.scene, inputTarget, 1.025, 50);
  }

  typo(target: Phaser.GameObjects.GameObject, x: number, y: number): void {
    this.audio.typo();
    shakeX(this.scene, target, 7);
    this.particles.ring(x, y, 0xc8666f, 28);
  }

  promptComplete(x: number, y: number, bubble?: HudTarget): void {
    this.audio.promptComplete();
    this.particles.ring(x, y, 0xe5a940, 30);
    this.particles.sparkleBurst(x, y, 7);
    if (bubble) punch(this.scene, bubble, 1.16, 120);
  }

  checkout(x: number, y: number, amount: number, moneyTarget?: HudTarget, comboTarget?: HudTarget): void {
    this.audio.register();
    this.particles.coinBurst(x, y, Math.min(24, 8 + Math.ceil(amount / 18)));
    this.particles.ring(x, y, 0xe5a940, 42);
    if (moneyTarget) punch(this.scene, moneyTarget, 1.14, 130);
    if (comboTarget) punch(this.scene, comboTarget, 1.1, 120);
  }

  stamp(x: number, y: number, full = false): void {
    this.audio.stamp();
    this.particles.stampPuff(x, y);
    if (full) {
      this.scene.cameras.main.flash(140, 229, 169, 64, false);
      this.particles.ring(x, y, 0xe5a940, 54);
    }
  }

  rushBoxOpen(): void {
    this.audio.rushBox();
    this.particles.sparkleBurst(480, 252, 14);
  }

  rewardSelected(target?: HudTarget): void {
    this.audio.reward();
    if (target) punch(this.scene, target, 1.18, 140);
  }

  lastCall(): void {
    this.audio.lastCall();
    this.scene.cameras.main.flash(150, 200, 102, 111, false);
  }

  overtime(x: number, y: number): void {
    this.particles.ring(x, y, Phaser.Display.Color.HexStringToColor(COLORS.berry).color, 34);
  }

  flash(target: HudTarget): void {
    flashAlpha(this.scene, target, 0.45, 85);
  }
}
