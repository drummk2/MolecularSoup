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

        /* Check collisions and template-based replication within grid cells. */
        this.grid.forEach((indices) => {
            /* First, check for three-body template-based replication. */
            for (let i = 0; i < indices.length; i++) {
                for (let j = 0; j < indices.length; j++) {
                    for (let k = 0; k < indices.length; k++) {
                        if (i !== j && i !== k && j < k) {
                            const idxT = indices[i];
                            const idxM1 = indices[j];
                            const idxM2 = indices[k];
                            const t = this.molecules[idxT];
                            const m1 = this.molecules[idxM1];
                            const m2 = this.molecules[idxM2];
                            const pT = this.particles[idxT];
                            const pM1 = this.particles[idxM1];
                            const pM2 = this.particles[idxM2];

                            /* All must be close enough. */
                            const d1 = (pT.x - pM1.x) ** 2 + (pT.y - pM1.y) ** 2;
                            const d2 = (pT.x - pM2.x) ** 2 + (pT.y - pM2.y) ** 2;

                            if (d1 < radiusSq && d2 < radiusSq) {
                                /* Try to replicate. */
                                const newMol = Molecule.tryReplicate(t, m1, m2, 10, 0.1);

                                if (newMol) {
                                    /* Place new molecule at template's position. */
                                    const newParticle = new Particle(
                                        pT.x,
                                        pT.y,
                                        Math.random() * 2 - 1,
                                        Math.random() * 2 - 1
                                    );
                                    this.particles.push(newParticle);
                                    this.molecules.push(newMol);

                                    /* Visualise replication with a ring. */
                                    let ring = this.ringPool.find((r) => !r.active);
                                    if (!ring) {
                                        ring = {
                                            x: 0,
                                            y: 0,
                                            radius: 12,
                                            maxRadius: 30,
                                            alpha: 0.6,
                                            active: true,
                                        };
                                        this.ringPool.push(ring);
                                    }

                                    ring.x = pT.x;
                                    ring.y = pT.y;
                                    ring.radius = 12;
                                    ring.alpha = 0.6;
                                    ring.active = true;
                                    this.reactionRings.push(ring);
                                }
                            }
                        }
                    }
                }
            }

            /* Then, check for pairwise collisions and reactions as before. */
            for (let i = 0; i < indices.length; i++) {
                for (let j = i + 1; j < indices.length; j++) {
                    const idx1 = indices[i];
                    const idx2 = indices[j];

                    const dx = this.particles[idx1].x - this.particles[idx2].x;
                    const dy = this.particles[idx1].y - this.particles[idx2].y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < radiusSq) {
                        /* Attempt reaction between molecules, including energy transfer. */
                        const reactionResult = this.molecules[idx1].react(this.molecules[idx2]);
                        if (reactionResult) {
                            this.molecules[idx1] = reactionResult;

                            /* Visualise reaction with a ring. */
                            let ring = this.ringPool.find((r) => !r.active);
                            if (!ring) {
                                ring = {
                                    x: 0,
                                    y: 0,
                                    radius: 12,
                                    maxRadius: 30,
                                    alpha: 0.6,
                                    active: true,
                                };
                                this.ringPool.push(ring);
                            }
                            ring.x = this.particles[idx1].x;
                            ring.y = this.particles[idx1].y;
                            ring.radius = 12;
                            ring.alpha = 0.6;
                            ring.active = true;
                            this.reactionRings.push(ring);

                            /* Remove the second particle/molecule after reaction. */
                            this.particles.splice(idx2, 1);
                            this.molecules.splice(idx2, 1);
                            indices.splice(j, 1);
                            j--;
                        } else {
                            /* No reaction: exchange a small amount of energy. */
                            const m1 = this.molecules[idx1];
                            const m2 = this.molecules[idx2];

                            /* Amount of energy to transfer (randomly up to 2 units). */
                            const transfer = Math.min(m1.energy, Math.random() * 2);
                            m1.energy -= transfer;
                            m2.energy += transfer;

                            /* Simple elastic collision: swap velocities to prevent passing through. */
                            const p1 = this.particles[idx1];
                            const p2 = this.particles[idx2];
                            const tempVx = p1.vx;
                            const tempVy = p1.vy;
                            p1.vx = p2.vx;
                            p1.vy = p2.vy;
                            p2.vx = tempVx;
                            p2.vy = tempVy;
                        }
                    }
                }
            }
        });
    }

    /* Draw all molecules as coloured circles with letters and reaction flash/rings. */
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
                this.ctx.fillStyle = m.colour;
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
