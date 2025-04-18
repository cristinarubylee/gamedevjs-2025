import Phaser from 'phaser'
import Book from '../objects/Book';
import Shelf from '../objects/Shelf';
import { BookTypes } from '../consts/BookTypes';
import { SceneKeys } from '../consts/SceneKeys';

export default class Game extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);
    this.books = [];
    this.currentlyHeldBook = null;
  }

  preload() {}

  create() {
    // Initialize camera layers
    this.worldLayer = this.add.container();
    this.uiLayer = this.add.container();

    const bookData = [
      { title: 'Book of Light', type: 'angel', color: 0xF2E6C9 },
      { title: 'Grimoire', type: 'demon', color: 0x5C1A1B },
      { title: 'Chronicles', type: 'neutral', color: 0x7E8662 },
    ];
    
    this.matter.add.pointerConstraint({
      length: 0,
      stiffness: 0.2
    });

    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Add event handlers for rotation keys
    this.keyA.on('down', () => {
      if (this.currentlyHeldBook) {
        this.currentlyHeldBook.rotate(15);
      }
    });
    
    this.keyS.on('down', () => {
      if (this.currentlyHeldBook) {
        this.currentlyHeldBook.rotate(-15);
      }
    });
    
    // Add ground and world bounds
    const ground = this.add.rectangle(400, 590, 800, 60, 0x444444);
    this.matter.add.gameObject(ground, { isStatic: true });
    this.matter.world.setBounds(0, -400, 800, 1000);
    this.worldLayer.add(ground);

    // Make camera bounds beyond current screen
    this.cameras.main.setBounds(0, -400, 800, 1000);

    // Ignore UI for main camera
    this.cameras.main.ignore(this.uiLayer);

    // Ignore world for UI camera
    this.uiCamera = this.cameras.add(0, 0, 800, 600);
    this.uiCamera.ignore(this.worldLayer);

    
    this.shelf = new Shelf(this, this.uiLayer, 'book');

    // Create book on click
    this.input.on('pointerdown', this.handlePointerDown, this);
    
    // Clear all books when spacebar is pressed
    this.keySpace.on('down', this.clearAllBooks, this);
    
    // When no longer clicking, remove our currentlyHeldBook
    this.input.on('pointerup', this.handlePointerUp, this);

    this.setupDragEvents();
    
    // Allow to scroll up in the world
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      const cam = this.cameras.main;
      cam.scrollY += deltaY * 0.5;
    });
    
  }
  
  handlePointerDown(pointer) {
    // Translate pointer coordinates to world coordinates
    const x = pointer.worldX;
    const y = pointer.worldY;

    // Check if pointer is over a body
    const bodies = this.matter.intersectPoint(x, y);
    if (bodies.length > 0) return;

    // Randomly assign a book type
    const types = Object.values(BookTypes);
    const book_type = Phaser.Math.RND.pick(types);

    const book = new Book(this, x, y, 'book', book_type);
    book.rotate(90);
    this.worldLayer.add(book);
  
    this.currentlyHeldBook = book;

    this.input.setDraggable(book);
    
    this.books.push(book);
  }

  handlePointerUp() {
    if (this.currentlyHeldBook) {
      this.currentlyHeldBook = null;
    }
  }

  setupDragEvents() {
    this.input.on('dragstart', (pointer, obj) => {
      obj.setStatic(true); // freeze for dragging
      this.currentlyHeldBook = obj; 
    });

    this.input.on('drag', (pointer, obj, x, y) => {
      if (x > 0 && x < 800 && y > 0 && y < 540){
        obj.setPosition(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('dragend', (pointer, obj) => {
      obj.setStatic(false); // unfreeze so it drops
      this.currentlyHeldBook = null; 
    });
  }
  
  
  clearAllBooks() {
    this.books.forEach(book => book.destroy())
    this.books = [];
    this.currentlyHeldBook = null;
  }

  update() {
    this.books.forEach(book => book.updateGlow());

    // Allow scrolling with up/down keys
    const cam = this.cameras.main;
    const scrollSpeed = 5;

    if (this.keyUp.isDown) {
      cam.scrollY -= scrollSpeed;
    }

    if (this.keyDown.isDown) {
      cam.scrollY += scrollSpeed;
    }
  }
}
