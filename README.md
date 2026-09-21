# Quantum Chess

[Español](README.es.md)

A browser-based chess experiment that introduces probabilistic “quantum” moves. It is an educational game prototype, not a physical quantum simulation.

## Problem

Classical chess is deterministic. This project explores how uncertainty changes tactical decisions while keeping the familiar board and pieces.

## Solution

Players may make normal moves or place an eligible piece in a two-square superposition. Measurement collapses it to one square, introducing controlled randomness into captures and positioning.

## Features

- Classical and quantum move modes
- Two-position superposition for eligible pieces
- Voluntary and interaction-triggered measurement
- React and TypeScript interface
- Fully local execution

## Architecture

- `App.tsx`: game state and turn flow
- `components/`: board, squares, and pieces
- `utils/chessLogic.ts`: move validation and chess rules
- `types.ts`: shared domain types

## Installation

Use Node.js 20.19.0 or newer, matching the current Vite/React toolchain.

```bash
git clone https://github.com/vincimech010233/Quantum-Chess.git
cd Quantum-Chess
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Limitations

This is a prototype. The quantum rules are a game mechanic and do not model a real quantum computer. Automated tests and complete chess-rule coverage are future work.

## License

No license has been selected yet. All rights are reserved until a license is added.
