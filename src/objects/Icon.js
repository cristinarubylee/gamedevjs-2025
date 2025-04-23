import Phaser from "phaser";

export default class Icon extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, sprite, book_type) {
        super(scene.matter.world, x, y, sprite);
        this.scene.add.existing(this);

        this.book_type = book_type;

        this.setStatic(true);
        // this.setRectangle(60, 300);

        this.setInteractive();
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
