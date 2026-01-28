import { ArrowRight, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { currentKPIs, actionItems, meetings, teams } from '../data/sampleData';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const recentMeetings = meetings.slice(0, 3);
  const urgentActions = actionItems.filter(a => a.priority === 'high' && a.status !== 'done');

  // Calculate overall health
  const kpiValues = Object.values(currentKPIs);
  const onTrackCount = kpiValues.filter(k => k.status === 'on-track').length;
  const healthPercentage = Math.round((onTrackCount / kpiValues.length) * 100);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome to BIMSC Studio</h1>
        <p className="text-slate-500">Hyperbuilding 1 - Project Overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">Project Health</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-900">{healthPercentage}%</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              healthPercentage >= 80 ? 'bg-green-100 text-green-700' :
              healthPercentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {onTrackCount}/{kpiValues.length} KPIs
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">Active Actions</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {actionItems.filter(a => a.status !== 'done').length}
            </span>
            <span className="text-xs text-red-600 font-medium">
              {urgentActions.length} urgent
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">Team Members</p>
          <span className="text-3xl font-bold text-slate-900">
            {teams.reduce((sum, t) => sum + t.members.length, 0)}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">This Week's Meetings</p>
          <span className="text-3xl font-bold text-slate-900">{meetings.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Key Metrics</h2>
            <button
              onClick={() => onNavigate('kpi')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(currentKPIs).slice(0, 4).map(([key, kpi]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    kpi.status === 'on-track' ? 'bg-green-500' :
                    kpi.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm text-slate-700">{kpi.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-900">{kpi.value.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 ml-1">{kpi.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Urgent Actions</h2>
            <button
              onClick={() => onNavigate('actions')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {urgentActions.length > 0 ? (
            <div className="space-y-3">
              {urgentActions.map((action) => {
                const team = teams.find(t => t.id === action.team);
                return (
                  <div key={action.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <AlertCircle size={18} className="text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{action.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${team?.color}20`, color: team?.color }}
                        >
                          {team?.name}
                        </span>
                        <span className="text-xs text-slate-400">Due: {action.dueDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 py-4">
              <CheckCircle size={20} />
              <span>No urgent actions!</span>
            </div>
          )}
        </div>

        {/* Recent Meetings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Meetings</h2>
            <button
              onClick={() => onNavigate('meetings')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentMeetings.map((meeting) => {
              const team = meeting.team === 'all' ? null : teams.find(t => t.id === meeting.team);
              return (
                <div key={meeting.id} className="py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{meeting.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {new Date(meeting.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: team ? `${team.color}20` : '#e2e8f0',
                            color: team?.color || '#64748b',
                          }}
                        >
                          {team?.name || 'All Teams'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teams Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Teams</h2>
            <button
              onClick={() => onNavigate('teams')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-sm font-medium text-slate-900">{team.name}</span>
                </div>
                <div className="flex -space-x-2">
                  {team.members.slice(0, 3).map((member) => (
                    <div
                      key={member}
                      className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600"
                      title={member}
                    >
                      {member.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
