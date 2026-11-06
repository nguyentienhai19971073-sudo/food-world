# FOOD WORLD – Global Food Match
### Complete Commercial HTML5 Game for YouTube Playables

A casual puzzle, food-matching, and educational arcade game where players explore world cuisine by discovering, recognizing, and matching authentic global dishes to their respective countries across 120 curated stages, 4 game modes, and an unlockable culinary encyclopedia.

---

## 🎮 Game Overview & Features

- **Title**: FOOD WORLD – Global Food Match
- **Genre**: Casual Puzzle / Food Matching / Educational Arcade
- **Platform**: YouTube Playables (HTML5 / WebGL / Canvas / Responsive Web)
- **Controls**:
  - **Drag & Drop**: Drag a dish card directly onto the country plate.
  - **Tap to Match**: Tap a dish to select it, then tap the target country plate (ideal for touchscreens and accessibility).
- **Audio Engine**: 100% procedural Web Audio API sound synthesizer with zero external sound file latency, background music loops, correct pings, wrong buzzers, escalating combo chimes, card flips, and victory fanfares.
- **Visuals**: Bespoke 2D cartoon vector artwork for every dish with high-definition retina scaling, responsive layouts (9:16 mobile portrait, 16:9 desktop landscape, 4:3, 1:1 square).

---

## 🌍 Game Modes

1. **Classic Journey (120 Stages across 6 Continents)**:
   - **Asia** (Stages 1–25)
   - **Europe** (Stages 26–50)
   - **Americas** (Stages 51–70)
   - **Africa** (Stages 71–85)
   - **Oceania** (Stages 86–100)
   - **World Tour** (Stages 101–120)
   - Progressive difficulty: starts relaxed with tutorial, introduces soft timers, mistake limits, and conveyor belts.
2. **Time Attack**:
   - 60-second high-speed matching frenzy.
   - Earn +1 bonus second for every correct match; -2s penalty for mistakes.
   - Streak multipliers and personal high-score tracking.
3. **Food Memory**:
   - Secret card-flipping game pairing global delicacies with their country flags.
   - Turn counter and rating system.
4. **Endless Challenge**:
   - Continuous conveyor belt with incoming world dishes.
   - 3 lives; belt speed increases every 6 successful matches.

---

## 📖 Global Culinary Catalog

- **42 Countries** across all 5 continents and world tour.
- **164 Authentic Global Dishes** verified for cultural and culinary accuracy:
  - Vietnam (Phở, Bánh Mì, Bún Chả, Gỏi Cuốn, Bánh Xèo, Cao Lầu, Bánh Cuốn)
  - Japan (Sushi, Ramen, Takoyaki, Tempura, Yakitori, Udon)
  - South Korea (Kimchi, Bibimbap, Tteokbokki, Bulgogi, Samgyeopsal, Japchae)
  - Italy (Pizza Margherita, Spaghetti Carbonara, Lasagna, Tiramisu, Risotto, Gelato)
  - France (Croissant, Ratatouille, Macarons, Escargots, Soupe à l’Oignon, Crêpes Suzette)
  - Spain (Paella, Churros, Gazpacho, Jamón Ibérico, Tortilla Española)
  - Germany (Bratwurst, Pretzel, Schnitzel, Sauerkraut, Black Forest Cake)
  - United Kingdom (Fish and Chips, Shepherd's Pie, Beef Wellington, Full English Breakfast)
  - United States (Cheeseburger, Mac & Cheese, Apple Pie, Buffalo Wings, Clam Chowder)
  - Mexico (Tacos al Pastor, Guacamole, Enchiladas, Chilaquiles, Tamales)
  - Canada (Poutine, Maple Pancakes, Butter Tart, Tourtière)
  - Brazil (Feijoada, Pão de Queijo, Coxinha, Brigadeiro, Moqueca)
  - Peru (Ceviche, Lomo Saltado, Causa Rellena, Anticuchos)
  - Argentina (Asado, Empanadas, Alfajores, Bife con Chimichurri)
  - Egypt (Koshari, Falafel, Ful Medames, Hawawshi)
  - Morocco (Tagine, Couscous, Pastilla, Harira)
  - Australia (Meat Pie, Lamington, Vegemite Toast, ANZAC Biscuits)
  - New Zealand (Pavlova, Hāngī, Whitebait Fritter, Hokey Pokey)
  - And many more across Africa, Americas, Asia, Europe, and Oceania!

---

## 🌐 Multilingual Support (i18n)

Fully localized in 6 languages:
- **English** (en)
- **Tiếng Việt** (vi)
- **日本語** (ja)
- **한국어** (ko)
- **Español** (es)
- **Français** (fr)

---

## 🚀 YouTube Playables SDK Integration

Complies with the official YouTube Playables SDK specification (`https://www.youtube.com/game_api/v1`):

1. **Script Tag in `index.html`**:
   Loaded in `<head>` before any game code.
2. **Lifecycle Notifications**:
   - `window.ytgame.game.firstFrameReady()`: Fired immediately once the root layout mounts.
   - `window.ytgame.game.gameReady()`: Fired once save data and assets are loaded and interactive.
3. **Audio State Synchronization**:
   - `window.ytgame.system.isAudioEnabled()`
   - `window.ytgame.system.onAudioEnabledChange(cb)`: Audio engine automatically mutes/unmutes synchronously with YouTube's system toggle.
4. **Pause & Resume Lifecycle**:
   - `window.ytgame.system.onPause(cb)`: Automatically pauses game loops, timers, and background music.
   - `window.ytgame.system.onResume(cb)`: Smoothly resumes gameplay when focused.
5. **Persistence (Cloud Saves)**:
   - `window.ytgame.game.loadData()` & `saveData()`: Saves level completion, unlocked foods, high scores, and settings.
   - Includes graceful fallback to `localStorage` for local testing.
6. **Engagement**:
   - `window.ytgame.engagement.sendScore({ value })`: Reports scores to YouTube engagement leaderboards.

---

## 🛠️ Build and Development Instructions (macOS & Linux)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Automated Quality Assurance Verification
Validates the data integrity of all 120 levels, 42 countries, 164 dishes, and multilingual dictionaries:
```bash
npx tsx src/tests/validateGameData.ts
```

### 4. Build Production Bundle for YouTube Playables
```bash
npm run build
```
This generates the standalone production bundle in `./dist`:
- `dist/index.html` (Entry point at root)
- Relative asset paths (`./assets/...`)
- Package size: **< 1.0 MB** (far below the 15 MB YouTube Playables requirement!)

### 5. Packaging for YouTube Playables Submission
On macOS or Linux, zip the **contents** of the `dist` directory:
```bash
cd dist && zip -r ../food_world_youtube_playables.zip . && cd ..
```
The resulting `food_world_youtube_playables.zip` has `index.html` at its root and is ready for submission to the YouTube Playables developer console.
