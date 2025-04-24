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

    this.sensors = [];
    this.sensorOverlaps = new Map();

    this.picked = null;
    this.total_books = 25;
  }

  preload() {}

  create() {
    this.setupPhysicsAndLayers();
    this.setupUI();
    this.setupInput();
    this.setupCollisions();
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
    this.leftRotate = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightRotate = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.switch = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.clearBooks = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Create book on click
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointerup', this.handlePointerUp, this);

    // Drag events
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

    // Allow scroll with mouse wheel
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // Book rotations
    this.leftRotate.on('down', () => {
      if (this.currentlyHeldBook) this.currentlyHeldBook.rotate(15);
    });
    this.rightRotate.on('down', () => {
      if (this.currentlyHeldBook) this.currentlyHeldBook.rotate(-15);
    });

    // Clear books
    this.clearBooks.on('down', this.clearAllBooks, this);

    // Switch scene
    this.switch.on('down', () => {
      const shelfScene = this.scene.get(SceneKeys.Shelf);
      shelfScene.picked = this.picked;
      shelfScene.bookCounterText.setText(`Total Books: ${this.books.length}/${this.total_books}`); // Update counter in shelf
      this.scene.switch(SceneKeys.Shelf);
    });

    // Back to level select
    this.backBtn.on('pointerdown', () => {
      this.scene.switch(SceneKeys.LevelSelect);
    });
  }

  setupCollisions() {
    this.matter.world.on('collisionstart', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        if (bodyA.isSensorBook && bodyB.isSensorBook) {
          if (bodyA.book_type === 'neutral' || bodyB.book_type === 'neutral') {
            continue;
          }
          
          this.sensorOverlaps.get(bodyA).add(bodyB);
          this.sensorOverlaps.get(bodyB).add(bodyA);

          if (bodyA.book_type == bodyB.book_type){
            bodyA.parent_book.adjustGlow(1);
            bodyB.parent_book.adjustGlow(1);
          }

          this.checkForExplosion(bodyA);
          this.checkForExplosion(bodyB);
          }
      }
    });
  
    this.matter.world.on('collisionend', (event) => {
      for (const pair of event.pairs) {
          const { bodyA, bodyB } = pair;
  
        if (bodyA.isSensorBook && bodyB.isSensorBook) {
          if (bodyA.book_type === 'neutral' || bodyB.book_type === 'neutral') {
            continue;
          }

          this.sensorOverlaps.get(bodyA).delete(bodyB);
          this.sensorOverlaps.get(bodyB).delete(bodyA);

          if (bodyA.book_type == bodyB.book_type){
            bodyA.parent_book.adjustGlow(-1);
            bodyB.parent_book.adjustGlow(-1);
          }
          
        }
      }
    });
  }

  checkForExplosion(sensor) {
    if (sensor.exploded) return;

    const overlaps = this.sensorOverlaps.get(sensor);
    // console.log(overlaps);
    if (!overlaps) return;

    const matching = [...overlaps].filter(s => s.book_type === sensor.book_type && !s.exploded);

    if (matching.length >= 2) {
        const group = [sensor, ...matching];
        this.triggerExplosion(group);
    }
  }

  triggerExplosion(group) {

    console.log(`Explosion for ${group.length} books of type "${group[0].book_type}"`);
    this.scene.switch(SceneKeys.Lose);

  }


  handlePointerDown(pointer) {
    if (this.picked == null){
      return;
    }

    const x = pointer.worldX;
    const y = pointer.worldY;

    const book = new Book(this, x, y, this.picked);
    const sensor = book.sensor;

    this.currentlyHeldBook = book;
    this.input.setDraggable(book);
    this.books.push(book);
    this.bookCounterText.setText(`Total Books: ${this.books.length}/${this.total_books}`);

    this.sensors.push(sensor);
    this.sensorOverlaps.set(sensor, new Set());

    this.time.delayedCall(2000, () => {
      if (this.books.length >= this.total_books){
        this.scene.switch(SceneKeys.Win);
      }
    });

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

    if (this.up.isDown) cam.scrollY -= scrollSpeed;
    if (this.down.isDown) cam.scrollY += scrollSpeed;

    this.books.forEach(book => {
      book.updateGlow();
      book.updateSensor();
      book.updateShadow();
    });
  }
}
