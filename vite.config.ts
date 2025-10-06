import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    base: '/MolecularSoup/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
});
