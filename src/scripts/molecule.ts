/* Represents a molecule in the simulation with a symbolic structure and colour. */
export class Molecule {
    /* Symbolic structure of the molecule, e.g., "A", "B", "AB". */
    structure: string;

    /* Display colour of the molecule. */
    colour: string;

    /* Number of frames left to flash when reacting. */
    reacting?: number;

    /* Initialise the molecule with a structure and colour. */
    constructor(structure: string, colour: string) {
        this.structure = structure;
        this.colour = colour;
        this.reacting = 0;
    }

    /* Predefined colour palette for molecule types. */
    static palette: Record<string, string> = {
        A: '#e63946',
        B: '#457b9d',
        C: '#2a9d8f',
        AB: '#f4a261',
        BC: '#e9c46a',
    };

    /* Generate a random molecule from the palette. */
    static randomType(): Molecule {
        const types = Object.keys(Molecule.palette);
        const t = types[Math.floor(Math.random() * types.length)];
        return new Molecule(t, Molecule.palette[t]);
    }

    /* Reaction rules for molecule collisions. */
    static reactions: Record<string, Record<string, string>> = {
        A: { B: 'AB' },
        B: { C: 'BC' },
    };

    /* Check if this molecule reacts with another and return the resulting molecule. */
    react(other: Molecule): Molecule | null {
        const resultType = Molecule.reactions[this.structure]?.[other.structure];
        if (resultType) {
            const newMolecule = new Molecule(resultType, Molecule.palette[resultType]);
            newMolecule.reacting = 5; /* Flash for 5 frames. */
            return newMolecule;
        }
        return null;
    }
}
