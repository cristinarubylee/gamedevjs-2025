import Phaser from 'phaser'

import { SceneKeys } from '../consts/SceneKeys';

export default class Preload extends Phaser.Scene
{
	constructor(){
		super(SceneKeys.Preload);
	}

	preload()
	{
		this.load.image('book', '/assets/book.png');
	}

	create()
	{
		this.scene.start(SceneKeys.Game)
	}
}