import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },
      debug: false,
    }
  },
  scene: {
    create,
    update
  }
};

let rectangles = []; // Define the rectangles array globally within the scene

function create() {
  const scene = this;

  this.matter.add.pointerConstraint({
    length: 0,
    stiffness: 0.2
  });

  function createGlow(scene, x, y, width, height, color) {
    const glow = scene.add.graphics({ x: x, y: y });
    glow.setDepth(-1);
    glow.setBlendMode(Phaser.BlendModes.ADD);

    for (let i = 0; i < 10; i++) {
      const alpha = 0.03;
      const offset = i;
      glow.fillStyle(color, alpha);
      glow.fillRect(-width / 2 - offset, -height / 2 - offset, width + offset * 2, height + offset * 2);
    }
  
    return glow;
  }
  
  // Add ground (a static body)
  const ground = this.add.rectangle(400, 590, 800, 20, 0x444444);
  this.matter.add.gameObject(ground, { isStatic: true });

  // Set world bounds (boundary walls)
  this.matter.world.setBounds(0, 0 , 800, 600);

  // On click: add a draggable rectangle
  this.input.on('pointerdown', function (pointer) {
    // Check if pointer is over a body
    const bodies = scene.matter.intersectPoint(pointer.x, pointer.y);
    if (bodies.length > 0) return;

    const color = Phaser.Display.Color.RandomRGB().color;
    const rect = scene.add.rectangle(pointer.x, pointer.y, 80, 30, color);

    // Add Matter physics body
    const body = scene.matter.add.gameObject(rect, {
      shape: { type: 'rectangle' },
      chamfer: { radius: 4 }, // rounded corners look nicer
    });

    body.setBounce(0);
    body.setFriction(0.4);
    body.setFrictionAir(0.01);
    body.setInteractive();

    const glow = createGlow(scene, pointer.x, pointer.y, 80, 30, color)

    // Drag-and-drop using built-in constraint
    scene.input.setDraggable(body);

    scene.input.on('dragstart', function (_, obj) {
      obj.setStatic(true); // freeze for dragging
    });

    scene.input.on('drag', function (_, obj, x, y) {
      obj.setPosition(x, y);
    });

    scene.input.on('dragend', function (_, obj) {
      obj.setStatic(false); // unfreeze so it drops
    });

    // Add the rectangle to the array
    rectangles.push({ body, glow });
  });

  // Listen for spacebar key press to clear all rectangles
  this.input.keyboard.on('keydown-SPACE', function () {  // Fixed key press to 'W'
    rectangles.forEach(rect => {
      rect.destroy();  // Remove the rectangle from the scene
      glow.destroy();
    });
    rectangles = [];  // Clear the array
  });
}

function update() {
    rectangles.forEach(({body, glow}) => {
        glow.setPosition(body.x, body.y);
        glow.rotation = body.rotation;
    });
}

new Phaser.Game(config);
