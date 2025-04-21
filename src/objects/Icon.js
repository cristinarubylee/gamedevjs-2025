import Phaser from "phaser";

export default class Icon extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, sprite, book_type) {
        super(scene.matter.world, x, y, sprite);
        this.scene.add.existing(this);

        const colorMap = {
            'angel': Phaser.Display.Color.HexStringToColor('#F2E6C9').color, // Cream
            'demon': Phaser.Display.Color.HexStringToColor('#5C1A1B').color, // Red
            'neutral': Phaser.Display.Color.HexStringToColor('#7E8662').color, // Green
        }

        const color = colorMap[book_type] || Phaser.Display.Color.HexStringToColor('#FFFFFF').color;
        this.setTint(color);

        this.setScale(0.2);
        this.setStatic(true);
        this.setRotation(Phaser.Math.DegToRad(90));
        // this.setRectangle(60, 300);

        this.setInteractive();

        // this.sensor = this.scene.matter.add.circle(x, y, 50, {
        //     isSensor: true,
        //     isStatic: true
        // })
        // this.glow = this.createGlow(this.x, this.y, 60, 200, color)
    }

    createGlow(x, y, width, height, color) {
        // const glow = this.scene.add.graphics({ x, y });
        // glow.setDepth(-1);
        // glow.setBlendMode(Phaser.BlendModes.ADD);
    
        // for (let i = 0; i < 10; i++) {
        //   const alpha = 0.03;
        //   const offset = i;
        //   glow.fillStyle(color, alpha);
        //   glow.fillRect(-width / 2 - offset, -height / 2 - offset, width + offset * 2, height + offset * 2);
        // }
    
        // return glow;
      }
    

    destroy() {
        // if (this.sensor){
        //     this.scene.matter.world.remove(this.sensor);
        //     this.sensor = null;
        // }
        super.destroy();
    }

}
