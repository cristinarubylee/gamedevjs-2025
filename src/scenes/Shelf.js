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

    this.bottomLeft = { x: 160, y: 745 };

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
    this.picked = SceneKeys.Game.picked;
    this.total = 20;
    const types = Object.values(BookTypes);

    let i = 0;
    while (i < this.total){
      const book_type = Phaser.Math.RND.pick(types);
      const icon = new Icon(this, this.bottomLeft.x + 15 * i, this.bottomLeft.y, 'book', book_type);

      icon.on('pointerdown', () => {
        if (this.picked == null) {
          this.picked = book_type;
          icon.destroy();
        }
      })
      i++;
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

    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

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
