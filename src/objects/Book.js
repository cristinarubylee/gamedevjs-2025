import Phaser from "phaser";

export default class Book extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, sprite, blur, book_type) {
        super(scene.matter.world, x, y, sprite);
        this.scene.add.existing(this);

        const colorMap = {
            'angel': Phaser.Display.Color.HexStringToColor('#F2E6C9').color, // Cream
            'demon': Phaser.Display.Color.HexStringToColor('#5C1A1B').color, // Red
            'neutral': Phaser.Display.Color.HexStringToColor('#7E8662').color, // Green
        }

        const color = colorMap[book_type] || Phaser.Display.Color.HexStringToColor('#FFFFFF').color;
        
        this.setTint(color);

        this.setScale(0.6);
        // this.setRectangle(60, 300);

        this.setBounce(0.5);
        this.setFriction(1);
        this.setInteractive();

        // this.sensor = this.scene.matter.add.circle(x, y, 50, {
        //     isSensor: true,
        //     isStatic: true
        // })
        // this.glow = this.createGlow(this.x, this.y, 60, 200, color)

        this.shadow = this.scene.add.rexQuadImage(x, y, blur)
            .setTint(color)
            .setAlpha(0.1)
            .setScale(0.6)

        const scale = this.scale;
        const width = this.width * scale;
        const height = this.height * scale;

        const baseX = x - width/2;
        const baseY = y + height/2;
        const shadowHeight = 30;
        const warp = 30;

        // Top edge (aligned with object bottom)
        this.shadow.topLeft.setPosition(baseX, baseY);
        this.shadow.topRight.setPosition(baseX + width, baseY);

        // Bottom edge (pushed down and warped for trapezoid effect on table)
        this.shadow.bottomLeft.setPosition(baseX - warp, baseY + shadowHeight);
        this.shadow.bottomRight.setPosition(baseX + width + warp, baseY + shadowHeight);

        this.setDepth(10);
    }

    rotate(degrees) {
        this.setRotation(this.rotation + Phaser.Math.DegToRad(degrees));
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
    
    updateGlow() {
        // if (this.glow) {
        //     this.glow.setPosition(this.x, this.y);
        //     this.glow.rotation = this.rotation;
        // }
        // if (this.sensor) {
        //     this.scene.matter.body.setPosition(this.sensor, {x: this.x, y: this.y})
        //     this.sensor.rotation = this.rotation;
        // }

        const tableY = 800;
        const maxShadowY = 850;

        // Early exit if no shadow
        if (!this.shadow) return;

        const { x, y } = this;
        const rayStart = { x, y };
        const localRayEnd = { x, y: y + 1.2*(this.height * this.scale)/2 }; // Cast ray down
        const farRayEnd = { x, y: y + this.scene.scale.height}; // Cast ray down

        const localHits = Phaser.Physics.Matter.Matter.Query.ray(
            this.scene.matter.world.localWorld.bodies,
            rayStart,
            localRayEnd
        );

        const farHits = Phaser.Physics.Matter.Matter.Query.ray(
            this.scene.matter.world.localWorld.bodies,
            rayStart,
            farRayEnd
        );

        let tableHit = true;
        for (const hit of localHits) {
            if (hit.body == this.body){
                continue;
            }
            const obj = hit.body.gameObject;
            if (obj && obj.getData && obj.getData('isTable')) {
                tableHit = true;
                break; // Stop when table is hit
            } else {
                // Something is blocking the way (not table)
                tableHit = false;
                break;
            }
        }

        for (const hit of farHits) {
            const obj = hit.body.gameObject;
            if (hit.body == this.body){
                continue;
            }
            if (obj && (obj.getData && !obj.getData('isTable'))) { // Assuming that every object has object data
                tableHit = false;
                break; // Stop when table is hit
            }
        }

        if (tableHit) {
            const delta = Math.max(0, (tableY - this.y)/this.scene.scale.height);
            const dist = maxShadowY - tableY;
            const shadowY = Math.min(maxShadowY, tableY + (this.scale * this.height) / 2.2 + dist * delta); // Use 2.5 instead of 2 so shadow is a little under the book
        
            this.shadow.setVisible(true);
            this.shadow.setPosition(this.x, shadowY);

            const scaleFactor = 0.6 - 0.1*delta;

            this.shadow.setScale(scaleFactor);

        } else {
            this.shadow.setVisible(false);
        }
        
    }
    
    destroy() {
        // if (this.sensor){
        //     this.scene.matter.world.remove(this.sensor);
        //     this.sensor = null;
        // }
        if (this.shadow) {
            this.shadow.destroy();
            this.shadow = null;
        }
        super.destroy();
    }

}
