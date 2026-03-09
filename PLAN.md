# Implementation Plan: Gradient Visualization with Timeline

## Overview
Add a gradient visualization mode to ViewerView.vue alongside the existing 3D viewer.
Two top-level buttons ("3D Viewer" / "Gradient") switch between modes.
The existing 3D viewer's source project ID changes from `3d70848e9c` to `08c875bbe4`.

---

## Files to Modify

| File | Change |
|------|--------|
| `.env` | Add 3 new VITE_ vars for target project |
| `.env.example` | Same |
| `src/services/speckleService.js` | Update STREAM_ID to `08c875bbe4`; add new query functions for target project |
| `src/composables/useSpeckleModels.js` | Update STREAM_ID to `08c875bbe4` |

## Files to Create

| File | Purpose |
|------|---------|
| `src/composables/useGradientVisualization.js` | All gradient mode logic: fetching versions, loading objects, applying colors, tooltip data |

## Files to Rewrite (significant changes)

| File | Change |
|------|--------|
| `src/views/ViewerView.vue` | Add mode toggle (3D Viewer / Gradient), gradient legend, discrete timeline slider, tooltip overlay |

---

## Step-by-step

### Step 1 — Environment & Config

**.env** and **.env.example** — add:
```
VITE_SPECKLE_TARGET_PROJECT_ID=f91adc2f08
VITE_SPECKLE_VISUALIZATION_MODEL_ID=470a5c84fa
VITE_SPECKLE_MANIFEST_MODEL_ID=31f0fc18e2
```

**speckleService.js** — change `STREAM_ID` from `'3d70848e9c'` to `'08c875bbe4'`
**useSpeckleModels.js** — change `STREAM_ID` from `'3d70848e9c'` to `'08c875bbe4'`

---

### Step 2 — New Service Functions (`speckleService.js`)

Add three new exported functions (these use the newer Speckle GraphQL terminology — `project`/`model`/`versions` instead of `stream`/`branches`/`commits`):

1. **`fetchModelVersions(projectId, modelId, limit = 5)`**
   - GraphQL: `project(id) → model(id) → versions(limit) → items { id, referencedObject, message, createdAt }`
   - Returns array of version objects sorted newest-first

2. **`fetchRootObject(projectId, objectId)`**
   - GraphQL: `stream(id) → object(id) → data` (returns root object JSON blob)
   - Used to get metadata like `global_min`, `global_max`, `source_version_id`
   - Also used for manifest root to get `property_name`, `buckets`, etc.

3. **`fetchObjectChildren(projectId, objectId, depth = 2, limit = 1000)`**
   - GraphQL: `stream(id) → object(id) → children(depth, limit) → objects { id, data }`
   - Used to get the @elements wrapper objects with their `gradient_value`, `property_value`, `bucket_label`, and `@element` reference
   - Returns array of child objects

---

### Step 3 — New Composable (`useGradientVisualization.js`)

**State:**
- `isActive` — boolean, gradient mode on/off
- `manifestVersions` — array of { id, referencedObject, createdAt, rootData } (last 5 manifest versions)
- `visualizationVersions` — array of { id, referencedObject, createdAt } (visualization versions)
- `selectedVersionIndex` — int, which timeline step is selected (0 = newest)
- `gradientMap` — Map<geometryObjectId, { gradient_value, property_value, bucket_label }>
- `legendData` — { global_min, global_max, property_name }
- `isLoading`, `loadingProgress`, `errorMessage` — UI state

**Internal refs:**
- `viewer` — shared Speckle Viewer instance (passed in or created)
- `filteringExtension` — FilteringExtension instance

**Methods:**

- **`initialize(viewerContainerRef)`**
  1. Fetch manifest versions via `fetchModelVersions(TARGET_PROJECT_ID, MANIFEST_MODEL_ID, 5)`
  2. Fetch visualization versions via `fetchModelVersions(TARGET_PROJECT_ID, VIZ_MODEL_ID, 10)` (fetch more to ensure we find matches)
  3. For each manifest version, fetch its root object to get `source_version_id` and `property_name`
  4. Default to latest version (index 0)
  5. Call `loadVersion(0)`

- **`loadVersion(index)`**
  1. Set `selectedVersionIndex = index`
  2. Get the manifest version at that index → read its `source_version_id`
  3. Find the _visualization version whose root `source_version_id` matches
  4. Create/reinit viewer if needed
  5. Unload all existing objects from viewer
  6. Load the visualization version's root object into viewer via SpeckleLoader
     - URL: `${window.location.origin}/streams/${TARGET_PROJECT_ID}/objects/${referencedObject}` (goes through Vite proxy for auth)
  7. After load completes, call `buildGradientMap()`
  8. Call `applyColors()`
  9. Update `legendData` from the visualization root (global_min, global_max) and manifest root (property_name)

