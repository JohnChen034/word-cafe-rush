import Phaser from "phaser";

export function punch(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[],
  scale = 1.14,
  duration = 150,
): void {
  scene.tweens.add({
    targets: target,
    scaleX: scale,
    scaleY: scale,
    yoyo: true,
    duration,
    ease: "Back.easeOut",
  });
}

export function flashAlpha(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[],
  alpha = 0.35,
  duration = 110,
): void {
  scene.tweens.add({
    targets: target,
    alpha,
    yoyo: true,
    duration,
    ease: "Sine.easeOut",
  });
}

export function floatAndFade(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  distance = 42,
  duration = 720,
): void {
  scene.tweens.add({
    targets: target,
    y: `-=${distance}`,
    alpha: 0,
    duration,
    ease: "Cubic.easeOut",
    onComplete: () => target.destroy(),
  });
}

export function countText(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Text,
  from: number,
  to: number,
  format: (value: number) => string,
  duration = 260,
): void {
  const state = { value: from };
  scene.tweens.add({
    targets: state,
    value: to,
    duration,
    ease: "Quad.easeOut",
    onUpdate: () => target.setText(format(Math.round(state.value))),
  });
}

export function shakeX(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, distance = 8): void {
  scene.tweens.add({
    targets: target,
    x: `+=${distance}`,
    duration: 46,
    yoyo: true,
    repeat: 2,
    ease: "Stepped",
  });
}
