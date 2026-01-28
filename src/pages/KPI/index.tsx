import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Calendar, Download, RefreshCw, Filter } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { currentKPIs, kpiHistory, teams } from '../../data/sampleData';

type TimeRange = '1w' | '1m' | '3m' | 'all';
type KPIMetric = 'embodied_carbon' | 'floor_area' | 'energy_use' | 'facade_ratio' | 'structural_efficiency' | 'daylight_factor';

export function KPIDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedMetrics, setSelectedMetrics] = useState<KPIMetric[]>([
    'embodied_carbon',
    'energy_use',
    'daylight_factor',
  ]);

  const getTeamColor = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.color || '#64748b';
  };

  const metricColors: Record<KPIMetric, string> = {
    embodied_carbon: '#ef4444',
    floor_area: '#22c55e',
    energy_use: '#3b82f6',
    facade_ratio: '#f59e0b',
    structural_efficiency: '#8b5cf6',
    daylight_factor: '#06b6d4',
  };

  const metricLabels: Record<KPIMetric, string> = {
    embodied_carbon: 'Embodied Carbon',
    floor_area: 'Floor Area',
    energy_use: 'Energy Use',
    facade_ratio: 'WWR',
    structural_efficiency: 'Steel Usage',
    daylight_factor: 'Daylight',
  };

  const toggleMetric = (metric: KPIMetric) => {
    setSelectedMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  // Get sparkline data for a specific metric
  const getSparklineData = (metric: keyof typeof kpiHistory[0]) => {
    return kpiHistory.slice(-6).map(d => d[metric] as number);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">KPI Dashboard</h1>
            <p className="text-slate-500">Hyperbuilding 1 Performance Metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-2 mt-4">
          <Calendar size={16} className="text-slate-400" />
          <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
            {(['1w', '1m', '3m', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KPICard
          title={currentKPIs.embodied_carbon.description}
          value={currentKPIs.embodied_carbon.value}
          target={currentKPIs.embodied_carbon.target}
          unit={currentKPIs.embodied_carbon.unit}
          trend={currentKPIs.embodied_carbon.trend}
          status={currentKPIs.embodied_carbon.status}
          teamColor={getTeamColor(currentKPIs.embodied_carbon.team)}
          sparklineData={getSparklineData('embodied_carbon')}
        />
        <KPICard
          title={currentKPIs.floor_area.description}
          value={currentKPIs.floor_area.value}
          target={currentKPIs.floor_area.target}
          unit={currentKPIs.floor_area.unit}
          trend={currentKPIs.floor_area.trend}
          status={currentKPIs.floor_area.status}
          teamColor={getTeamColor(currentKPIs.floor_area.team)}
          sparklineData={getSparklineData('floor_area')}
        />
        <KPICard
          title={currentKPIs.energy_use.description}
          value={currentKPIs.energy_use.value}
          target={currentKPIs.energy_use.target}
          unit={currentKPIs.energy_use.unit}
          trend={currentKPIs.energy_use.trend}
          status={currentKPIs.energy_use.status}
          teamColor={getTeamColor(currentKPIs.energy_use.team)}
          sparklineData={getSparklineData('energy_use')}
        />
        <KPICard
          title={currentKPIs.facade_ratio.description}
          value={currentKPIs.facade_ratio.value}
          target={currentKPIs.facade_ratio.target}
          unit={currentKPIs.facade_ratio.unit}
          trend={currentKPIs.facade_ratio.trend}
          status={currentKPIs.facade_ratio.status}
          teamColor={getTeamColor(currentKPIs.facade_ratio.team)}
          sparklineData={getSparklineData('facade_ratio')}
        />
        <KPICard
          title={currentKPIs.structural_efficiency.description}
          value={currentKPIs.structural_efficiency.value}
          target={currentKPIs.structural_efficiency.target}
          unit={currentKPIs.structural_efficiency.unit}
          trend={currentKPIs.structural_efficiency.trend}
          status={currentKPIs.structural_efficiency.status}
          teamColor={getTeamColor(currentKPIs.structural_efficiency.team)}
          sparklineData={getSparklineData('structural_efficiency')}
        />
        <KPICard
          title={currentKPIs.daylight_factor.description}
          value={currentKPIs.daylight_factor.value}
          target={currentKPIs.daylight_factor.target}
          unit={currentKPIs.daylight_factor.unit}
          trend={currentKPIs.daylight_factor.trend}
          status={currentKPIs.daylight_factor.status}
          teamColor={getTeamColor(currentKPIs.daylight_factor.team)}
          sparklineData={getSparklineData('daylight_factor')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Performance Trends</h2>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">Select metrics:</span>
            </div>
          </div>

          {/* Metric toggles */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(metricLabels) as KPIMetric[]).map((metric) => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  selectedMetrics.includes(metric)
                    ? 'border-transparent text-white'
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
                style={selectedMetrics.includes(metric) ? { backgroundColor: metricColors[metric] } : {}}
              >
                {metricLabels[metric]}
              </button>
            ))}
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend />
                {selectedMetrics.map((metric) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    name={metricLabels[metric]}
                    stroke={metricColors[metric]}
                    strokeWidth={2}
                    dot={{ fill: metricColors[metric], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carbon Reduction Area Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Carbon Reduction Progress</h2>
            <p className="text-sm text-slate-500">Tracking towards 350 kgCO2e/m² target</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  domain={[300, 500]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`${value} kgCO2e/m²`, 'Embodied Carbon']}
                />
                <defs>
                  <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="embodied_carbon"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#carbonGradient)"
                />
                {/* Target line */}
                <Line
                  type="monotone"
                  dataKey={() => 350}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-sm text-slate-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-500" style={{ width: '12px', borderStyle: 'dashed' }} />
              <span className="text-sm text-slate-600">Target (350)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Team Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map((team) => {
            const teamKPIs = Object.values(currentKPIs).filter(kpi => kpi.team === team.id);
            const onTrack = teamKPIs.filter(kpi => kpi.status === 'on-track').length;
            const total = teamKPIs.length;

            return (
              <div
                key={team.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <h3 className="font-medium text-slate-900">{team.name}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">KPIs On Track</span>
                    <span className="font-medium text-slate-900">{onTrack}/{total}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(onTrack / total) * 100}%`,
                        backgroundColor: team.color,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {team.members.map((member) => (
                      <span
                        key={member}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
