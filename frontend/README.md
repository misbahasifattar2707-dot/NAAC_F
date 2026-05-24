# METtrack — Frontend (React + Vite)

Single-page application for NAAC Criteria **1 through 6**.

## Structure

```text
frontend/src/
├── api/apiService.js       # All backend calls
├── components/
│   ├── Sidebar.jsx
│   └── criteria/CriterionProofSection.jsx
├── hooks/useCriterionProof.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── criteria1/ … criteria6/   # 42 criterion pages
│   └── ...
├── App.jsx                 # Route definitions
└── main.jsx
```

## Development

```powershell
cd frontend
npm install
npm run dev
```

- UI: **http://localhost:5174**
- API proxy: `/api` → `http://localhost:5000` (see `vite.config.js`)

Start the Flask backend first.

## Production build

```powershell
npm run build
```

Build output is written to **`../backend/static/`** so Flask can serve the app from one URL.

## Adding a criterion page

1. Create `src/pages/criteriaN/CriterionN_x_x.jsx`
2. Add route in `App.jsx`
3. Add sidebar link in `components/Sidebar.jsx`
4. Add dashboard card in `pages/Dashboard.jsx`
5. Ensure backend `CRITERIA_MODELS` has the matching key

## Proof upload (Excel export)

Each page includes `CriterionProofFileSection`:

```jsx
import { CriterionProofFileSection } from "../../components/criteria/CriterionProofSection";

<CriterionProofFileSection criterionKey="3_1" />
```

Saved proof links appear in the **Document / Proof Link** column on Excel export.
