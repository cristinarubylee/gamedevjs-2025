import Phaser from "phaser";
import { SceneKeys } from "../consts/SceneKeys";

export default class Title extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Title);

    this.levels = [
      { id: 1, angel: 0, demon: 5, neutral: 2},
      { id: 2, angel: 5, demon: 5, neutral: 0},
      { id: 2, angel: 5, demon: 5, neutral: 0},
      { id: 2, angel: 5, demon: 5, neutral: 0},
      { id: 2, angel: 5, demon: 5, neutral: 0},
    ];
    
  }

  create() {
    this.title_music = this.sound.add('title_music', { loop: true, volume: 0.25 }).play();
    
    this.add.image(0, 0, 'title').setOrigin(0);

    const startText = this.add.text(400, 80, 'Click anywhere to start', {
      fontFamily: 'ChalkFont',
      fontSize: '32px',
      fill: '#E2E2E2'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      scale: { from: 1, to: 1.1 },
      ease: 'Sine.easeInOut',
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.input.on('pointerdown', () => {
      this.sound.play('click_sound', { volume: 0.5 });
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.sound.stopAll();
        this.scene.start(SceneKeys.LevelSelect);
      });
    });
  };
}
  