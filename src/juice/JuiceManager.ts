import Phaser from "phaser";
import { floatingMoneyText } from "../ui/FloatingMoneyText";
import { LAYERS } from "../ui/Layers";
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
    this.particles.coinBurst(x, y, Math.min(24, 8 + Math.ceil(amount / 18)), LAYERS.hudJuice);
    this.particles.ring(x, y, 0xe5a940, 42, LAYERS.hudJuice);
    if (moneyTarget) punch(this.scene, moneyTarget, 1.14, 130);
    if (comboTarget) punch(this.scene, comboTarget, 1.1, 120);
  }

  checkoutAtCustomer(x: number, y: number, amount: number, isBiggest: boolean, isLastCall: boolean, target?: HudTarget): void {
    if (isLastCall) this.audio.lastCallRegister();
    else this.audio.register();

    const color = isBiggest ? COLORS.berry : isLastCall ? COLORS.gold : COLORS.gold;
    const scale = isBiggest ? 1.35 : isLastCall ? 1.22 : 1;
    this.particles.coinBurst(x, y, Math.min(32, 10 + Math.ceil(amount / 16)), LAYERS.gameplayJuiceBehindPrompts);
    this.particles.ring(x, y, isBiggest ? 0xc8666f : 0xe5a940, isBiggest ? 58 : 42, LAYERS.gameplayJuiceBehindPrompts);
    this.particles.sparkleBurst(x, y, isBiggest ? 14 : 8, LAYERS.gameplayJuiceBehindPrompts);
    floatingMoneyText(this.scene, x, y - 58, `+$${amount}`, color, LAYERS.gameplayJuiceBehindPrompts);
    if (target) punch(this.scene, target, scale, isBiggest ? 190 : 145);
  }

  stamp(x: number, y: number, full = false): void {
    this.audio.stamp();
    this.particles.stampPuff(x, y);
    if (full) {
      this.scene.cameras.main.flash(140, 229, 169, 64, false);
      this.particles.ring(x, y, 0xe5a940, 54, LAYERS.hudJuice);
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

  rewardMaxed(target?: HudTarget): void {
    this.audio.maxReward();
    this.scene.cameras.main.flash(190, 229, 169, 64, false);
    this.particles.sparkleBurst(480, 392, 18, LAYERS.hudJuice);
    if (target) punch(this.scene, target, 1.24, 190);
  }

  lastCall(): void {
    this.audio.lastCall();
    this.scene.cameras.main.flash(150, 200, 102, 111, false);
  }

  overtime(x: number, y: number): void {
    this.audio.overtime();
    this.particles.ring(x, y, Phaser.Display.Color.HexStringToColor(COLORS.berry).color, 34, LAYERS.hudJuice);
  }

  flash(target: HudTarget): void {
    flashAlpha(this.scene, target, 0.45, 85);
  }
}