- **`buildGradientMap()`**
  1. Fetch children of the visualization root object via `fetchObjectChildren()`
  2. For each child that has `gradient_value` property (these are wrapper objects):
     - Extract `@element` reference → get `referencedId` (the geometry object ID)
     - Store in gradientMap: `referencedId → { gradient_value, property_value, bucket_label }`

- **`applyColors()`**
  1. Convert gradientMap entries to color groups
  2. Use `gradientToColor(t)` to convert each gradient_value (0-1) to a hex color
  3. Group object IDs by color (for efficiency — objects with same rounded gradient get same color)
  4. Call `filteringExtension.setUserObjectColors(colorGroups)`

- **`getObjectInfo(objectId)`** — lookup in gradientMap, return { property_value, bucket_label, gradient_value } or null

- **`gradientToColor(t)`** — color ramp function:
  ```js
  // t: 0.0 (light yellow) → 1.0 (deep red)
  r = 255
  g = Math.round(255 * (1 - t))
  b = Math.round(80 * (1 - t))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
  ```

- **`dispose()`** — cleanup viewer, clear maps

**Events:**
- Set up `ViewerEvent.ObjectClicked` listener → emit tooltip data to the view

---

### Step 4 — ViewerView.vue Restructure

**Template layout:**

```
┌──────────────────────────────────────────────────────┐
│  [3D Viewer] [Gradient]          ← top-level toggle  │
├──────────────────────────────────────────────────────┤
│                                                      │
│              3D Viewer Canvas                        │
│              (shared container)                      │
│                                                      │
│  ┌─ Tooltip (gradient mode only) ─────────┐         │
│  │ Value: 142.3  |  Bucket: 80-160        │         │
│  └────────────────────────────────────────┘         │
│                                                      │
├──────────────────────────────────────────────────────┤
│  IF 3D Viewer mode:                                  │
│    [Current] [History]    ← existing controls        │
│    (timeline slider if History)                      │
│                                                      │
│  IF Gradient mode:                                   │
│    ┌─ Legend ────────────────────────────────┐       │
│    │  property_name                          │       │
│    │  [gradient bar: yellow ──→ red]         │       │
│    │  global_min            global_max       │       │
│    └─────────────────────────────────────────┘       │
│    ┌─ Timeline ──────────────────────────────┐       │
│    │  ●────●────●────●────●                  │       │
│    │  v1   v2   v3   v4   v5                 │       │
│    │  date date date date date               │       │
│    └─────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

**Logic:**
- When switching from "3D Viewer" to "Gradient": dispose existing viewer, init gradient viewer, load latest gradient version
- When switching from "Gradient" to "3D Viewer": dispose gradient viewer, reinit existing viewer, show current models
- Both modes share the same `<div ref="viewerContainer">` — only one viewer instance exists at a time
- Click handler in gradient mode: on ObjectClicked, look up objectId in gradientMap, show tooltip positioned near click point
- Timeline is a discrete slider (HTML range input with `step=1`, `min=0`, `max=N-1`) showing version dates as labels below

**Tooltip:**
- Absolute-positioned div shown on object click
- Shows `property_value` and `bucket_label`
- Hidden when clicking empty space or switching versions

---

### Step 5 — Object Loading via Proxy

For the target project (which may be private), object loading goes through the Vite proxy:

```js
// Instead of pointing directly at Speckle server:
const speckleUrl = `${SPECKLE_SERVER}/streams/${PROJECT_ID}/objects/${objectId}`
// Point at our own origin (Vite proxy will add Bearer token):
const proxyUrl = `${window.location.origin}/streams/${TARGET_PROJECT_ID}/objects/${objectId}`
const urls = await UrlHelper.getResourceUrls(proxyUrl)
```

The Vite config already proxies `/streams` and `/objects` to Speckle with auth headers.

---

### Step 6 — Matching Visualization to Manifest Versions

The _manifest and _visualization models both store `source_version_id` in their root objects.

Timeline flow:
1. Fetch last 5 _manifest versions → get their `referencedObject` IDs and `createdAt` dates
2. For each manifest version, fetch its root object to read `source_version_id`
3. Fetch _visualization versions (up to 10)
4. For each visualization version, fetch its root object to read `source_version_id`
5. Build lookup: `source_version_id → visualization_version.referencedObject`
6. When user selects a timeline step:
   - Get the manifest's `source_version_id` for that step
   - Look up the matching visualization version
   - Load that visualization version into the viewer

(We can optimize by batch-fetching all root objects at init time and caching.)
