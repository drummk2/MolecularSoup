import { Particle } from './particle';
import { Molecule } from './molecule';

/* Represents a temporary visual effect for reactions. */
interface ReactionRing {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
    active: boolean;
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

    /* Pool of reusable reaction rings. */
    ringPool: ReactionRing[] = [];

    /* Grid for spatial partitioning (collision optimisation). */
    grid: Map<string, number[]> = new Map();

    /* Grid cell size. */
    cellSize = 50;

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

    /* Get grid cell key for coordinates. */
    private getCellKey(x: number, y: number): string {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return `${col},${row}`;
    }

    /* Update all particles by moving them, handling collisions, and boundary bounces. */
    update(): void {
        this.grid.clear();

        /* Move and bounce particles. */
        this.particles.forEach((p, i) => {
            p.move();
            p.bounce(this.width, this.height);

            /* Assign particle to grid cell. */
            const key = this.getCellKey(p.x, p.y);
            if (!this.grid.has(key)) this.grid.set(key, []);
            this.grid.get(key)!.push(i);
        });

        const radiusSq = 24 * 24;

        /* Check collisions within grid cells. */
        this.grid.forEach(indices => {
            for (let i = 0; i < indices.length; i++) {
                for (let j = i + 1; j < indices.length; j++) {
                    const idx1 = indices[i];
                    const idx2 = indices[j];

                    const dx = this.particles[idx1].x - this.particles[idx2].x;
                    const dy = this.particles[idx1].y - this.particles[idx2].y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < radiusSq) {
                        const reactionResult = this.molecules[idx1].react(this.molecules[idx2]);
                        if (reactionResult) {
                            this.molecules[idx1] = reactionResult;

                            /* Get a ring from pool or create new. */
                            let ring = this.ringPool.find(r => !r.active);
                            if (!ring) {
                                ring = { x: 0, y: 0, radius: 12, maxRadius: 30, alpha: 0.6, active: true };
                                this.ringPool.push(ring);
                            }
                            ring.x = this.particles[idx1].x;
                            ring.y = this.particles[idx1].y;
                            ring.radius = 12;
                            ring.alpha = 0.6;
                            ring.active = true;
                            this.reactionRings.push(ring);

                            /* Remove the second particle/molecule. */
                            this.particles.splice(idx2, 1);
                            this.molecules.splice(idx2, 1);
                            indices.splice(j, 1);
                            j--;
                        }
                    }
                }
            }
        });
    }

    /* Draw all molecules as colored circles with letters and reaction flash/rings. */
    draw(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);

        /* Draw reaction rings. */
        this.reactionRings.forEach((ring, index) => {
            if (!ring.active) return;

            this.ctx.beginPath();
            this.ctx.arc(ring.x, ring.y, ring.radius, 0, 2 * Math.PI);
            this.ctx.strokeStyle = `rgba(255, 255, 0, ${ring.alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            ring.radius += 1.5;
            ring.alpha -= 0.03;

            if (ring.alpha <= 0) ring.active = false;
        });

        /* Pre-set font and lineWidth for all particles. */
        this.ctx.lineWidth = 2;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

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
            this.ctx.fillText(m.structure, p.x, p.y);
        });
    }
}
