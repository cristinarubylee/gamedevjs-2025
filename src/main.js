import Phaser from 'phaser';

import Preload from './scenes/Preload';
import Game from './scenes/Game'
import { SceneKeys } from './consts/SceneKeys';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },
      debug: false,
    }
  },
};

const game = new Phaser.Game(config);

game.scene.add(SceneKeys.Game, Game);
game.scene.add(SceneKeys.Preload, Preload);

game.scene.start(SceneKeys.Preload);