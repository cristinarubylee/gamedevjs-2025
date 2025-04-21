import Phaser from 'phaser';
import Book from '../objects/Book';
import { BookTypes } from '../consts/BookTypes';
import { SceneKeys } from '../consts/SceneKeys';

export default class Game extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);

    this.worldHeight = 1000;
    this.groundHeight = 150;

    this.books = [];
    this.currentlyHeldBook = null;
    this.picked = null;
  }

  preload() {}

  create() {
    this.setupPhysicsAndLayers();
    this.setupInput();
    this.setupKeyboard();
    this.setupDragEvents();

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  setupPhysicsAndLayers() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Origin at top left corner
    // Up is negative y, down is positive y
    this.matter.world.setBounds(0, 0, width, this.worldHeight);
    this.cameras.main.setBounds(0, 0, width, this.worldHeight);
    this.cameras.main.scrollY = this.worldHeight - height; // Scroll to the bottom
    
    const ground = this.add.rectangle(width/2, this.worldHeight - this.groundHeight/2, width, this.groundHeight, 0x444444, 0); // Origin is at center here
    this.matter.add.gameObject(ground, { isStatic: true });
    ground.setData('isTable', true);

    this.layerBack = this.add.image(0, 0, 'background').setOrigin(0); // Change origin to be at top left corner instead of at center
    this.layerBack.displayWidth = width;
    this.layerBack.displayHeight = this.worldHeight;
    this.layerBack.setScrollFactor(0.5);

    this.layerFront = this.add.image(0, 0, 'foreground').setOrigin(0);
    this.layerFront.displayWidth = width;
    this.layerFront.displayHeight = this.worldHeight;
  }


  setupInput() {
    // Create book on click
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointerup', this.handlePointerUp, this);

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

    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

  
    this.keyA.on('down', () => {
      if (this.currentlyHeldBook) this.currentlyHeldBook.rotate(15);
    });

    this.keyS.on('down', () => {
      if (this.currentlyHeldBook) this.currentlyHeldBook.rotate(-15);
    });

    this.keySpace.on('down', this.clearAllBooks, this);

    this.keyP.on('down', () => {
      const shelfScene = this.scene.get(SceneKeys.Shelf);
      shelfScene.picked = this.picked;
      this.scene.switch(SceneKeys.Shelf);
    });
  }

  setupDragEvents() {
    this.input.on('dragstart', (pointer, obj) => {
      obj.setStatic(true);
      this.currentlyHeldBook = obj;
    });

    this.input.on('drag', (pointer, obj, x, y) => {
      obj.setPosition(pointer.worldX, pointer.worldY);
      if (x > 0 && x < 800 && y > 0 && y < this.worldHeight - this.groundHeight) {
        obj.setPosition(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('dragend', (pointer, obj) => {
      obj.setStatic(false);
      this.currentlyHeldBook = null;
    });
  }

  handlePointerDown(pointer) {
    if (this.picked == null){
      return;
    }

    const x = pointer.worldX;
    const y = pointer.worldY;

    // const bodies = this.matter.intersectPoint(x, y);
    // // if (bodies.length > 0) return;

    // const types = Object.values(BookTypes);
    // const book_type = Phaser.Math.RND.pick(types);

    const book = new Book(this, x, y, 'book', 'book_blur', this.picked);

    this.currentlyHeldBook = book;
    this.input.setDraggable(book);
    this.books.push(book);

    this.picked = null;
  }

  handlePointerUp() {
    if (this.currentlyHeldBook) {
      this.currentlyHeldBook = null;
    }
  }

  clearAllBooks() {
    this.books.forEach(book => book.destroy());
    this.books = [];
    this.currentlyHeldBook = null;
  }

  update() {
    const cam = this.cameras.main;
    const scrollSpeed = 5;

    if (this.keyUp.isDown) cam.scrollY -= scrollSpeed;
    if (this.keyDown.isDown) cam.scrollY += scrollSpeed;

    this.books.forEach(book => book.updateGlow());
  }
}
