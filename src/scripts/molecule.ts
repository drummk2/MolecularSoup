/* Represents a molecule in the simulation with a symbolic structure and colour. */
export class Molecule {
    /* Autocatalytic network rules. Each entry: product, reactants, catalyst, energy cost, probability. */
    static autocatalyticRules: Array<{
        product: string;
        reactants: string[];
        catalyst: string;
        energyCost: number;
        probability: number;
    }> = [
        { product: 'AB', reactants: ['A', 'B'], catalyst: 'BC', energyCost: 10, probability: 0.15 },
        { product: 'BC', reactants: ['B', 'C'], catalyst: 'AB', energyCost: 10, probability: 0.15 },
        { product: 'CD', reactants: ['C', 'D'], catalyst: 'DE', energyCost: 12, probability: 0.13 },
        { product: 'DE', reactants: ['D', 'E'], catalyst: 'CD', energyCost: 12, probability: 0.13 },
        {
            product: 'ABC',
            reactants: ['AB', 'C'],
            catalyst: 'BCD',
            energyCost: 15,
            probability: 0.1,
        },
        {
            product: 'BCD',
            reactants: ['BC', 'D'],
            catalyst: 'ABC',
            energyCost: 15,
            probability: 0.1,
        },
        {
            product: 'CDE',
            reactants: ['CD', 'E'],
            catalyst: 'BCD',
            energyCost: 15,
            probability: 0.1,
        },
    ];

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
        D: '#8d99ae',
        E: '#f72585',
        AB: '#f4a261',
        AC: '#f7b267',
        AD: '#f4845f',
        BC: '#e9c46a',
        BD: '#b5ead7',
        BE: '#9d4edd',
        CD: '#b5179e',
        CE: '#43bccd',
        DE: '#7209b7',
        ABC: '#a3c9a8',
        BCD: '#f6bd60',
        CDE: '#43aa8b',
    };

    /* Generate a random molecule from the palette. */
    static randomType(): Molecule {
        const types = Object.keys(Molecule.palette);
        const t = types[Math.floor(Math.random() * types.length)];

        /* Assign a default energy value (could be random or type-based). */
        return new Molecule(t, Molecule.palette[t], 10);
    }

    /* Reaction rules for molecule collisions, with energy changes (deltaE). */
    static reactions: Record<string, Record<string, { result: string; deltaE: number }>> = {
        A: {
            B: { result: 'AB', deltaE: -5 },
            C: { result: 'AC', deltaE: -4 },
            D: { result: 'AD', deltaE: -3 },
        },
        B: {
            C: { result: 'BC', deltaE: 8 },
            D: { result: 'BD', deltaE: -2 },
            E: { result: 'BE', deltaE: -2 },
        },
        C: { D: { result: 'CD', deltaE: 6 }, E: { result: 'CE', deltaE: -1 } },
        AB: { C: { result: 'ABC', deltaE: 10 } },
        BC: { D: { result: 'BCD', deltaE: 12 } },
        CD: { E: { result: 'CDE', deltaE: 14 } }
    };

    /* Check if this molecule can act as a template for replication. Only composite
       molecules (length > 1) can replicate. */
    isTemplate(): boolean {
        return this.structure.length > 1;
    }

    /* Get the required monomers for this template (e.g., 'AB' -> ['A', 'B']). */
    getMonomers(): string[] {
        return this.structure.split('');
    }

    /* Check if this molecule reacts with another and return the resulting molecule. Handles energy transfer. Endothermic reactions (deltaE > 0) require enough combined energy to proceed. */
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

    /* Static method to check if three molecules can undergo an autocatalytic reaction.
       Returns the new molecule if successful, or null. */
    static tryAutocatalysis(m1: Molecule, m2: Molecule, m3: Molecule): Molecule | null {
        const types = [m1.structure, m2.structure, m3.structure];
        for (const rule of Molecule.autocatalyticRules) {
            if (rule.reactants.every((r) => types.includes(r)) && types.includes(rule.catalyst)) {
                /* Find the catalyst molecule. */
                const catalystMol = [m1, m2, m3].find((m) => m.structure === rule.catalyst)!;
                if (catalystMol.energy < rule.energyCost) continue;
                if (Math.random() > rule.probability) continue;

                /* Subtract energy from catalyst. */
                catalystMol.energy -= rule.energyCost;
                
                /* Create the product molecule. */
                const newMol = new Molecule(rule.product, Molecule.palette[rule.product], 10);
                newMol.reacting = 5;
                return newMol;
            }
        }
        return null;
    }

    /* Static method to check if three molecules can replicate via template-based mechanism.
       Returns the new molecule if successful, or null. */
    static tryReplicate(
        template: Molecule,
        m1: Molecule,
        m2: Molecule,
        energyCost: number,
        probability: number = 0.1
    ): Molecule | null {
        /* Only composite molecules can be templates. */
        if (!template.isTemplate()) return null;

        const monomers = template.getMonomers();
        const types = [m1.structure, m2.structure];
        /* Check if both required monomers are present (order-insensitive). */
        if (!monomers.every((m) => types.includes(m))) return null;

        /* Require enough energy for replication. */
        if (template.energy < energyCost) return null;

        /* Replication is probabilistic. */
        if (Math.random() > probability) return null;

        /* Subtract energy cost from template. */
        template.energy -= energyCost;

        /* Create a new molecule of the same type, with default energy. */
        const newMol = new Molecule(template.structure, template.colour, 10);
        newMol.reacting = 5;
        return newMol;
    }
}
