# BIMSC Studio HB1

A webapp for MACAD BIMSC Studio Hyperbuilding 1, built by the Data team of HB1.

## Quick Start

After cloning the repo, run these commands:

```bash
npm install    # Install dependencies (only needed once, or after package.json changes)
npm run dev    # Start the dev server
```

Then open http://localhost:5173 in your browser.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── pages/                 # Each page in its own folder
│   ├── index.ts           # Central exports
│   ├── Dashboard/         # Main dashboard
│   ├── KPI/               # KPI Dashboard
│   ├── Meetings/          # Meetings page
│   ├── Actions/           # Action items
│   ├── Viewer3D/          # 3D viewer (Speckle)
│   └── Teams/             # Teams page
├── components/            # Shared components
├── data/                  # Sample data / API calls
└── App.tsx
```

## Development Workflow (Data Team)

The Data team (Lakzhmy, Emilie, Maria) maintains this codebase. To work simultaneously without merge conflicts:

1. **Each person works on a different page folder**
   ```
   src/pages/
   ├── KPI/        ← Person A
   ├── Meetings/   ← Person B
   ├── Actions/    ← Person C
   ```

2. **Page-specific components stay in your folder**
   ```
   src/pages/KPI/
   ├── index.tsx
   └── components/
       └── KPICard.tsx    ← Only used by KPI page
   ```

3. **Shared components go in `src/components/`**
   - Only move a component here if 2+ pages need it
   - Communicate with the team before editing shared components

4. **When adding a new page:**
   - Create your folder in `src/pages/YourPage/`
   - Add one line to `src/pages/index.ts`
   - Add route in `App.tsx`
   - These are small changes - easy to merge if conflicts happen

## Users

The other teams (Structure/Facade and Program) use the webapp to:
- Add meeting notes
- Track action items
- View KPIs and 3D models

They don't edit the code - they interact through the UI.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (charts)
- Lucide React (icons)
- Supabase (backend - to be connected)
