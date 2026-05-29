# Square Foot Garden Planner

A local, browser-based planning tool for square foot gardening. No server, no install, no account — just open `index.html` in a browser.

## Getting Started

1. Clone or download this repo
2. Open `index.html` in your browser (Chrome recommended — see [Saving Files](#saving-files))
3. Start planning

## Features

### Garden Beds
- Add multiple beds using the quick-size buttons (4×4, 4×8, 4×12, 3×6, 2×4) or **Custom Bed** for any size up to 20×20 ft
- Each bed is shown as a grid of 1-foot squares
- Click the bed name to rename it
- Adjust width and height at any time — plants outside the new boundary are removed
- Clear all plants from a bed (🗑) or delete the bed entirely (✕)

### Planting
- **Click a plant** in the left sidebar to select it, then click any grid square to place it
- **Drag and drop** a plant from the sidebar directly onto a square
- **Click a square with no tool selected** to open a full plant picker
- **Right-click** any square to clear it
- **Erase Mode** (🧹 in the sidebar) — click squares to remove plants one at a time

### Plant Library
37 plants across 8 categories, each with the correct square foot gardening density:

| Category | Examples |
|----------|---------|
| Fruiting | Tomato (1/sq), Cucumber (2/sq), Strawberry (4/sq) |
| Brassica | Broccoli (1/sq), Kale (2/sq) |
| Greens | Head Lettuce (1/sq), Leaf Lettuce (4/sq), Mesclun Mix (9/sq), Spinach (9/sq) |
| Root | Carrot (16/sq), Beet (9/sq), Radish (16/sq) |
| Allium | Onion (16/sq), Garlic (9/sq) |
| Legume | Peas (8/sq), Bush Beans (9/sq) |
| Herb | Basil (4/sq), Chives (16/sq), Rosemary (1/sq) |
| Flower | Sunflower (1/sq), Marigold (4/sq), Nasturtium (4/sq) |

Use the search box at the top of the sidebar to filter by plant name or category.

### Plant Summary
The summary table at the bottom tracks everything you've planted:

- **Squares Used** — how many grid squares are filled with each plant, plus the equivalent plant count
- **Per Bed** — breakdown of squares per bed
- **Target Squares** — optionally set how many squares you want to fill for a given plant; leave blank for no target
- **Progress** — a progress bar showing squares filled vs. target (turns amber if you overshoot)

### Saving Files

| Browser | Behavior |
|---------|----------|
| **Chrome / Edge** | Native "Save As" dialog — choose location, filename, and overwrite existing files |
| **Firefox / Safari** | Download prompt with a filename field — file goes to your Downloads folder; overwriting is not supported by these browsers |

The saved `.json` file contains your full layout (all beds, grid contents, targets) and a version number for future compatibility.

To **load** a previously saved plan, click **Load** and select the `.json` file. Your layout is also auto-saved to browser localStorage, so refreshing the page won't lose your work.

## File Format

Plans are saved as JSON with a `version` field to support future migrations:

```json
{
  "version": "1.0",
  "savedAt": "2026-05-29T12:00:00.000Z",
  "beds": [
    {
      "id": "abc123",
      "name": "Raised Bed 1",
      "width": 4,
      "height": 8,
      "grid": {
        "0,0": "tomato",
        "0,1": "carrot"
      }
    }
  ],
  "targets": {
    "carrot": 4
  }
}
```

Grid keys are `"row,col"` (zero-indexed). Target values are in **squares** (not plant counts).

## Project Structure

```
index.html   — layout and markup
style.css    — all styles
plants.js    — plant library (PLANTS array, PLANT_MAP, CATEGORIES)
app.js       — application logic (state, rendering, drag/drop, save/load)
```
