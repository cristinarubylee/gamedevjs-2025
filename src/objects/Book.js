import Phaser from "phaser";
import { BookTypes } from '../consts/BookTypes';

export default class Book extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, book_type) {
        super(scene.matter.world, x, y, book_type);
        this.scene.add.existing(this);

        const colorMap = {
            'angel': Phaser.Display.Color.HexStringToColor('#F2E6C9').color, // Cream
            'demon': Phaser.Display.Color.HexStringToColor('#F2E6C9').color, // Red
            'neutral': Phaser.Display.Color.HexStringToColor('#7E8662').color, // Green
        }

        const color = colorMap[book_type] || Phaser.Display.Color.HexStringToColor('#FFFFFF').color;

        this.setBounce(0.5);
        this.setFriction(1);
        this.setInteractive();

        this.glow_level = 0;

        if (book_type != BookTypes.Neutral){
            this.glow_map = this.createGlows(this.x, this.y, color);
            this.glow = this.glow_map[this.glow_level];
        }
        
        this.sensor = this.createSensor(this.x, this.y, book_type);
        this.shadow = this.createShadow(this.x, this.y, book_type);
    }

    rotate(degrees) {
        this.setRotation(this.rotation + Phaser.Math.DegToRad(degrees));
    }

    createGlows(x, y, color) {
        const glow_map = {};
        const intensities = [0, 1, 2, 3, 4, 5];

        for (const intensity of intensities) {
            const glow = this.scene.add.graphics({ x, y });
            glow.setDepth(20);
            glow.setBlendMode(Phaser.BlendModes.ADD);

            for (let i = 0; i < 10; i++) {
                const alpha = 0.03 * intensity;
                const offset = i;
                glow.fillStyle(color, alpha);
                glow.fillCircle(0 , 0, 10 * offset)
              }

            glow.setVisible(false);
            glow_map[intensity] = glow;
        }

        return glow_map;
    }

    createSensor(x, y, book_type){
        const sensor = this.scene.matter.add.rectangle(x, y, (this.width * this.scale + 30), (this.height * this.scale + 30), {
            isSensor: true,
        })

        sensor.isSensorBook = true;
        sensor.book_type = book_type;
        sensor.exploded = false;
        sensor.parent_book = this;

        return sensor;
    }

    createShadow(x, y, blur){
        const shadow = this.scene.add.rexQuadImage(x, y, blur)
            .setAlpha(0.1)

        const width = this.width;
        const height = this.height;

        const baseX = x - width/2;
        const baseY = y + height/2;
        const shadowHeight = 30;
        const warp = 30;

        // Top edge (aligned with object bottom)
        shadow.topRight.setPosition(baseX, baseY);
        shadow.topLeft.setPosition(baseX + width, baseY);

        // Bottom edge (pushed down and warped for trapezoid effect on table)
        shadow.bottomRight.setPosition(baseX - warp, baseY + shadowHeight);
        shadow.bottomLeft.setPosition(baseX + width + warp, baseY + shadowHeight);

        this.setDepth(10);
        return shadow;
    }
    
    updateGlow() {
        if (this.glow) {
            this.glow.setPosition(this.x, this.y);
            this.glow.rotation = this.rotation;
        }
    }

    adjustGlow(value) {
        this.glow_level = Phaser.Math.Clamp(this.glow_level + value, 0, 5);
        if (this.glow){
            this.glow.setVisible(false);
            this.glow = this.glow_map[this.glow_level];
            this.glow.setVisible(true);
        }
    }

    updateSensor(){
        if (this.sensor) {
            this.scene.matter.body.setPosition(this.sensor, {x: this.x, y: this.y});
            // this.scene.matter.body.setAngle(this.sensor, this.angle * Phaser.Math.DEG_TO_RAD);
        }
    }

    updateShadow() {
        const tableY = 810;
        const maxShadowY = 850;

        // Early exit if no shadow
        if (!this.shadow) return;

        const { x, y } = this;
        const rayStart = { x, y };
        const localRayEnd = { x, y: y + 1.2 * this.height/2 }; // Cast ray down
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
            if (hit.body === this.body || hit.body.isSensor) {
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
            if (hit.body === this.body || hit.body.isSensor) {
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
            const shadowY = Math.min(maxShadowY, tableY + dist * delta); // Use 2.5 instead of 2 so shadow is a little under the book
        
            this.shadow.setVisible(true);
            this.shadow.setPosition(this.x, shadowY);

            const scaleFactor = 1 - 0.1*delta;

            this.shadow.setScale(scaleFactor);

        } else {
            this.shadow.setVisible(false);
        }
    }
    
    destroy() {
        if (this.sensor){
            this.scene.matter.world.remove(this.sensor);
            this.sensor = null;
        }

        if (this.shadow) {
            this.shadow.destroy();
            this.shadow = null;
        }

        if (this.glow) {
            this.glow.destroy();
            this.glow = null;
        }

        super.destroy();
    }

}
