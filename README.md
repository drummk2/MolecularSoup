# 🧪 MolecularSoup

**MolecularSoup** is a browser-based simulation written in **TypeScript** that explores the fundamentals of **artificial chemistry (AChem)** — a field concerned with how life-like and self-organising behaviours can emerge from simple, rule-based interactions.

This project simulates a "digital soup" of abstract molecules that move, collide, and eventually react — serving as a foundation for studying emergence, self-replication, and autocatalysis.

## 🧩 Overview

In **MolecularSoup**, each molecule is represented as a symbolic structure (e.g. `"A"`, `"B"`, `"AB"`) moving through a virtual environment. Over time, molecules:
- Move randomly in 2D space.
- Bounce off boundaries and one another.
- (In later versions) React and form new compounds.

The simulation visualises this process using the HTML5 `<canvas>` element, allowing an intuitive, interactive way to observe the evolution of simple artificial chemical systems.

## 🧠 Motivation

The goal of MolecularSoup is to create a minimal, extensible framework for **exploring emergent behaviour** in artificial systems.  
Long-term ambitions include:
- Modeling **autocatalytic networks**.
- Simulating **energy flow** and **reaction thermodynamics**.
- Investigating **self-replicating molecules**.
- Connecting to ideas in **origins-of-life** and **artificial life (ALife)** research.

## 🌐 Technologies
- **TypeScript** — core language.
- **Vite** — development bundler and dev server.
- **HTML5 Canvas** — real-time visualisation.

## 🚀 Roadmap

| Version  | Feature          | Description |
|----------|-----------------|-------------|
| **v0.1** ✅ | Basic motion    | Molecules move randomly and bounce within a 2D space. |
| **v0.2** ✅ | Reactions       | Implement symbolic reaction rules (e.g., A + B → AB). |
| **v0.3** ✅ | Energy system   | Introduce energy absorption and release for reactions. |
| **v0.4** | Replication     | Allow molecules to replicate under certain conditions. |
| **v1.0** | Autocatalysis   | Model self-sustaining reaction networks. |
