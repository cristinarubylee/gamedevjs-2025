import Phaser from 'phaser'

import { SceneKeys } from '../consts/SceneKeys';

export default class Win extends Phaser.Scene
{
    constructor(){
        super(SceneKeys.Win);
    }

    create() {
        this.add.text(400, 250, 'You did it!', {
            fontFamily: 'ChalkFont',
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        const backBtn = this.add.image(400, 350, 'exit_ui')
        .setDepth(99)
        .setOrigin(0.5)
        .setInteractive()
        .setScrollFactor(0);

        // const restartBtn = this.add.image(400, 350, 'restart_ui')
        // .setDepth(99)
        // .setOrigin(0.5)
        // .setInteractive()
        // .setScrollFactor(0);

    
        // restartBtn.on('pointerdown', () => {
        //     this.sound.play('click_sound', { volume: 0.5 });
        //     this.scene.start(SceneKeys.Shelf);
        // });

        backBtn.on('pointerdown', () => {
            this.sound.play('click_sound', { volume: 0.5 });
            this.scene.switch(SceneKeys.LevelSelect);
        });

      }
}
    