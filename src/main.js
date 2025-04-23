import Phaser from 'phaser';
import QuadImagePlugin from 'phaser3-rex-plugins/plugins/quadimage-plugin.js';

import { SceneKeys } from './consts/SceneKeys';
import Preload from './scenes/Preload';
import Game from './scenes/Game'
import Shelf from './scenes/Shelf';
import LevelSelect from './scenes/LevelSelect'

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
  plugins: {
    global: [
        {
            key: 'rexQuadImagePlugin',
            plugin: QuadImagePlugin,
            start: true
        }
    ]
  }
};

const game = new Phaser.Game(config);

game.scene.add(SceneKeys.Preload, Preload);
game.scene.add(SceneKeys.Game, Game);
game.scene.add(SceneKeys.Shelf, Shelf);
game.scene.add(SceneKeys.LevelSelect, LevelSelect);

game.scene.start(SceneKeys.Preload);