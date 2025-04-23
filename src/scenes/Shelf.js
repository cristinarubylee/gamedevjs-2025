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
    const vert_gap = 126;
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
    this.total_books = data.total;
    
    this.picked = null;

    const gameScene = this.scene.get(SceneKeys.Game);
    gameScene.clearAllBooks();
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
        'angel': 'angel_icon',
        'demon': 'demon_icon',
        'neutral': 'neutral_icon'
    };

    const rowMap = {
        1: this.row1,
        2: this.row2,
        3: this.row3,
        4: this.row4,
        5: this.row5
    };

    const types = Object.values(BookTypes);
    const maxSlotsPerRow = 5;
    const rowCount = 5;
    const totalSlots = maxSlotsPerRow * rowCount;

    // Clamp total_books to not exceed available slots
    const bookCount = Math.min(this.total_books, totalSlots);

    // Create a list of all possible (row, slot) pairs
    const allSlots = [];
    for (let row = 1; row <= rowCount; row++) {
        for (let slot = 0; slot < maxSlotsPerRow; slot++) {
            allSlots.push({ row, slot });
        }
    }

    // Shuffle and pick as many slots as we need
    Phaser.Utils.Array.Shuffle(allSlots);
    const chosenSlots = allSlots.slice(0, bookCount);

    for (let i = 0; i < bookCount; i++) {
        const { row, slot } = chosenSlots[i];
        const book_type = Phaser.Math.RND.pick(types);
        const book_sprite = spriteMap[book_type] || 'book';

        const book_width = this.textures.get(book_sprite).getSourceImage().width;
        const row_y = rowMap[row];

        const x = this.left + slot * (book_width + this.book_gap);

        const icon = new Icon(this, x, row_y, book_sprite, book_type);

        icon.on('pointerdown', () => {
            if (this.picked == null) {
                this.picked = icon.book_type;
                icon.destroy();
            }
        });
      }
    }
  
  update() {
    const cam = this.cameras.main;
    const scrollSpeed = 5;

    if (this.up.isDown) cam.scrollY -= scrollSpeed;
    if (this.down.isDown) cam.scrollY += scrollSpeed;

  }
}
