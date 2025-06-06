import Phaser from "phaser";
import { SceneKeys } from "../consts/SceneKeys";

export default class LevelSelect extends Phaser.Scene {
    constructor() {
      super(SceneKeys.LevelSelect);

      this.levels = [
        { id: 1, angel: 0, demon: 5, neutral: 2},
        { id: 2, angel: 2, demon: 5, neutral: 2},
        { id: 3, angel: 8, demon: 0, neutral: 0},
        { id: 4, angel: 5, demon: 5, neutral: 0},
        { id: 2, angel: 10, demon: 10, neutral: 5},
      ];

      this.unlockedLevels = 1;
      
    }
  
    create() {
      this.add.image(0, 0, 'level_background').setOrigin(0);

      this.add.text(400, 80, 'Select a Level', {
        fontFamily: 'ChalkFont',
        fontSize: '32px',
        fill: '#E2E2E2'
      }).setOrigin(0.5);
      this.add.text(400, 120, '. . .', {
        fontFamily: 'ChalkFont',
        fontSize: '32px',
        fill: '#E2E2E2'
      }).setOrigin(0.5);
  
      this.levels.forEach((level, index) => {
        const unlockedLevels = this.unlockedLevels;
        const isUnlocked = index < unlockedLevels;

        const btn = this.add.image(50 + 155 * index, 250, `level_${index + 1}`)
        .setOrigin(0)
        .setInteractive();

        if (!isUnlocked) {
          btn.setTint(0x444444).color;
        }

        btn.on('pointerover', () => {
          if (!isUnlocked) return;
          this.tweens.add({
            targets: btn,
            scale: 1.1,
            duration: 150,
            ease: 'Power1'
          });
        });
    
        btn.on('pointerout', () => {
          if (!isUnlocked) return;
          this.tweens.add({
            targets: btn,
            scale: 1,
            duration: 150,
            ease: 'Back'
          });
        });
  
        btn.on('pointerdown', () => {
          if (!isUnlocked) return;
          this.sound.stopAll();
          this.sound.play('click_sound', { volume: 0.75 });
          this.scene.start(SceneKeys.Shelf, level);
        });
      });
    }


  }
  