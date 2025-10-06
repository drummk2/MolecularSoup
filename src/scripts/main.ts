import { Simulation } from './simulation';
import { Particle } from './particle';
import { Molecule } from './molecule';

/** Get the canvas element from the DOM. */
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

/** Get the 2D rendering context of the canvas. */
const ctx = canvas.getContext('2d')!;

/** Set canvas width and height to fill the window. */
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/** Create a new simulation instance. */
const sim = new Simulation(ctx, canvas.width, canvas.height);

/** Initialize particles and molecules. */
for (let i = 0; i < 50; i++) {
    /** Random x-coordinate. */
    const x = Math.random() * canvas.width;

    /** Random y-coordinate. */
    const y = Math.random() * canvas.height;

    /** Random horizontal velocity. */
    const vx = (Math.random() - 0.5) * 2;

    /** Random vertical velocity. */
    const vy = (Math.random() - 0.5) * 2;

    /** Create a new particle with position and velocity. */
    const p = new Particle(x, y, vx, vy);

    /** Create a random molecule from the palette. */
    const m = Molecule.randomType();

    /** Add the particle and molecule to the simulation. */
    sim.addParticle(p, m);
}

/** Animation loop: update and draw the simulation each frame. */
function animate() {
    requestAnimationFrame(animate);
    sim.update();
    sim.draw();
}

/** Start the animation loop. */
animate();
