/** Represents a molecule in the simulation with a symbolic structure and color. */
export class Molecule {
    /** Symbolic structure of the molecule, e.g., "A", "B", "AB". */
    structure: string;

    /** Display color of the molecule. */
    color: string;

    /** Initialize the molecule with a structure and color. */
    constructor(structure: string, color: string) {
        this.structure = structure;
        this.color = color;
    }

    /** Predefined color palette for molecule types. */
    static palette: Record<string, string> = {
        A: '#e63946',
        B: '#457b9d',
        C: '#2a9d8f',
    };

    /** Generate a random molecule from the palette. */
    static randomType(): Molecule {
        const types = Object.keys(Molecule.palette);
        const t = types[Math.floor(Math.random() * types.length)];
        return new Molecule(t, Molecule.palette[t]);
    }
}
