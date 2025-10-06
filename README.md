# MolecularSoup

**MolecularSoup** is a browser-based simulation written in **TypeScript** that explores the fundamentals of **artificial chemistry (AChem)** — a field concerned with how life-like and self-organising behaviours can emerge from simple, rule-based interactions.

This project simulates a "digital soup" of abstract molecules that move, collide, and eventually react — serving as a foundation for studying emergence, self-replication, and autocatalysis.

If you'd like to see a running version, just click [here](https://drummk2.github.io/MolecularSoup/)!

## Overview

In **MolecularSoup**, each molecule is represented as a symbolic structure (e.g. `"A"`, `"B"`, `"AB"`) moving through a virtual environment. Over time, molecules:
- Move randomly in 2D space.
- Bounce off boundaries and one another.
- React and form new compounds.

The simulation visualises this process using the HTML5 `<canvas>` element, allowing an intuitive, interactive way to observe the evolution of simple artificial chemical systems.

## Motivation

The goal of MolecularSoup is to create a minimal, extensible framework for **exploring emergent behaviour** in artificial systems.  
Long-term ambitions include:
- Modeling **autocatalytic networks**.
- Simulating **energy flow** and **reaction thermodynamics**.
- Investigating **self-replicating molecules**.
- Connecting to ideas in **origins-of-life** and **artificial life (ALife)** research.

## Technologies

- **TypeScript** — core language.
- **Vite** — development bundler and dev server.
- **HTML5 Canvas** — real-time visualisation.

## Roadmap

| Version  | Feature          | Description |
|----------|-----------------|-------------|
| **v0.1** ✅ | Basic motion    | Molecules move randomly and bounce within a 2D space. |
| **v0.2** ✅ | Reactions       | Implement symbolic reaction rules (e.g., A + B → AB). |
| **v0.3** ✅ | Energy system   | Introduce energy absorption and release for reactions. |
| **v0.4** ✅ | Replication     | Allow molecules to replicate under certain conditions. |
| **v0.5** ✅ | Autocatalysis   | Model self-sustaining reaction networks. |
| **v0.6** | TBD   | TBD |

## Glossary of AChem & Chemistry Terms
This section explains key terms from artificial chemistry (AChem) and chemistry as used in this project:

- **Artificial Chemistry (AChem):** A computational framework for simulating chemical-like systems using abstract rules and symbolic molecules, often to study emergent or life-like behaviors.
- **Molecule:** In this simulation, a symbolic entity (e.g. "A", "B", "AB") that can move, collide, and react with others.
- **Particle:** The physical representation of a molecule in 2D space, with position and velocity.
- **Reaction:** A rule-based transformation where two molecules interact to form a new molecule, possibly absorbing or releasing energy.
- **Energy:** A numerical property assigned to molecules, used to determine if reactions can occur and to simulate thermodynamic effects (e.g. energy absorption or release).
- **Endothermic Reaction:** A reaction that requires energy input (energy is absorbed; only occurs if enough energy is available).
- **Exothermic Reaction:** A reaction that releases energy (energy is produced and added to the resulting molecule).
- **Autocatalysis:** A process where a molecule or set of molecules catalyzes its own production, leading to self-sustaining reaction networks.
- **Emergence:** The appearance of complex behaviors or patterns from simple rules and interactions.
- **Self-replication:** The ability of a molecule or structure to produce copies of itself, a key property in origins-of-life research.
