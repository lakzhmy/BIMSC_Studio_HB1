import { Construction } from 'lucide-react';

/**
 * 3D Viewer Page
 *
 * Owner: Structure/Facade Team
 *
 * TODO: Build this page to show:
 * - Speckle viewer embed
 * - Model selection dropdown
 * - View controls (zoom, pan, rotate)
 * - Object isolation/highlighting
 * - Data overlay from model
 */
export function Viewer3DPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <Construction size={64} className="text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">3D Viewer</h1>
        <p className="text-slate-500 mb-4">
          View and interact with 3D models via Speckle integration.
        </p>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-left">
          <p className="text-sm font-medium text-slate-700 mb-2">Features to build:</p>
          <ul className="text-sm text-slate-500 space-y-1">
            <li>• Speckle viewer embed</li>
            <li>• Model/stream selection</li>
            <li>• View controls toolbar</li>
            <li>• Object isolation and highlighting</li>
            <li>• Data overlay panel</li>
            <li>• Screenshot/export functionality</li>
          </ul>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Speckle Setup:</strong> You'll need a Speckle stream ID and token.
            Get started at <span className="font-mono">speckle.xyz</span>
          </p>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Design this page in Figma, then use Claude to build it!
        </p>
      </div>
    </div>
  );
}
