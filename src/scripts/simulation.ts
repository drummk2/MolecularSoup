import { Particle } from './particle';
import { Molecule } from './molecule';

/* Manages the simulation of particles and molecules. */
export class Simulation {
    /* Array of particles in the simulation. */
    particles: Particle[] = [];

    /* Array of molecules corresponding to each particle. */
    molecules: Molecule[] = [];

    /* Canvas rendering context. */
    ctx: CanvasRenderingContext2D;

    /* Width of the canvas. */
    width: number;

    /* Height of the canvas. */
    height: number;

    /* Initialise the simulation with a canvas context and dimensions. */
    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    /* Add a particle and its associated molecule to the simulation. */
    addParticle(p: Particle, m: Molecule): void {
        this.particles.push(p);
        this.molecules.push(m);
    }

    /* Update all particles by moving them, handling collisions, and boundary bounces. */
    update(): void {
        /* Move and bounce particles. */
        this.particles.forEach((p) => {
            p.move();
            p.bounce(this.width, this.height);
        });

        /* Check collisions between particles and apply reactions. */
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                /* Simple collision radius of 24. */
                if (distance < 24) {
                    const reactionResult = this.molecules[i].react(this.molecules[j]);
                    if (reactionResult) {
                        /* Replace first molecule with reaction result. */
                        this.molecules[i] = reactionResult;

                        /* Remove the second particle/molecule. */
                        this.particles.splice(j, 1);
                        this.molecules.splice(j, 1);
                        j--; /* Adjust index after removal. */
                    }
                }
            }
        }
    }

    /* Draw all molecules as colored circles with letters. */
    draw(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.particles.forEach((p, i) => {
            const m = this.molecules[i];

            /* Draw circle. */
            this.ctx.fillStyle = m.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
            this.ctx.fill();

            /* Draw molecule letter on top. */
            this.ctx.fillStyle = 'white';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(m.structure, p.x, p.y);
        });
    }
}
