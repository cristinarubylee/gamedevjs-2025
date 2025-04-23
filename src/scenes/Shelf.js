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

    // Constants to help organize the books on the shelf
    const vert_gap = 126;
    this.horizontal_gap = 500;
    this.book_gap = 20;
    this.total_books = 30;
    
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

  create() {
    this.setupPhysicsAndLayers();
    this.setupIcons();
    this.setupInput();
    this.setupKeyboard();
    this.setupDragEvents();
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


  setupInput() {
    // Create book on click
    // this.input.on('pointerdown', this.handlePointerDown, this);
    // this.input.on('pointerup', this.handlePointerUp, this);

    // Allow scroll with mouse wheel
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.cameras.main.scrollY += deltaY * 0.5;
    });
  }

  setupKeyboard() {
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // this.keyA.on('down', () => {
    //   if (this.currentlyHeldBook) this.currentlyHeldBook.rotate(15);
    // });

    // this.keyS.on('down', () => {
    //   if (this.currentlyHeldBook) this.currentlyHeldBook.rotate(-15);
    // });

    this.keyP.on('down', () => {
        const gameScene = this.scene.get(SceneKeys.Game);
        gameScene.picked = this.picked;
        this.scene.switch(SceneKeys.Game);
      });

    // this.keySpace.on('down', this.clearAllBooks, this);
  }

  setupDragEvents() {
    // this.input.on('dragstart', (pointer, obj) => {
    //   obj.setStatic(true);
    //   this.currentlyHeldBook = obj;
    // });

    // this.input.on('drag', (pointer, obj, x, y) => {
    //   obj.setPosition(pointer.worldX, pointer.worldY);
    //   if (x > 0 && x < 800 && y > 0 && y < this.worldHeight - this.groundHeight) {
    //     obj.setPosition(pointer.worldX, pointer.worldY);
    //   }
    // });

    // this.input.on('dragend', (pointer, obj) => {
    //   obj.setStatic(false);
    //   this.currentlyHeldBook = null;
    // });
  }

  handlePointerDown(pointer) {
    const x = pointer.worldX;
    const y = pointer.worldY;

  }

  handlePointerUp() {
    // if (this.currentlyHeldBook) {
    //   this.currentlyHeldBook = null;
    // }
  }


  update() {
    const cam = this.cameras.main;
    const scrollSpeed = 5;

    if (this.keyUp.isDown) cam.scrollY -= scrollSpeed;
    if (this.keyDown.isDown) cam.scrollY += scrollSpeed;

  }
}
