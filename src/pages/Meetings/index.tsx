import { Construction } from 'lucide-react';

/**
 * Meetings Page
 *
 * Owner: Program Team
 *
 * TODO: Build this page to show:
 * - List of all meetings (filterable by team)
 * - Meeting details with notes
 * - Create new meeting form
 * - Link to action items from meetings
 */
export function MeetingsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <Construction size={64} className="text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Meetings</h1>
        <p className="text-slate-500 mb-4">
          View and manage team meetings, meeting notes, and outcomes.
        </p>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-left">
          <p className="text-sm font-medium text-slate-700 mb-2">Features to build:</p>
          <ul className="text-sm text-slate-500 space-y-1">
            <li>• Meeting list with team filters</li>
            <li>• Meeting detail view with notes</li>
            <li>• Rich text editor for meeting notes</li>
            <li>• Link action items to meetings</li>
            <li>• Calendar view option</li>
          </ul>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Design this page in Figma, then use Claude to build it!
        </p>
      </div>
    </div>
  );
}
