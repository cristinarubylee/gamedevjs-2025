import Phaser from 'phaser'

import { SceneKeys } from '../consts/SceneKeys';

export default class Win extends Phaser.Scene
{
    constructor(){
        super(SceneKeys.Win);
    }

    create() {
        this.add.text(100, 50, 'You Win!', { fontSize: '32px', fill: '#fff' });

        const btn1 = this.add.text(100, 100, "Level Select", {
            fontSize: '24px',
            fill: '#0f0',
          }).setInteractive();

    
        btn1.on('pointerdown', () => {
            this.scene.switch(SceneKeys.LevelSelect);
        });
      }
}
    