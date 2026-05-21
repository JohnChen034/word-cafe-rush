import Phaser from "phaser";
import "./style.css";
import { GameScene } from "./scenes/GameScene";
import { MenuScene } from "./scenes/MenuScene";
import { ResultsScene } from "./scenes/ResultsScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: "game",
  width: 960,
  height: 640,
  backgroundColor: "#f7efe2",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, GameScene, ResultsScene],
};

const game = new Phaser.Game(config);

if (import.meta.env.DEV) {
  (window as unknown as { __WORD_CAFE_RUSH_GAME__?: Phaser.Game }).__WORD_CAFE_RUSH_GAME__ = game;
}
