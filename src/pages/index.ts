/**
 * Central page exports
 *
 * This file re-exports all pages so App.tsx only needs to import from here.
 * When adding a new page, add the export here.
 *
 * Usage in App.tsx:
 *   import { Dashboard, KPIDashboard, MeetingsPage } from './pages';
 */

export { Dashboard } from './Dashboard';
export { KPIDashboard } from './KPI';
export { MeetingsPage } from './Meetings';
export { ActionsPage } from './Actions';
export { Viewer3DPage } from './Viewer3D';
export { TeamsPage } from './Teams';
