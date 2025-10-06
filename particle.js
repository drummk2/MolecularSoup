/* Represents a particle with position and velocity in 2D space. */
export class Particle {
    /* Initialise particle with position and velocity. */
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
    /* Move particle according to its velocity. */
    move() {
        this.x += this.vx;
        this.y += this.vy;
    }
    /* Bounce particle off the canvas edges with given width and height. */
    bounce(width, height) {
        if (this.x <= 0 || this.x >= width)
            this.vx *= -1;
        if (this.y <= 0 || this.y >= height)
            this.vy *= -1;
    }
}
