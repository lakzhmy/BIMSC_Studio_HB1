import { Construction } from 'lucide-react';

/**
 * Action Items Page
 *
 * Owner: Program Team
 *
 * TODO: Build this page to show:
 * - Kanban board with columns: Todo, In Progress, Done
 * - Filter by team, assignee, priority
 * - Create/edit action items
 * - Due date tracking
 */
export function ActionsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <Construction size={64} className="text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Action Items</h1>
        <p className="text-slate-500 mb-4">
          Track action items across all teams with a Kanban-style board.
        </p>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-left">
          <p className="text-sm font-medium text-slate-700 mb-2">Features to build:</p>
          <ul className="text-sm text-slate-500 space-y-1">
            <li>• Kanban board (Todo → In Progress → Done)</li>
            <li>• Drag and drop between columns</li>
            <li>• Filter by team, assignee, priority</li>
            <li>• Create/edit action item modal</li>
            <li>• Due date indicators</li>
          </ul>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Design this page in Figma, then use Claude to build it!
        </p>
      </div>
    </div>
  );
}
