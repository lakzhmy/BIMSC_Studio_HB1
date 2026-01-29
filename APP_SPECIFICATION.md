# Lung Tower Studio - Complete Application Specification

## Project Overview
A Vue 3 single-page application for architectural BIM project management, featuring team collaboration, KPI tracking, meeting management, and 3D visualization for a high-rise building project called "Lung Tower."

## Technical Stack
- **Framework**: Vue 3 with Composition API (`<script setup>` syntax)
- **Router**: Vue Router 4 with navigation guards
- **State Management**: Pinia stores
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3 (light mode only, no dark mode)
- **UI Components**: Custom components with Tailwind

## Project Structure
```
src/
├── main.js                 # App entry point
├── App.vue                 # Root component
├── style.css               # Global Tailwind styles
├── router/
│   └── index.js           # Route definitions & guards
├── stores/
│   └── userStore.js       # User authentication state
├── components/
│   └── UserAvatar.vue     # Reusable avatar component
├── views/
│   ├── LoginView.vue      # Login page
│   ├── ProfileSetup.vue   # Team selection page
│   ├── DashboardView.vue  # Main dashboard
│   ├── KPIDashboardView.vue
│   ├── MeetingsView.vue
│   ├── ActionsView.vue
│   ├── ViewerView.vue
│   └── TeamsView.vue
└── data/
    └── sampleData.js      # Mock data exports
```

## Design System

