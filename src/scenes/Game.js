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
    this.curr_level = null;
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
    this.bookCounterText = this.add.text(20, 20, `Books balanced: 0/${this.total_books}`, {
      fontFamily: 'ChalkFont',
      fontSize: '22px',
      fill: '#E2E2E2',
    })
    .setDepth(99)
    .setScrollFactor(0);

    this.backBtn = this.add.image(47, 460, 'exit_ui')
    .setDepth(99)
    .setOrigin(0.5)
    .setInteractive()
    .setScrollFactor(0);

    this.restartBtn = this.add.image(50, 550, 'restart_ui')
    .setDepth(99)
    .setOrigin(0.5)
    .setInteractive()
    .setScrollFactor(0);

    this.shelfBtn = this.add.image(750, 50, 'shelf_ui')
    .setDepth(99)
    .setInteractive()
    .setScrollFactor(0);

    this.uiButtons = [this.backBtn, this.shelfBtn, this.restartBtn];
  }

  isPointerOnUI(pointer) {
    return this.uiButtons.some(btn => btn.getBounds().contains(pointer.x, pointer.y));
  }  
  
  setupInput() {
    // Keybinds
    this.leftRotate = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightRotate = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.switch = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.clearBooks = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

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
    // this.clearBooks.on('down', this.clearAllBooks, this);

    // Switch scene
    this.switch.on('down', () => {
      this.sound.play('ui_click_sound', { volume: 0.25 });
      const shelfScene = this.scene.get(SceneKeys.Shelf);
      shelfScene.picked = this.picked;
      shelfScene.bookCounterText.setText(`Books balanced: ${this.books.length}/${this.total_books}`); // Update counter in shelf
      this.scene.switch(SceneKeys.Shelf);
    });
    this.shelfBtn.on('pointerdown', () => {
      this.sound.play('ui_click_sound', { volume: 0.25 });
      const shelfScene = this.scene.get(SceneKeys.Shelf);
      shelfScene.picked = this.picked;
      shelfScene.bookCounterText.setText(`Books balanced: ${this.books.length}/${this.total_books}`); // Update counter in shelf
      this.scene.switch(SceneKeys.Shelf);
    });

    // Back to level select
    this.backBtn.on('pointerdown', () => {
      this.sound.play('click_sound', { volume: 0.5 });
      this.scene.switch(SceneKeys.LevelSelect);
    });

    // Restart level
    this.restartBtn.on('pointerdown', () => {
      this.sound.play('click_sound', { volume: 0.5 });
      this.scene.launch(SceneKeys.Shelf);
    });

    // Create book on click
    this.input.on('pointerdown', (pointer) => {
       if (!this.isPointerOnUI(pointer)) {
        this.handlePointerDown(pointer);
      }
    }, this);
    this.input.on('pointerup', this.handlePointerUp, this);
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
            this.sound.play('doom_sound', { volume: 0.5 });
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

          if (this.sensorOverlaps.size !== 0){
            this.sensorOverlaps.get(bodyA).delete(bodyB);
            this.sensorOverlaps.get(bodyB).delete(bodyA);
          }

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
    if (!overlaps) return;

    const matching = [...overlaps].filter(s => s.book_type === sensor.book_type && !s.exploded);

    if (matching.length >= 2) {
        const group = [sensor, ...matching];
        this.matter.world.remove(sensor);
        this.matter.world.remove(matching);
        this.triggerExplosion(group);
    }
  }

  triggerExplosion(group) {
    this.sound.stopAll();

    this.sound.play('dead_sound', { volume: 0.5 });

    this.input.enabled = false;

    this.time.delayedCall(200, () => {
      this.cameras.main.fadeOut(1200, 255, 255, 255);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.switch(SceneKeys.Lose);
      });
    });
  }

  handlePointerDown(pointer) {
    if (this.picked == null){
      return;
    }

    this.sound.play('place_sound', { volume: 0.5 });
    
    const x = pointer.worldX;
    const y = pointer.worldY;

    const book = new Book(this, x, y, this.picked);
    const sensor = book.sensor;

    this.currentlyHeldBook = book;
    this.input.setDraggable(book);
    this.books.push(book);
    this.bookCounterText.setText(`Books balanced: ${this.books.length}/${this.total_books}`);

    this.sensors.push(sensor);
    this.sensorOverlaps.set(sensor, new Set());
    
    this.time.delayedCall(1000, () => {
      if (this.books.length >= this.total_books){
        this.cameras.main.fadeOut(500, 0, 0, 0);
        const levelScene = this.scene.get(SceneKeys.LevelSelect);
        levelScene.unlockedLevels = this.curr_level;
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.switch(SceneKeys.Win);
        });
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

  resetGame(total_books){
    this.input.enabled = true;
    this.clearAllBooks();
    this.sensorOverlaps = new Map();
    this.total_books = total_books;
    this.picked = null;
    if (this.bookCounterText){
      this.bookCounterText.setText(`Books balanced: 0/${this.total_books}`);
    }
    this.cameras.main.scrollY = this.worldHeight - this.scale.height; // Scroll to the bottom
  }

  update() {
    const cam = this.cameras.main;
    const scrollSpeed = 5;

    if (this.up.isDown) cam.scrollY -= scrollSpeed;
    if (this.down.isDown) cam.scrollY += scrollSpeed;

    this.books.forEach(book => {
      book.updateMovement();
      book.updateGlow();
      book.updateSensor();
      book.updateShadow();
    });
  }
}
