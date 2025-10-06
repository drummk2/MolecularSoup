/** Represents a particle with position and velocity in 2D space. */
export class Particle {
    /** X-coordinate of the particle. */
    x: number;

    /** Y-coordinate of the particle. */
    y: number;

    /** Horizontal speed of the particle. */
    vx: number;

    /** Vertical speed of the particle. */
    vy: number;

    /** Initialize particle with position and velocity. */
    constructor(x: number, y: number, vx: number, vy: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }

    /** Move particle according to its velocity. */
    move(): void {
        this.x += this.vx;
        this.y += this.vy;
    }

    /** Bounce particle off the canvas edges with given width and height. */
    bounce(width: number, height: number): void {
        if (this.x <= 0 || this.x >= width) this.vx *= -1;
        if (this.y <= 0 || this.y >= height) this.vy *= -1;
    }
}
