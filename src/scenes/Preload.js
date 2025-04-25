import Phaser from 'phaser'

import { SceneKeys } from '../consts/SceneKeys';

export default class Preload extends Phaser.Scene
{
	constructor(){
		super(SceneKeys.Preload);
	}

	preload()
	{
		this.load.audio('title_music', 'assets/title.mp3');
		this.load.audio('click_sound', 'assets/click.mp3');
		this.load.audio('ui_click_sound', 'assets/click2.mp3');
		this.load.audio('take_sound', 'assets/take.mp3');
		this.load.audio('place_sound', 'assets/take.mp3');
		this.load.audio('dead_sound', 'assets/dead.mp3');
		this.load.audio('doom_sound', 'assets/doom.mp3');

		this.load.image('book', 'assets/book.png');
		this.load.image('book_blur', 'assets/book_blur.png');

		this.load.image('angel_icon', 'assets/angel_icon.png');
		this.load.image('demon_icon', 'assets/demon_icon.png');
		this.load.image('neutral_icon', 'assets/neutral_icon.png');

		this.load.image('angel', 'assets/angel_physical.png');
		this.load.image('demon', 'assets/demon_physical.png');
		this.load.image('neutral', 'assets/neutral_physical.png');

		this.load.image('background', 'assets/background.png');
		this.load.image('foreground', 'assets/foreground.png');
		this.load.image('shelf', 'assets/shelves.png');

		this.load.image('table_ui', 'assets/table.png');
		this.load.image('shelf_ui', 'assets/shelf_ui.png');
		this.load.image('exit_ui', 'assets/exit.png');
		this.load.image('restart_ui', 'assets/restart.png');

		this.load.image('level_1', 'assets/level_1.png');
		this.load.image('level_2', 'assets/level_2.png');
		this.load.image('level_3', 'assets/level_3.png');
		this.load.image('level_4', 'assets/level_4.png');
		this.load.image('level_5', 'assets/level_5.png');

		this.load.image('level_background', 'assets/level_background.png');

		this.load.image('title', 'assets/title.png')

		this.fontReady = document.fonts.load('16px ChalkFont');
	}

	async create()
	{
		await this.fontReady;
		this.scene.start(SceneKeys.Title)
	}
}