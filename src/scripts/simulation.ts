import { Particle } from './particle';
import { Molecule } from './molecule';

/** Manages the simulation of particles and molecules. */
export class Simulation {
    /** Array of particles in the simulation. */
    particles: Particle[] = [];

    /** Array of molecules corresponding to each particle. */
    molecules: Molecule[] = [];

    /** Canvas rendering context. */
    ctx: CanvasRenderingContext2D;

    /** Width of the canvas. */
    width: number;

    /** Height of the canvas. */
    height: number;

    /** Initialize the simulation with a canvas context and its dimensions. */
    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    /** Add a particle and its associated molecule to the simulation. */
    addParticle(p: Particle, m: Molecule): void {
        this.particles.push(p);
        this.molecules.push(m);
    }

    /** Update all particles by moving them and handling boundary collisions. */
    update(): void {
        this.particles.forEach((p) => {
            p.move();
            p.bounce(this.width, this.height);
        });
    }

    /** Draw all molecules as colored circles on the canvas. */
    draw(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.particles.forEach((p, i) => {
            const m = this.molecules[i];
            this.ctx.fillStyle = m.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }
}
