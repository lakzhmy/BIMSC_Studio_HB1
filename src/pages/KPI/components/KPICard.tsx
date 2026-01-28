import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  status: 'on-track' | 'warning' | 'over';
  teamColor: string;
  sparklineData?: number[];
}

export function KPICard({
  title,
  value,
  target,
  unit,
  trend,
  status,
  teamColor,
  sparklineData = [],
}: KPICardProps) {
  const statusColors = {
    'on-track': 'bg-green-100 text-green-800 border-green-200',
    'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'over': 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    'on-track': 'On Target',
    'warning': 'Warning',
    'over': 'Over Target',
  };

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    (status === 'on-track' && trend !== 0) ? 'text-green-600' :
    (status === 'over') ? 'text-red-600' :
    'text-yellow-600';

  // Simple SVG sparkline
  const sparklinePath = sparklineData.length > 1 ? (() => {
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  })() : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      {/* Header with team color indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: teamColor }}
          />
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Main value */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-slate-500">{unit}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-slate-400">Target: {target.toLocaleString()} {unit}</span>
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData.length > 1 && (
        <div className="mb-3 h-8">
          <svg viewBox="0 0 100 30" className="w-full h-full">
            <path
              d={sparklinePath}
              fill="none"
              stroke={teamColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Trend */}
      <div className={`flex items-center gap-1 ${trendColor}`}>
        <TrendIcon size={16} />
        <span className="text-sm font-medium">
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400 ml-1">vs last week</span>
      </div>
    </div>
  );
}
