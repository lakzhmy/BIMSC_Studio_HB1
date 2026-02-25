import { useEffect, useMemo, useState, useCallback } from 'react';
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
import {
  fetchKPIsByCategory,
  extractAllParamRows,
} from '../../services/googleSheetsService';
import {
  KPI_BY_CATEGORY,
  computeKPI,
  computeAggregateKPIs,
  type ParamValues,
  type ComputedKPI,
  type KPICategory as FormulaCategory,
} from '../../services/kpiFormulas';

type TimeRange = '1w' | '1m' | '3m' | 'all';
type KPIMetric = 'embodied_carbon' | 'floor_area' | 'energy_use' | 'facade_ratio' | 'structural_efficiency' | 'daylight_factor';
type KPICategory = 'program' | 'structure' | 'data';

type ProgramKPI = {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
};

type ProgramDataRow = {
  week: string;
  scenario: string;
  kpis: ProgramKPI[];
  spaceName?: string;
};

type ProgramSheetData = {
  weeks: string[];
  scenarios: string[];
  data: ProgramDataRow[];
  kpiNames: string[];
};

export function KPIDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedCategory, setSelectedCategory] = useState<KPICategory>('program');
  const [selectedMetrics, setSelectedMetrics] = useState<KPIMetric[]>([
    'embodied_carbon',
    'energy_use',
    'daylight_factor',
  ]);
  const [programSheetData, setProgramSheetData] = useState<ProgramSheetData | null>(null);
  const [programWeek, setProgramWeek] = useState('');
  const [programSpaceIndex, setProgramSpaceIndex] = useState('');
  const [programLoading, setProgramLoading] = useState(false);
  const [programError, setProgramError] = useState('');

  // ── Formula-engine state (structure & environment tabs) ──────────────────
  const [structureParams, setStructureParams] = useState<
    Array<{ week: string; scenario: string; params: ParamValues }>
  >([]);
  const [dataParams, setDataParams] = useState<
    Array<{ week: string; scenario: string; params: ParamValues }>
  >([]);
  const [formulaLoading, setFormulaLoading] = useState(false);
  const [formulaError, setFormulaError] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');

  // Categorize KPIs
  const categoryMetrics: Record<KPICategory, KPIMetric[]> = {
    program: ['embodied_carbon', 'floor_area'],
    structure: ['structural_efficiency', 'facade_ratio'],
    data: ['energy_use', 'daylight_factor'],
  };

  const programWeeks = ['3', '4', '5', '6', '7', '8', '9', '10'];
  const programPieTotal = 3499663.52;

  const programKpiSpecs = [
    {
      id: 'effective-programmatic-area',
      visual: { type: 'pie' as const, total: programPieTotal },
      showTarget: false,
    },
    {
      id: 'programmatic-proximity-index',
      target: 0.3,
      visual: { type: 'bullet' as const, target: 0.3 },
      showTarget: true,
    },
    {
      id: 'resource-consumption-intensity-ratio',
      target: 0.5,
      visual: { type: 'bullet' as const, target: 0.5 },
      showTarget: true,
    },
  ];

  const getTeamColor = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.color || '#64748b';
  };

  const parseNumber = (value: number | string) => {
    if (typeof value === 'number') {
      return value;
    }
    const sanitized = value.replace(/,/g, '');
    const parsed = Number(sanitized);
    return Number.isNaN(parsed) ? 0 : parsed;
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
    setSelectedMetrics((prev: KPIMetric[]) =>
      prev.includes(metric)
        ? prev.filter((m: KPIMetric) => m !== metric)
        : [...prev, metric]
    );
  };

  // Get sparkline data for a specific metric
  const getSparklineData = (metric: keyof typeof kpiHistory[0]) => {
    return kpiHistory.slice(-6).map(d => d[metric] as number);
  };

  // ── Load all three sheets on mount ────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      setProgramLoading(true);
      setFormulaLoading(true);
      setProgramError('');
      setFormulaError('');

      try {
        const [programData, structureData, envData] = await Promise.all([
          fetchKPIsByCategory('program'),
          fetchKPIsByCategory('structure'),
          fetchKPIsByCategory('data'),
        ]);

        if (!isMounted) return;

        // Program sheet (existing behaviour)
        setProgramSheetData(programData as ProgramSheetData);

        // Structure & environment: extract param rows for formula engine
        setStructureParams(extractAllParamRows(structureData));
        setDataParams(extractAllParamRows(envData));
      } catch (error) {
        if (isMounted) {
          const msg = error instanceof Error ? error.message : String(error);
          setProgramError(msg);
          setFormulaError(msg);
        }
      } finally {
        if (isMounted) {
          setProgramLoading(false);
          setFormulaLoading(false);
        }
      }
    };

    loadAll();
    return () => { isMounted = false; };
  }, []);

  const programSpaceIndexes = useMemo(() => {
    if (!programSheetData?.data) {
      return [] as string[];
    }
    const values = programSheetData.data.map(row => row.scenario).filter(Boolean);
    return Array.from(new Set(values));
  }, [programSheetData]);

  const programSpaceName = useMemo(() => {
    if (!programSheetData?.data || !programSpaceIndex) {
      return '';
    }
    const row = programSheetData.data.find(r => r.scenario === programSpaceIndex);
    return row?.spaceName || '';
  }, [programSheetData, programSpaceIndex]);

  const selectedProgramKpis = useMemo(() => {
    if (!programSheetData?.data || !programSpaceIndex) {
      return [] as ProgramKPI[];
    }
    const row = programSheetData.data.find(r => r.scenario === programSpaceIndex);
    return Array.isArray(row?.kpis) ? row!.kpis : [];
  }, [programSheetData, programSpaceIndex]);

  const programCards = useMemo(() => {
    if (!selectedProgramKpis.length) {
      return [] as Array<{
        id: string;
        title: string;
        value: number;
        unit: string;
        target: number;
        visual: { type: 'bullet'; target: number } | { type: 'pie'; total: number };
        showTarget: boolean;
      }>;
    }

    const byId = new Map(selectedProgramKpis.map(kpi => [kpi.id, kpi]));

    return programKpiSpecs
      .map(spec => {
        const kpi = byId.get(spec.id);
        if (!kpi) {
          return null;
        }

        const value = parseNumber(kpi.value);
        const target = spec.target ?? 0;

        return {
          id: spec.id,
          title: kpi.name,
          value,
          unit: kpi.unit || '',
          target,
          visual: spec.visual,
          showTarget: spec.showTarget,
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        title: string;
        value: number;
        unit: string;
        target: number;
        visual: { type: 'bullet'; target: number } | { type: 'pie'; total: number };
        showTarget: boolean;
      }>;
  }, [selectedProgramKpis, programKpiSpecs]);

  useEffect(() => {
    if (!programWeek && programWeeks.length > 0) {
      setProgramWeek(programWeeks[0]);
    }
  }, [programWeek, programWeeks]);

  useEffect(() => {
    if (!programSpaceIndex && programSpaceIndexes.length > 0) {
      setProgramSpaceIndex(programSpaceIndexes[0]);
    }
  }, [programSpaceIndex, programSpaceIndexes]);

  // ── Computed KPIs for structure and environment tabs ──────────────────
  const formulaCategoryMap: Record<KPICategory, FormulaCategory> = {
    program: 'program',
    structure: 'structure',
    data: 'environment',
  };

  const activeParamRows = selectedCategory === 'structure' ? structureParams : dataParams;

  const scenarioOptions = useMemo(() => {
    return Array.from(new Set(activeParamRows.map(r => r.scenario))).filter(Boolean);
  }, [activeParamRows]);

  useEffect(() => {
    if (!selectedScenario && scenarioOptions.length > 0) {
      setSelectedScenario(scenarioOptions[0]);
    }
  }, [selectedScenario, scenarioOptions]);

  const computedKPIs: ComputedKPI[] = useMemo(() => {
    if (selectedCategory === 'program') return []; // handled separately

    const formulaCat = formulaCategoryMap[selectedCategory];
    const filtered = activeParamRows.filter(r => !selectedScenario || r.scenario === selectedScenario);
    if (filtered.length === 0) return [];

    // Merge all param rows so cross-domain params are available
    // (structure KPIs may need ENV params and vice-versa)
    const merged: ParamValues[] = filtered.map(r => ({ ...r.params }));

    // Also inject any params from the other sheet when available
    const otherParams = selectedCategory === 'structure' ? dataParams : structureParams;
    const otherFiltered = otherParams.filter(r => !selectedScenario || r.scenario === selectedScenario);
    if (otherFiltered.length > 0) {
      // Simple strategy: average the "other" params and inject into every row
      const avg: ParamValues = {};
      for (const row of otherFiltered) {
        for (const [k, v] of Object.entries(row.params)) {
          avg[k] = (avg[k] ?? 0) + v;
        }
      }
      for (const k of Object.keys(avg)) {
        avg[k] /= otherFiltered.length;
      }
      for (const m of merged) {
        for (const [k, v] of Object.entries(avg)) {
          if (m[k] === undefined) m[k] = v;
        }
      }
    }

    return computeAggregateKPIs(merged, formulaCat);
  }, [selectedCategory, activeParamRows, selectedScenario, structureParams, dataParams]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
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

        {/* Category tabs */}
        <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden mb-4 w-fit">
          {(['program', 'structure', 'data'] as KPICategory[]).map((category) => (
            <button
              key={category}
              onClick={() => { setSelectedCategory(category); setSelectedScenario(''); }}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {category === 'program' ? 'PROGRAM KPIs' : category === 'structure' ? 'STRUCTURE KPIs' : 'ENVIRONMENT KPIs'}
            </button>
          ))}
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-2">
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

      {selectedCategory === 'program' && (
        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-slate-200 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Week</label>
            <select
              value={programWeek}
              onChange={(event) => setProgramWeek(event.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Select a week</option>
              {programWeeks.map((week) => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Space Index</label>
            <select
              value={programSpaceIndex}
              onChange={(event) => setProgramSpaceIndex(event.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Select a value</option>
              {programSpaceIndexes.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          {programSpaceName && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Space Name</label>
              <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm">
                {programSpaceName}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid - Filtered by Category */}
      {selectedCategory === 'program' ? (
        programLoading ? (
          <div className="bg-slate-100 rounded-lg p-12 text-center mb-8">
            <p className="text-slate-500">Loading program KPI data...</p>
          </div>
        ) : programError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-900 font-semibold mb-2">Error Loading Program Data</h3>
            <p className="text-red-700 text-sm">{programError}</p>
          </div>
        ) : programSpaceIndex && programCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {programCards.map((card) => {
              const status = card.visual.type === 'bullet'
                ? (card.value <= card.target ? 'on-track' : 'over')
                : 'on-track';

              return (
                <KPICard
                  key={card.id}
                  title={card.title}
                  value={card.value}
                  target={card.target}
                  unit={card.unit}
                  trend={0}
                  status={status}
                  teamColor={getTeamColor('program')}
                  sparklineData={[]}
                  visual={card.visual}
                  showTarget={card.showTarget}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-100 rounded-lg p-12 text-center mb-8">
            <p className="text-slate-500">Select a space index to view program KPI data</p>
          </div>
        )
      ) : formulaLoading ? (
        <div className="bg-slate-100 rounded-lg p-12 text-center mb-8">
          <p className="text-slate-500">Loading {selectedCategory} parameter data…</p>
        </div>
      ) : formulaError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-700 text-sm">{formulaError}</p>
        </div>
      ) : computedKPIs.length > 0 ? (
        <>
          {/* Scenario selector for structure / environment tabs */}
          {scenarioOptions.length > 1 && (
            <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-slate-200 mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Scenario</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                >
                  {scenarioOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {computedKPIs.map((kpi) => (
              <KPICard
                key={kpi.id}
                title={kpi.name}
                value={Math.round(kpi.value * 100) / 100}
                target={0}
                unit={kpi.unit}
                trend={0}
                status="on-track"
                teamColor={selectedCategory === 'structure' ? '#8b5cf6' : '#06b6d4'}
                sparklineData={[]}
                showTarget={false}
              />
            ))}
          </div>

          {/* Formula reference */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Formula Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {computedKPIs.map((kpi) => {
                const def = KPI_BY_CATEGORY[formulaCategoryMap[selectedCategory]]?.find(d => d.id === kpi.id);
                return def ? (
                  <div key={kpi.id} className="text-xs text-slate-500 font-mono bg-slate-50 rounded px-3 py-2">
                    <span className="text-slate-700 font-semibold">{kpi.name}</span>
                    <br />
                    = {def.formula}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-100 rounded-lg p-12 text-center mb-8">
          <p className="text-slate-500">No parameter data available for {selectedCategory} KPIs</p>
        </div>
      )}

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

          {/* Metric toggles - Filtered by Category */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(categoryMetrics[selectedCategory] as KPIMetric[]).map((metric) => (
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
                {selectedMetrics.filter(metric => categoryMetrics[selectedCategory].includes(metric)).map((metric) => (
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

        {/* Carbon Reduction Area Chart - Only show for PROGRAM KPIs */}
        {selectedCategory === 'program' && (
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
                    formatter={(value: number | undefined) => value !== undefined ? [`${value} kgCO2e/m²`, 'Embodied Carbon'] : []}
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
        )}
      </div>

      {/* Team Performance Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Team Performance Summary
          <span className="text-sm text-slate-500 ml-2">
            ({selectedCategory === 'program' ? 'PROGRAM' : selectedCategory === 'structure' ? 'STRUCTURE' : 'DATA'} KPIs)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map((team) => {
            // Get KPIs for this team that match the selected category
            const teamKPIs = (Object.entries(currentKPIs) as [KPIMetric, any][])
              .filter(([metric, kpi]) => kpi.team === team.id && categoryMetrics[selectedCategory].includes(metric))
              .map(([, kpi]) => kpi);
            
            const onTrack = teamKPIs.filter(kpi => kpi.status === 'on-track').length;
            const total = teamKPIs.length;

            return total > 0 ? (
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
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
