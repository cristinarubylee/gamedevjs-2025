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
		this.load.image('book_blur', '/assets/book_blur.png');

		this.load.image('angel_icon', '/assets/angel_icon.png');
		this.load.image('demon_icon', '/assets/demon_icon.png');
		this.load.image('neutral_icon', '/assets/neutral_icon.png');

		this.load.image('background', '/assets/background.png');
		this.load.image('foreground', '/assets/foreground.png');
		this.load.image('shelf', '/assets/shelves.png');
	}

	create()
	{
		this.scene.start(SceneKeys.Game)
	}
}