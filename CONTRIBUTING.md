# Contributing

Welcome! This project is for fun — you can play, learn, and help make it better.

You **don’t need to install anything** to explore or make small changes.
You can edit right in your browser on GitHub or open it instantly in **`.dev`** (the GitHub web IDE).
Automatic actions will check, build, and publish updates when you commit or open a pull request.

To **run or test the game locally**, see setup instructions below.

---

## Quick Start: Make Edits Online

1. Go to **[github.com/denisecase/rockfit](https://github.com/denisecase/rockfit)**.
2. Click **Fork** (this makes your own copy).
3. Click **.`** (period key) or open **`https://github.dev/denisecase/rockfit`** and the project will open in VS Code for the web.
4. Make small text, color, or label changes in the browser.
5. Commit your changes. All **code checks run automatically**.
6. When ready, open a **Pull Request** and we'll merge your edits.

---

## Try Editing

- **Want to change web page background colors?** Edit `index.css` directly in the browser.
- **Want to change right-side HUD text or overlay messages?** Edit `src/ui/hud.ts`.
- **Want to change rock colors?** Edit `src/kit/palettes.ts`.
- **Want to change scoring or level speed?** Edit `src/kit/scoring.ts`.
- **Want to add/edit shapes or how they are chosen (randomization)?** Edit `src/game/pieces.ts`.

Each code file is small and commented. Read the header lines for guidance.

## For Bigger Changes (Optional Local Setup)

If you want to change gameplay, scoring logic, or transitions, you'll probably want to set up the project locally. See [SETUP](./SETUP.md).
