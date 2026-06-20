# Bali Trip Planner

A clean, single-page trip planner for Bali built with **React 19 + TypeScript + Material UI v9 + Leaflet**, scaffolded with **Vite**.

## What it does

- **Country selector** locked to **Bali**.
- **Date range selector** → automatically renders one editable card per day.
- Each day card lets you:
  - Pick a **Place** from an autocomplete dropdown of curated Bali destinations (grouped by region).
  - Add any number of **Activities** as free text (`+` to add another row, leaving a row blank removes it on blur).
  - Pick an **End the day at** location.
- **Trip Template** dropdown + purple `+` button to reset the current plan.
- Right pane shows an interactive **Leaflet + OpenStreetMap** view of Bali with:
  - **Numbered markers** (`1, 2, 3, …`) for every chosen stop, in travel order.
  - A dashed **purple polyline** connecting the stops so you can see the route.
  - **Pink markers** distinguish "end-of-day" stops from regular day stops.
  - Auto-fits the viewport whenever you add or change stops.
  - Floating legend in the top-left of the map.

## Getting started

```bash
npm install      # only needed once
npm run dev      # start dev server with hot reload
```

Then open the URL Vite prints (typically <http://localhost:5173/>).

## Available scripts

| Script             | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | Vite dev server with hot module reload                    |
| `npm run build`    | Type-check + production bundle into `dist/`               |
| `npm run preview`  | Serve the production build locally for a final smoke test |
| `npm run lint`     | ESLint over the source                                    |

## Project structure

```
src/
├── App.tsx                       # main page, state, layout
├── main.tsx                      # React root
├── index.css                     # globals + Leaflet CSS + custom marker style
├── theme.ts                      # MUI theme (soft, rounded, Inter, purple accent)
├── locations.ts                  # ~30 curated Bali destinations w/ [lat, lng]
├── types.ts                      # shared TypeScript types
├── utils/
│   └── date.ts                   # date formatting / arithmetic helpers
└── components/
    ├── TopBar.tsx                # country / date range / trip template
    ├── DayBlock.tsx              # one editable day card
    ├── TripMap.tsx               # Leaflet map + numbered markers + route
    ├── MapLegend.tsx             # floating legend over the map
    └── FieldLabel.tsx            # small all-caps field label used in cards
```

## Cloud sync (Supabase)

Share the same trip with your group — edits auto-save to the cloud and anyone with the link can view and update the plan.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **SQL Editor**, paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. In **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key

### 2. Configure the app

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Restart the dev server after changing `.env`.

### 3. Share a trip

1. Click **Share trip** in the cloud bar — a unique share code is created.
2. Click **Copy link** and send it to your group (URL includes `?trip=CODE`).
3. Changes sync automatically (~1.5 s after you stop editing).

Without Supabase configured, the app still works using **localStorage** plus JSON export/import.

## Notes

- Map tiles use **OpenStreetMap** (no API key required).
- Styling targets the soft / modern aesthetic of the reference image:
  light grey canvas, white rounded cards, subtle borders, Inter typography.
- Day-block list scrolls horizontally so longer trips don't break the layout.
- Trip data is stored in Supabase only when you create or join a shared trip — it is not committed to GitHub.