### Color Palette
**Primary Background**: Light mode only
- Background: `bg-slate-50` (#f8fafc)
- Cards: `bg-white` with `border-slate-200`
- Text Primary: `text-slate-900`
- Text Secondary: `text-slate-600`

**Team Colors**:
- Structure Team: `#10b981` (green-500)
- Program Team: `#3b82f6` (blue-600)
- Data Team: `#ef4444` (red-500)

**Status Colors**:
- Success/Good: `bg-green-500`
- Warning: `bg-yellow-500`
- Critical/Error: `bg-red-500`

### Typography
- Headings: Bold, slate-900
- Body: Regular, slate-600
- Interactive elements: Medium weight

### Layout Patterns
- Sticky header with blur effect: `sticky top-0 bg-white/80 backdrop-blur-sm`
- Max content width: `max-w-7xl mx-auto`
- Card hover: `hover:shadow-lg transition-shadow`
- Rounded corners: `rounded-lg`

## Authentication & User Flow

### 1. Login Page (`/`)
- Simple login form with email/password
- "Login" and "Enter Studio" button
- No actual authentication (mock)
- On submit: sets user in store and redirects to `/profile`

### 2. Profile Setup (`/profile`)
**Purpose**: Team selection before entering main app
**Layout**:
- Centered card on slate-50 background
- Displays user name from store
- Three team selection cards with gradients
- Each card shows team icon, name, description
- "Enter Studio" button (disabled until team selected)
- Logout button

**Team Options**:
1. **Structure Team** (green) - Structural engineering
2. **Program Team** (blue) - Space planning
3. **Data Team** (red) - Analytics and insights

**Behavior**:
- Select team → highlight card with colored border
- "Enter Studio" → saves selection to store → redirects to `/dashboard`

### 3. Main Dashboard (`/dashboard`)
**Layout**:
- Sticky header with navigation tabs
- User avatar with name and team in top-right
- Profile and Logout buttons
- Main content area with project overview

**Navigation Tabs** (shared across all views):
1. Dashboard
2. KPI Dashboard
3. Meetings
4. Actions
5. 3D Viewer
6. Teams

**Dashboard Content**:
- Welcome message with user name
- Selected team indicator with color
- Project health overview cards (3 cards: On Track, At Risk, Completed)
- Recent activity feed (timeline style)
- Each activity shows: member avatar, action description, timestamp, team color indicator

## Navigation Guards (router/index.js)
```javascript
// Before each route:
// 1. Check if route requires auth (meta.requiresAuth)
// 2. If not logged in → redirect to '/'
// 3. If logged in but no team selected → redirect to '/profile'
// 4. Otherwise allow navigation
```

## Data Structure (data/sampleData.js)

### Export: `teams`
```javascript
[
  {
    id: 'structure',
    name: 'Structure Team',
    description: 'Structural engineering and analysis',
    color: '#10b981',
    colorDark: '#059669',
    members: [...], // Array of member objects
    activeProjects: 8,
    completedTasks: 24,
    progress: 78
  },
  // program and data teams...
]
```

### Export: `kpiMetrics`
```javascript
[
  {
    id: 'embodied-carbon',
    name: 'Embodied Carbon',
    description: 'Carbon footprint reduction',
    value: 320,
    target: 400,
    unit: 'kgCO₂e/m²',
    status: 'good', // 'good' | 'warning' | 'critical'
    trend: 'down', // 'up' | 'down' | 'stable'
    changePercent: -14.5,
    category: 'environmental',
    history: [380, 350, 335, 320] // for charts
  },
  // More KPIs: facade-ratio, daylight-factor, structural-efficiency, etc.
]
```

### Export: `meetings`
```javascript
[
  {
    id: 'm1',
    title: 'Weekly Design Review',
    description: 'Review structural progress',
    date: 'Feb 2, 2026',
    time: '10:00 AM',
    status: 'scheduled', // 'scheduled' | 'in-progress' | 'completed'
    location: 'Conference Room A',
    attendees: ['Alice', 'Bob', 'Charlie']
  },
  // More meetings...
]
```

### Export: `actions`
```javascript
[
  {
    id: 'a1',
    title: 'Update structural calculations',
    description: 'Revise load analysis for floors 15-20',
    owner: 'Alice Johnson',
    priority: 'high', // 'high' | 'medium' | 'low'
    dueDate: 'Feb 5, 2026',
    progress: 65
  },
  // More actions...
]
```

### Export: `projectHealth`
```javascript
{
  onTrack: 12,
  atRisk: 3,
  completed: 8
}
```

### Export: `recentActivity`
```javascript
[
  {
    id: 1,
    user: 'Alice Johnson',
    action: 'updated structural calculations',
    timestamp: '2 hours ago',
    teamId: 'structure'
  },
  // More activities...
]
```

## Page Specifications

### KPIDashboardView.vue (`/kpi`)
**Header**: Standard navigation with tabs
**Content**:
- Grid of KPI cards (3 columns on desktop)
- Each card shows:
  - KPI name and description
  - Status indicator dot (green/yellow/red)
  - Large value number with unit
  - Target comparison with progress bar
  - Change percentage badge (green if negative for carbon, blue otherwise)
  - Trend icon (up/down/stable arrow)

**Data Source**: `kpiMetrics` from sampleData
**Layout**: `grid md:grid-cols-2 lg:grid-cols-3 gap-6`

### MeetingsView.vue (`/meetings`)
**Header**: Standard navigation
**Content**:
- Page title "Meetings" with "Schedule Meeting" button
- Grid of meeting cards (2 columns)
- Each card shows:
  - Meeting title and description
  - Status badge (scheduled/in-progress/completed)
  - Date, time with calendar emoji
  - Attendee count with people emoji
  - Location with pin emoji

**Data Source**: `meetings` from sampleData
**Layout**: `grid md:grid-cols-2 gap-6`

### ActionsView.vue (`/actions`)
**Header**: Standard navigation
**Content**:
- Page title "Actions" with "Create Action" button
- Vertical list of action cards
- Each card shows:
  - Action title and description
  - Priority badge (high=red, medium=amber, low=green)
  - Owner with pin emoji
  - Due date with calendar emoji
  - Progress percentage with checkmark emoji

**Data Source**: `actions` from sampleData
**Layout**: Stacked list with `space-y-4`

### ViewerView.vue (`/viewer`)
**Header**: Standard navigation
**Content**:
- Page title "3D Building Viewer"
- Large placeholder card (aspect-video ratio)
- Centered message: "3D Viewer Coming Soon" with icon
- Below: 3 info cards in row showing:
  1. Controls (Drag to rotate, Scroll to zoom, Right-click to pan)
  2. Layers (Structure, MEP Systems, Interiors)
  3. Features (Measurements, Annotations, Export)

**Data Source**: None (placeholder view)
**Layout**: Single column with grid for info cards

### TeamsView.vue (`/teams`)
**Header**: Standard navigation
**Content**:
- Page title "Teams" with "Add Member" button
- Grid of team overview cards (3 columns) - one per team
  - Team color icon/badge
  - Team name and description
  - 3 stat boxes: Members count, Active projects, Completed tasks
  - Progress bar showing team progress percentage
  - "View Details" button
- "All Team Members" section
  - Grid of member cards (3 columns)
  - Each shows: gradient avatar, name, role, online status, team badge, "Message" button (appears on hover)

**Data Source**: `teams` from sampleData
**Layout**: Multiple grids with responsive columns

## Store: userStore.js (Pinia)

```javascript
{
  state: {
    isLoggedIn: false,
    currentUser: null, // { name: 'Alice Johnson', email: 'alice@example.com' }
    selectedTeam: null // 'structure' | 'program' | 'data'
  },
  
  actions: {
    login(userData) {
      // Set user and isLoggedIn = true
    },
    
    logout() {
      // Clear user, reset state
    },
    
    setTeam(teamId) {
      // Set selectedTeam
    }
  }
}
```

## Component: UserAvatar.vue

**Props**: 
- `size` (string, default: "40px")

**Template**:
- Circular div with gradient background
- Uses current user initials (first letter of first and last name)
- Gradient colors based on selected team
- Centered white text

**Style**: Fully self-contained, no external dependencies

## Shared Header Pattern (All Auth Views)

Every authenticated view (Dashboard, KPI, Meetings, etc.) shares this header:

```vue
<header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
  <div class="h-16 px-6 flex items-center justify-between">
    <!-- Left: Logo -->
    <h1 class="text-2xl font-bold">Lung Tower Studio</h1>
    
    <!-- Right: User Info + Buttons -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100">
        <UserAvatar size="32px" />
        <div>
          <p class="font-semibold">{{ userStore.currentUser.name }}</p>
          <p class="text-xs text-slate-600 capitalize">{{ userStore.selectedTeam }} Team</p>
        </div>
      </div>
      <button @click="$router.push('/profile')">Profile</button>
      <button @click="handleLogout">Logout</button>
    </div>
  </div>
  
  <!-- Navigation Tabs -->
  <div class="border-t px-6 flex gap-1 overflow-x-auto border-slate-200">
    <router-link 
      v-for="item in navigationItems" 
      :to="item.path"
      :class="[
        'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
        isActiveRoute(item.path) 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-slate-600 hover:text-slate-900'
      ]"
    >
      {{ item.label }}
    </router-link>
  </div>
</header>
```

## Router Configuration

```javascript
const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileSetup,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/kpi',
    name: 'kpi',
    component: KPIDashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/meetings',
    name: 'meetings',
    component: MeetingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/actions',
    name: 'actions',
    component: ActionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/viewer',
    name: 'viewer',
    component: ViewerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/teams',
    name: 'teams',
    component: TeamsView,
    meta: { requiresAuth: true }
  }
]
```

## Key Features & Behaviors

### Navigation Flow
1. User visits `/` → sees login page
2. Logs in → redirected to `/profile`
3. Selects team → clicks "Enter Studio" → redirected to `/dashboard`
4. Can navigate between all views using tabs
5. Can return to `/profile` to change team
6. Logout returns to `/`

### Team Color Integration
- Team colors appear in:
  - Profile setup cards (gradient backgrounds)
  - User avatar gradients
  - Activity feed indicators
  - Team cards in Teams view
  - Progress bars associated with teams

### Responsive Design
- Mobile: Single column layouts, horizontal scroll for tabs
- Tablet: 2-column grids
- Desktop: 3-column grids where appropriate
- All views work from 320px to 4K

### Animation & Transitions
- Route transitions: Smooth fade
- Hover states: `transition-all` or `transition-shadow`
- No complex animations
- No X-ray mode or theme switching

## Critical Requirements

### ❌ DO NOT INCLUDE:
- Dark mode / X-ray mode / Theme switching
- `themeStore.js` (deleted, not needed)
- Any reference to `themeStore` variable
- Complex animations or particle effects
- Actual 3D rendering in viewer (placeholder only)

### ✅ MUST INCLUDE:
- All navigation working between pages
- Data displaying correctly from sampleData.js
- Proper Vue 3 Composition API syntax
- Clean, quoted class strings in `:class` bindings
- All imports properly resolved
- Navigation guards working correctly
- Team selection persisting in store
- User avatar displaying team colors

## File-Specific Notes

### main.js
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

### style.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* No custom styles needed - pure Tailwind */
```

### App.vue
```vue
<template>
  <router-view />
</template>

<script setup>
// Minimal - just router outlet
</script>
```

## Testing Checklist

After building, verify:
- [ ] Can login and reach profile page
- [ ] Can select each team (visual feedback works)
- [ ] "Enter Studio" button enables after team selection
- [ ] Dashboard loads with correct data
- [ ] All 6 navigation tabs are clickable
- [ ] Each page displays its data correctly
- [ ] User avatar shows team colors
- [ ] Logout returns to login page
- [ ] Navigation guards prevent unauthorized access
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop

## Build & Dev Commands

```bash
npm install          # Install dependencies
npm run dev         # Start dev server (Vite)
npm run build       # Production build
```

## Package Dependencies

**Required**:
- vue: ^3.4.0
- vue-router: ^4.2.0
- pinia: ^2.1.0
- tailwindcss: ^3.4.0
- vite: ^5.0.0

**Config Files**:
- `vite.config.js` - Vue plugin, port 5173
- `tailwind.config.js` - Standard config, slate color focus
- `postcss.config.js` - Tailwind plugins

---

## Summary
This is a clean, modern Vue 3 SPA with light mode styling, team-based collaboration features, and mock data for demonstration. The architecture is straightforward: Login → Team Selection → Multi-view Dashboard with navigation tabs. All styling is Tailwind-based, all state is in Pinia, all routing has proper guards. No dark mode, no complex features - just a solid, working BIM project management interface.
