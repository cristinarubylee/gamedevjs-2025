import Phaser from 'phaser';
import Book from '../objects/Book';
import Icon from '../objects/Icon';
import { BookTypes } from '../consts/BookTypes';
import { SceneKeys } from '../consts/SceneKeys';

export default class Shelf extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Shelf);

    this.worldHeight = 1000;
    this.groundHeight = 100;

    this.icons = [];

    // Constants to help organize the books on the shelf
    this.horizontal_gap = 500;
    this.book_gap = 20;
    
    // x value of the leftmost shelf wall
    this.left = 200;

    // Define the y values of the shelf rows
    this.row1 = 740;
    this.row2 = 614;
    this.row3 = 485;
    this.row4 = 360;
    this.row5 = 234;

    this.picked = null;
  }

  preload() {}

  init(data) {
    this.angel = data.angel;
    this.demon = data.demon;
    this.neutral = data.neutral;

    this.total_books = this.angel + this.demon + this.neutral;

    this.picked = null;

    const gameScene = this.scene.get(SceneKeys.Game);
    gameScene.clearAllBooks();
    gameScene.total_books = this.total_books;
    if (gameScene.bookCounterText){
      gameScene.bookCounterText.setText(`Total Books: 0/${this.total_books}`);
    }
    this.scene.switch(SceneKeys.Game);
    gameScene.cameras.main.fadeIn(500, 0, 0, 0);
  }

  create() {
    this.setupPhysicsAndLayers();
    this.setupIcons();
    this.setupUI();
    this.setupInput();
  }

  setupPhysicsAndLayers() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Origin at top left corner
    // Up is negative y, down is positive y
    this.matter.world.setBounds(0, 0, width, this.worldHeight);
    this.cameras.main.setBounds(0, 0, width, this.worldHeight);
    this.cameras.main.scrollY = this.worldHeight - height; // Scroll to the bottom

    this.layerBack = this.add.image(0, 0, 'shelf').setOrigin(0); // Change origin to be at top left corner instead of at center
    this.layerBack.displayWidth = width;
    this.layerBack.displayHeight = this.worldHeight;
  }

  setupUI() {
    this.backBtn = this.add.text(10, 10, '← Menu', {
      fontSize: '20px',
      fill: '#f00'
    })
    .setInteractive()
    .setScrollFactor(0);

    this.bookCounterText = this.add.text(10, 50, `Total Books: 0/${this.total_books}`, {
      fontSize: '20px',
      fill: '#f00'
    })
    .setScrollFactor(0);
  }

  setupInput() {
    // Keybinds
    this.switch = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Allow scroll with mouse wheel
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // Switch scene
    this.switch.on('down', () => {
      const gameScene = this.scene.get(SceneKeys.Game);
      gameScene.picked = this.picked;
      this.scene.switch(SceneKeys.Game);
    });

    // Back to level select
    this.backBtn.on('pointerdown', () => {
      this.scene.switch(SceneKeys.LevelSelect);
    });
  }

  setupIcons() {
    const spriteMap = {
      angel: 'angel_icon',
      demon: 'demon_icon',
      neutral: 'neutral_icon'
    };
  
    const rowMap = {
      1: this.row1,
      2: this.row2,
      3: this.row3,
      4: this.row4,
      5: this.row5
    };
  
    const maxSlots = 25;
    const bookCounts = {
      angel: this.angel || 0,
      demon: this.demon || 0,
      neutral: this.neutral || 0
    };
  
    const totalBooks = Math.min(bookCounts.angel + bookCounts.demon + bookCounts.neutral, maxSlots);
  
    // Create a list of all possible (row, slot) pairs
    const allSlots = [];
    for (let row = 1; row <= 5; row++) {
      for (let slot = 0; slot < 5; slot++) {
        allSlots.push({ row, slot });
      }
    }

    // Shuffle and pick as many slots as needed
    Phaser.Utils.Array.Shuffle(allSlots);
    const chosenSlots = allSlots.slice(0, totalBooks);
  
    // Generates list of book types
    const types = [
      ...Array(bookCounts.angel).fill('angel'),
      ...Array(bookCounts.demon).fill('demon'),
      ...Array(bookCounts.neutral).fill('neutral')
    ].slice(0, totalBooks);
  
    types.forEach((type, i) => {
      const { row, slot } = chosenSlots[i];
      const x = this.left + slot * (this.textures.get(spriteMap[type]).getSourceImage().width + this.book_gap);
      const y = rowMap[row];
      const icon = new Icon(this, x, y, spriteMap[type], type);
  
      icon.on('pointerdown', () => {
        if (!this.picked) {
          this.picked = type;
          icon.destroy();
        }
      });
    });
  }  
  
  update() {
    const cam = this.cameras.main;
    const scrollSpeed = 5;

    if (this.up.isDown) cam.scrollY -= scrollSpeed;
    if (this.down.isDown) cam.scrollY += scrollSpeed;

  }
}
