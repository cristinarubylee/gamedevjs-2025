import Phaser from "phaser";

export default class Icon extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, sprite, book_type) {
        super(scene.matter.world, x, y, sprite);
        this.scene.add.existing(this);

        this.book_type = book_type;

        this.setStatic(true);

        this.setInteractive();
    }

    destroy() {
        super.destroy();
    }

}
