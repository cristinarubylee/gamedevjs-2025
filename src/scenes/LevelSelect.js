import Phaser from "phaser";
import { SceneKeys } from "../consts/SceneKeys";

export default class LevelSelect extends Phaser.Scene {
    constructor() {
      super(SceneKeys.LevelSelect);

      this.levels = [
        { id: 1, items: ['book1', 'book2'], total: 10},
        { id: 2, items: ['book3', 'book4'], total: 20},
        // etc.
      ];
      
    }
  
    create() {
      this.add.text(100, 50, 'Select a Level', { fontSize: '32px', fill: '#fff' });
  
      this.levels.forEach((level, index) => {
        const btn = this.add.text(100, 100 + index * 40, `Level ${level.id}`, {
          fontSize: '24px',
          fill: '#0f0',
        }).setInteractive();
  
        btn.on('pointerdown', () => {
          this.scene.start(SceneKeys.Shelf, {total: level.total});
        });
      });
    }
  }
  