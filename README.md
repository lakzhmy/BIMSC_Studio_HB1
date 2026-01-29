# Lung Tower Studio

A modern Vue 3 single-page application for architectural BIM project management. This application is designed to facilitate team collaboration, KPI tracking, meeting management, and 3D visualization for a high-rise building project called "Lung Tower."

## Project Overview

**Lung Tower Studio** is a comprehensive project management and collaboration platform tailored for architects and engineers working on complex building information modeling (BIM) projects. The application features:

- **Team Collaboration**: Manage multiple teams (Structure, Program, and Data teams) with role-based access
- **User Authentication**: Secure login and profile setup workflows
- **Dashboard Views**: Main dashboard with customizable KPI tracking
- **Meeting Management**: Schedule, track, and manage project meetings
- **3D Visualization**: Integrated 3D viewer for BIM models using Three.js
- **Data Management**: Actions and comprehensive team detail views

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API (`<script setup>` syntax)
- **Routing**: Vue Router 4 with navigation guards
- **State Management**: Pinia
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **3D Visualization**: Three.js
- **Icons**: Lucide Vue Next

## Installation Requirements

### Prerequisites

You need to have **Node.js** installed on your system. The project uses npm (Node Package Manager) which comes with Node.js.

- **Node.js**: Version 16.x or higher recommended
- **npm**: Version 8.x or higher (comes with Node.js)

### Installation Steps

1. **Navigate to the project directory**:
   ```bash
   cd app-bimsc-studio-hb01
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This will install all required packages listed in `package.json`, including:
   - Vue 3
   - Vue Router 4
   - Pinia (state management)
   - Tailwind CSS
   - Three.js (for 3D visualization)
   - Lucide Vue Next (icons)
   - Vite and build tools

## Available Scripts

Once installed, you can run the following commands:

### Development Server
```bash
npm run dev
```
Starts the development server with hot module replacement (HMR). The app will be available at `http://localhost:5173` (default Vite port).

### Production Build
```bash
npm run build
```
Builds the application for production. The optimized bundle will be created in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing before deployment.

## Project Structure

```
├── src/
│   ├── main.js                      # App entry point
│   ├── App.vue                      # Root component
│   ├── style.css                    # Global Tailwind styles
│   ├── components/                  # Reusable components
│   │   ├── AddMemberModal.vue
│   │   ├── AvatarPreview.vue
│   │   ├── MemberBlob.vue
│   │   └── UserAvatar.vue
│   ├── router/
│   │   └── index.js                 # Route definitions & guards
│   ├── stores/
│   │   └── userStore.js             # User authentication state (Pinia)
│   ├── views/                       # Page components
│   │   ├── LoginView.vue            # Login page
│   │   ├── ProfileSetup.vue         # Team selection page
│   │   ├── DashboardView.vue        # Main dashboard
│   │   ├── KPIDashboardView.vue     # KPI metrics view
│   │   ├── MeetingsView.vue         # Meeting management
│   │   ├── ActionsView.vue          # Action items tracking
│   │   ├── TeamsView.vue            # Team overview
│   │   ├── TeamDetailView.vue       # Individual team details
│   │   └── ViewerView.vue           # 3D BIM viewer
│   └── data/
│       └── sampleData.js            # Mock data for development
├── package.json                     # Project dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── index.html                       # Main HTML file
├── APP_SPECIFICATION.md             # Detailed application specification
└── README.md                        # This file
```

## Key Features

### Authentication Flow
1. **Login** - Simple email/password login interface
2. **Profile Setup** - Select from three teams (Structure, Program, Data)
3. **Dashboard** - Access main application with team context

### Teams

- **Structure Team** (Green) - Structural engineering and design
- **Program Team** (Blue) - Space planning and program management
- **Data Team** (Red) - Analytics and data insights

### Views

- **Dashboard**: Overview of project status and key metrics
- **KPI Dashboard**: Performance indicators and analytics
- **Meetings**: View and manage project meetings
- **Actions**: Track action items and tasks
- **Teams**: View all teams and their members
- **Team Details**: Deep dive into specific team information
- **3D Viewer**: Interactive 3D model visualization

## Design System

The application uses Tailwind CSS with a consistent light-mode design:

- **Primary Background**: Light slate (`bg-slate-50`)
- **Cards**: White with subtle borders
- **Text**: Dark slate for primary, lighter slate for secondary
- **Interactions**: Smooth transitions and hover effects

Team-specific accent colors are used throughout for visual identification.

## Getting Started

After installation, to start developing:

```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173`. Any changes you make to the source files will be automatically reflected in the browser.

## Additional Resources

- See [APP_SPECIFICATION.md](APP_SPECIFICATION.md) for detailed technical specifications
- Vue 3 Documentation: https://vuejs.org/
- Vite Documentation: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/

## Notes

- The application currently uses mock data for development
- No actual authentication backend is implemented (for demo purposes)
- The app is optimized for modern browsers supporting ES modules
- All styling is light-mode only

## Support

For detailed information about specific features and implementation details, refer to the [APP_SPECIFICATION.md](APP_SPECIFICATION.md) file included in the project.
