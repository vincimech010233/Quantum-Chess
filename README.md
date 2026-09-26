# Quantum Chess

[Español](README.es.md)

A browser-based chess experiment with probabilistic moves. It is an educational game prototype, not a physical quantum simulation or a complete chess engine.

## Rules and scope

- Ordinary moves use the piece movement patterns implemented in `utils/chessLogic.ts`. Capturing removes the opposing piece. Capturing a king ends the game.
- A non-king piece can split into two **distinct, empty** reachable squares. Splitting does not capture; a piece in superposition must be measured before it moves again.
- Clicking your own quantum piece measures it into one of its two squares and ends the turn.
- Attacking an opposing quantum piece measures it first. If it remains at the target it is removed; otherwise it survives at its other square. The attacker moves to the selected target in either outcome.
- Measurements choose either branch with equal probability using `Math.random()`. This is a game mechanic.
- There is no check/checkmate enforcement, castling, en passant or promotion. Pawns reaching the last rank remain there and cannot advance further.

## State guarantees and tests

Coordinates must be integers from 0 to 7, IDs must be unique, and each square can contain only one piece, including all superposition branches. A piece has one position or two distinct positions; kings cannot split. Invalid transitions return the original board without mutation. These invariants describe representable states, not full chess legality.

The pure move, split and measurement functions share a small state validator. The React UI uses those functions and cancels pending animations on reset or unmount. Regression tests cover pawn edges, ordinary/quantum captures, friendly occupancy, invalid input, immutable updates and state uniqueness. Tests also check move bounds for every piece type, colour and starting square.

## Reproducible setup

Use Node.js 22.12+ within the 22.x series, or Node.js 24+. The manifest declares the same supported range; CI uses Node.js 22.

```bash
git clone https://github.com/vincimech010233/Quantum-Chess.git
cd Quantum-Chess
npm ci
npm test
npm run typecheck
npm run build
npm audit
npm run dev
```

Open `http://127.0.0.1:3000`. To inspect the built application, run `npm run preview` and use the local URL it prints. Both servers bind to loopback by default.

Installation requires access to the npm registry. After installation, the build and application use local dependencies: Tailwind is compiled into CSS and React is bundled by Vite. There are no runtime CDN resources, accounts, API calls, Gemini integration or API keys. Serve the generated `dist/` directory locally; opening its HTML directly with `file://` is not supported. No service worker or offline installation feature is provided.

## Architecture

- `App.tsx`: selection, turns and animation lifecycle
- `components/`: board and piece rendering
- `utils/chessLogic.ts`: movement patterns and validated state transitions
- `types.ts`: domain types
- `index.css` and `tailwind.config.js`: local utility styles and existing animations

GitHub Actions runs a clean install, tests, a separate TypeScript check, build and dependency audit. The lockfile is committed; generated `dist/`, dependency installations, local environment files and test artifacts are ignored. Do not add credentials or environment secrets.

## Limitations and provenance

This prototype has no AI, backend, multiplayer, persistent games or complete chess-rule validation. Passing regression tests does not constitute a formal proof or a simulation of quantum physics.

Repository-wide provenance remains unverified, including the preexisting inline SVG piece drawings in `components/ChessPiece.tsx` and scaffold/template code. These assets are unchanged by the repair, are not claimed as original work, and are not relicensed. No repository-wide license has been selected. Dependencies retain their own licenses.
