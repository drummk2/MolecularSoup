import { Particle } from './particle';
import { Molecule } from './molecule';

/* Represents a temporary visual effect for reactions. */
interface ReactionRing {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
}

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

    /* Active reaction rings in the simulation. */
    reactionRings: ReactionRing[] = [];

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
        this.particles.forEach(p => {
            p.move();
            p.bounce(this.width, this.height);
        });

        /* Check collisions between particles and apply reactions. */
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                /* Collision radius of 24. */
                if (distance < 24) {
                    const reactionResult = this.molecules[i].react(this.molecules[j]);
                    if (reactionResult) {
                        /* Replace first molecule with reaction result and flash. */
                        this.molecules[i] = reactionResult;

                        /* Add a reaction ring effect at this location. */
                        this.reactionRings.push({
                            x: this.particles[i].x,
                            y: this.particles[i].y,
                            radius: 12,
                            maxRadius: 30,
                            alpha: 0.6
                        });

                        /* Remove the second particle/molecule. */
                        this.particles.splice(j, 1);
                        this.molecules.splice(j, 1);
                        j--; /* Adjust index after removal. */
                    }
                }
            }
        }
    }

    /* Draw all molecules as colored circles with letters and reaction flash/rings. */
    draw(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);

        /* Draw reaction rings. */
        this.reactionRings.forEach((ring, index) => {
            this.ctx.beginPath();
            this.ctx.arc(ring.x, ring.y, ring.radius, 0, 2 * Math.PI);
            this.ctx.strokeStyle = `rgba(255, 255, 0, ${ring.alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            /* Update ring properties. */
            ring.radius += 1.5;
            ring.alpha -= 0.03;

            /* Remove ring if fully faded. */
            if (ring.alpha <= 0) {
                this.reactionRings.splice(index, 1);
            }
        });

        /* Draw particles. */
        this.particles.forEach((p, i) => {
            const m = this.molecules[i];

            /* Flash white if reacting. */
            if (m.reacting && m.reacting > 0) {
                this.ctx.fillStyle = 'white';
                m.reacting--;
            } else {
                this.ctx.fillStyle = m.color;
            }

            /* Draw circle. */
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
            this.ctx.fill();

            /* Draw molecule letter on top. */
            this.ctx.fillStyle = 'black';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(m.structure, p.x, p.y);
        });
    }
}
