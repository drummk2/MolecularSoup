/* Represents a molecule in the simulation with a symbolic structure and colour. */
export class Molecule {
    /* Symbolic structure of the molecule, e.g., "A", "B", "AB". */
    structure: string;

    /* Display colour of the molecule. */
    colour: string;

    /* Number of frames left to flash when reacting. */
    reacting?: number;

    /* Energy level of the molecule. */
    energy: number;

    /* Initialise the molecule with a structure, colour, and optional energy. */
    constructor(structure: string, colour: string, energy: number = 0) {
        this.structure = structure;
        this.colour = colour;
        this.energy = energy;
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

        // Assign a default energy value (could be random or type-based)
        return new Molecule(t, Molecule.palette[t], 10);
    }

    /* Reaction rules for molecule collisions, with energy changes (deltaE). */
    static reactions: Record<string, Record<string, { result: string; deltaE: number }>> = {
        A: { B: { result: 'AB', deltaE: -5 } }, // A + B -> AB, releases 5 energy
        B: { C: { result: 'BC', deltaE: 8 } }, // B + C -> BC, absorbs 8 energy
    };

    /* Check if this molecule reacts with another and return the resulting molecule.
       Handles energy transfer. Endothermic reactions (deltaE > 0) require enough
       combined energy to proceed. */
    react(other: Molecule): Molecule | null {
        const reaction = Molecule.reactions[this.structure]?.[other.structure];
        if (reaction) {
            const { result, deltaE } = reaction;
            const combinedEnergy = this.energy + other.energy;

            /* For endothermic reactions, require enough energy to react. */
            if (deltaE > 0 && combinedEnergy < deltaE) {
                return null; /* Not enough energy to react. */
            }

            /* Energy accounting: subtract required energy for endothermic, add for exothermic. */
            const totalEnergy = combinedEnergy + deltaE;
            const newMolecule = new Molecule(result, Molecule.palette[result], totalEnergy);
            newMolecule.reacting = 5; /* Flash for 5 frames. */

            return newMolecule;
        }

        return null;
    }
}
