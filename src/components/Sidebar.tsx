import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Box,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'actions', label: 'Action Items', icon: CheckSquare },
  { id: '3d-viewer', label: '3D Viewer', icon: Box },
  { id: 'kpi', label: 'KPI Dashboard', icon: BarChart3 },
  { id: 'teams', label: 'Teams', icon: Users },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        ${collapsed ? 'w-16' : 'w-64'}
        bg-slate-900 text-white min-h-screen
        flex flex-col transition-all duration-300
      `}
    >
      {/* Logo / Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="font-bold text-lg">BIMSC Studio</h1>
            <p className="text-xs text-slate-400">Hyperbuilding 1</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-800 rounded"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Team Indicators */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Teams</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">Structure/Facade</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Program</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Data</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="p-2 border-t border-slate-700">
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg
            text-slate-300 hover:bg-slate-800 hover:text-white
            transition-colors duration-200
          `}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
