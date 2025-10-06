import { Particle } from './particle';
import { Molecule } from './molecule';
/* Manages the simulation of particles and molecules. */
export class Simulation {
    /* Initialise the simulation with a canvas context and dimensions. */
    constructor(ctx, width, height) {
        /* Array of particles in the simulation. */
        this.particles = [];
        /* Array of molecules corresponding to each particle. */
        this.molecules = [];
        /* Active reaction rings in the simulation. */
        this.reactionRings = [];
        /* Pool of reusable reaction rings. */
        this.ringPool = [];
        /* Grid for spatial partitioning (collision optimisation). */
        this.grid = new Map();
        /* Grid cell size. */
        this.cellSize = 50;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }
    /* Add a particle and its associated molecule to the simulation. */
    addParticle(p, m) {
        this.particles.push(p);
        this.molecules.push(m);
    }
    /* Get grid cell key for coordinates. */
    getCellKey(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return `${col},${row}`;
    }
    /* Update all particles by moving them, handling collisions, and boundary bounces. */
    update() {
        this.grid.clear();
        /* Move and bounce particles. */
        this.particles.forEach((p, i) => {
            p.move();
            p.bounce(this.width, this.height);
            /* Assign particle to grid cell. */
            const key = this.getCellKey(p.x, p.y);
            if (!this.grid.has(key))
                this.grid.set(key, []);
            this.grid.get(key).push(i);
        });
        const radiusSq = 24 * 24;
        /* Check collisions and template-based replication within grid cells. */
        this.grid.forEach((indices) => {
            /* First, check for three-body autocatalytic reactions. */
            for (let i = 0; i < indices.length; i++) {
                for (let j = 0; j < indices.length; j++) {
                    for (let k = 0; k < indices.length; k++) {
                        if (i !== j && i !== k && j < k) {
                            const idx1 = indices[i];
                            const idx2 = indices[j];
                            const idx3 = indices[k];
                            const m1 = this.molecules[idx1];
                            const m2 = this.molecules[idx2];
                            const m3 = this.molecules[idx3];
                            const p1 = this.particles[idx1];
                            const p2 = this.particles[idx2];
                            const p3 = this.particles[idx3];
                            /* All must be close enough. */
                            const d12 = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
                            const d13 = (p1.x - p3.x) ** 2 + (p1.y - p3.y) ** 2;
                            const d23 = (p2.x - p3.x) ** 2 + (p2.y - p3.y) ** 2;
                            if (d12 < radiusSq && d13 < radiusSq && d23 < radiusSq) {
                                /* Try autocatalytic reaction. */
                                const newMol = Molecule.tryAutocatalysis(m1, m2, m3);
                                if (newMol) {
                                    /* Place new molecule at the average position. */
                                    const avgX = (p1.x + p2.x + p3.x) / 3;
                                    const avgY = (p1.y + p2.y + p3.y) / 3;
                                    const newParticle = new Particle(avgX, avgY, Math.random() * 2 - 1, Math.random() * 2 - 1);
                                    this.particles.push(newParticle);
                                    this.molecules.push(newMol);
                                    /* Visualise autocatalysis with a ring. */
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
                                    ring.x = avgX;
                                    ring.y = avgY;
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
                        }
                        else {
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
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        /* Draw reaction rings. */
        this.reactionRings.forEach((ring, index) => {
            if (!ring.active)
                return;
            this.ctx.beginPath();
            this.ctx.arc(ring.x, ring.y, ring.radius, 0, 2 * Math.PI);
            this.ctx.strokeStyle = `rgba(255, 255, 0, ${ring.alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            ring.radius += 1.5;
            ring.alpha -= 0.03;
            if (ring.alpha <= 0)
                ring.active = false;
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
            }
            else {
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
