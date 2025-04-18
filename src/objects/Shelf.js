export default class Shelf {
    constructor(scene, container, sprite) {
      this.scene = scene;
      this.container = container;
      this.bookSpacing = 20; // Spacing between books
      this.books = [];
      
     // Create the bookshelf back panel
     const shelfBack = this.scene.add.rectangle(125, 425, 200, 300, 
        Phaser.Display.Color.HexStringToColor('#895129').color);
      
      // Create the shelf where books will sit
      const shelf = this.scene.add.rectangle(125, 325, 150, 50, 
        Phaser.Display.Color.HexStringToColor('#2B1700').color);
      
      // Add the shelf components to the container
      this.container.add(shelfBack);
      this.container.add(shelf);
      
      // Ignore the shelf components in the main camera if needed
      this.scene.cameras.main.ignore(shelfBack);
      this.scene.cameras.main.ignore(shelf);
      
      // Add book sprites on the shelf
      this.addBookSprites(shelf, sprite);
    }
    
    addBookSprites(shelf, spriteKey) {
      // Use the provided sprite key, or fall back to a default if none was provided
      const bookSprite = spriteKey || 'book';
      
      // Define specific dimensions for the books
      const bookWidth = 20;
      const bookHeight = 40;
      
      // Dimensions for positioning
      const shelfWidth = 150;
      
      // Calculate how many books we can fit
      const numBooks = Math.floor(shelfWidth / (bookWidth + this.bookSpacing));
      const startX = shelf.x - (shelfWidth / 2) + (bookWidth / 2) + 10;
      
      // Create book sprites and position them on the shelf
      for (let i = 0; i < numBooks; i++) {
        const bookX = startX + i * (bookWidth + this.bookSpacing);
        const bookY = shelf.y; // Position books on top of shelf
        
        // Create a book sprite
        const book = this.scene.add.sprite(bookX, bookY, bookSprite);
        
        // Set specific dimensions instead of scaling
        book.displayWidth = bookWidth;
        book.displayHeight = bookHeight;
        
        // Add the book to the container and to our books array
        this.container.add(book);
        this.books.push(book);
        
        // Ignore the book in the main camera if needed
        this.scene.cameras.main.ignore(book);
      }
    }
    
    // Method to add a new book to the shelf
    addBook(spriteKey) {
      const shelf = this.container.list[1]; // The shelf is the second item we added
      const bookWidth = 20;
      const bookHeight = 40;
      
      // Calculate position for the new book
      const bookX = shelf.x - (shelf.width / 2) + (bookWidth / 2) + 
                    (this.books.length * (bookWidth + this.bookSpacing));
      const bookY = shelf.y;
      
      // Create a new book sprite
      const book = this.scene.add.sprite(bookX, bookY, spriteKey || 'book');
      
      // Set specific dimensions
      book.displayWidth = bookWidth;
      book.displayHeight = bookHeight;
      
      // Add the book to the container and to our books array
      this.container.add(book);
      this.books.push(book);
      
      // Ignore the book in the main camera if needed
      this.scene.cameras.main.ignore(book);
      
      return book;
    }
  }