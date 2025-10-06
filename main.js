import { Simulation } from './simulation';
import { Particle } from './particle';
import { Molecule } from './molecule';
/* Get the canvas element from the DOM. */
const canvas = document.getElementById('canvas');
/* Get the 2D rendering context of the canvas. */
const ctx = canvas.getContext('2d');
/* Set canvas width and height to fill the window. */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
/* Create a new simulation instance. */
const sim = new Simulation(ctx, canvas.width, canvas.height);
/* Function to initialise particles and molecules. */
function initParticles(count) {
    sim.particles = [];
    sim.molecules = [];
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const vx = (Math.random() - 0.5) * 2;
        const vy = (Math.random() - 0.5) * 2;
        const p = new Particle(x, y, vx, vy);
        const m = Molecule.randomType();
        sim.addParticle(p, m);
    }
}
/* Read particle count from input. */
const countInput = document.getElementById('count');
initParticles(parseInt(countInput.value));
/* Animation loop: update and draw the simulation each frame. */
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    sim.update();
    sim.draw();
}
/* Start/Pause button from DOM. */
const startBtn = document.getElementById('startPause');
/* Toggle simulation on button click. */
let running = false;
startBtn.addEventListener('click', () => {
    if (!running) {
        /* Always re-initialise particles with the current count before starting. */
        initParticles(parseInt(countInput.value));
        animate();
        startBtn.textContent = 'Pause';
    }
    else {
        cancelAnimationFrame(animationId);
        startBtn.textContent = 'Start';
    }
    running = !running;
});
/* Reset button from DOM. */
const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', () => {
    cancelAnimationFrame(animationId);
    running = false;
    startBtn.textContent = 'Start';
    initParticles(parseInt(countInput.value));
    sim.draw();
});
