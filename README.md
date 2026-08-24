# Sky Drift

Sky Drift is a mobile-friendly browser game where you steer a ship through the sky, dodge hazards, and collect glowing orbs for points.

## Controls

- **Tilt phone left/right:** steer the ship
- **Tap game area:** trigger a short boost burst
- **Desktop fallback:** use **Left/Right Arrow** keys to steer
- **Pause/Resume:** tap the pause button (or press **P** on desktop)

## Gameplay

- The ship flies forward continuously.
- Obstacles (clouds, rocks, birds) move toward the player.
- Collectible orbs increase your score.
- Speed and obstacle pressure increase over time.
- Any obstacle collision ends the run and shows your final score.

## File structure

```text
/docs
  index.html
  style.css
  game.js
  ship.js
  obstacles.js
  collectibles.js
```

## Run locally

Open the repository root `index.html` in a browser. It redirects to `/docs/`.

## Deploy with GitHub Pages

1. Go to **Settings → Pages** in your repository.
2. Under **Build and deployment** choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or your default branch)
   - **Folder:** `/docs`
3. Save and wait for deployment.

Your game will be available at:

`https://<your-username>.github.io/Sky-Drift_Micro_Game_App/`
