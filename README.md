# Quiz Showdown

A two-team, Jeopardy-style quiz game for the classroom. Pick a tile, run the timer, reveal the answer, and award the points.

## Run it locally

You need [Node.js](https://nodejs.org/) 18 or newer.

```sh
npm install
npm run dev
```

The game opens at <http://localhost:8080>.

To build a production copy and serve it locally:

```sh
npm run build
npm run preview
```

The built files in `dist/` are plain static files, so you can also open them from any static web server.

## How to play

1. Click a team name on the scoreboard to rename it.
2. Pick a tile, choose a timer length, and press **Start**.
3. When time runs out (or you press **Reveal Answer**), the answer is shown.
4. Pick who answered correctly. The winning team gains the tile's points and the other team loses them.
   **Both correct** gives both teams the points; **Neither** gives none.

Progress is saved in the browser, so refreshing the page doesn't lose the game.
Use **Undo** to take back the last scored question, and **Reset Game** to start over.

### Keyboard shortcuts

| Screen | Keys |
| --- | --- |
| Timer setup | `Enter` start · `Esc` back |
| Question | `Space` pause/resume · `+` add 10 seconds · `Enter` reveal answer, then go to scoring |
| Scoring | `1` team 1 · `2` team 2 · `B` both · `N` neither · `Enter` continue |

## Editing the questions

All categories, questions and answers live in [`src/data/gameData.ts`](src/data/gameData.ts).
Each category needs one question for each value in `POINT_VALUES`. The board resizes itself to however many categories you add.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the tests |

Built with Vite, React, TypeScript, Tailwind CSS and Framer Motion.
