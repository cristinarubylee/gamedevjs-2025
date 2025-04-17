import Phaser from "phaser";

export default class Book extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, sprite, book_type) {
        super(scene.matter.world, x, y, sprite);
        this.scene = scene;

        this.scene.add.existing(this);

        const colorMap = {
            'angel': Phaser.Display.Color.HexStringToColor('#4169E1').color, // Blue
            'demon': Phaser.Display.Color.HexStringToColor('#8B0000').color, // Red
            'neutral': Phaser.Display.Color.HexStringToColor('#03AC13').color, // Green
        }

        const color = colorMap[book_type] || Phaser.Display.Color.HexStringToColor('#FFFFFF').color;
        
        this.setTint(color);

        this.setScale(0.2);
        this.setRectangle(20, 100);

        this.setBounce(0);
        this.setFriction(1);
        this.setFrictionAir(0.01);
        this.setInteractive();

        this.glow = this.createGlow(this.x, this.y, 20, 100, color)
    }

    rotate(degrees) {
        this.setRotation(this.rotation + Phaser.Math.DegToRad(degrees));
    }

    createGlow(x, y, width, height, color) {
        const glow = this.scene.add.graphics({ x, y });
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
    
    updateGlow() {
        if (this.glow) {
            this.glow.setPosition(this.x, this.y);
            this.glow.rotation = this.rotation;
        }
    }
    
    destroy() {
        if (this.glow) this.glow.destroy();
        super.destroy();
    }

}
