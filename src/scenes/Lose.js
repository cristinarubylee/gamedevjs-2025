import Phaser from 'phaser'

import { SceneKeys } from '../consts/SceneKeys';

export default class Lose extends Phaser.Scene
{
    constructor(){
        super(SceneKeys.Lose);
    }

    create() {
        this.add.text(100, 50, 'You Lose!', { fontSize: '32px', fill: '#fff' });

        const btn1 = this.add.text(100, 100, "Try Again?", {
            fontSize: '24px',
            fill: '#0f0',
          }).setInteractive();

        const btn2 = this.add.text(100, 200, "Main Menu", {
            fontSize: '24px',
            fill: '#0f0',
        }).setInteractive();

    
        btn1.on('pointerdown', () => {
            this.scene.start(SceneKeys.Shelf);
        });

        btn2.on('pointerdown', () => {
            this.scene.switch(SceneKeys.LevelSelect);
        });
      }
}
    