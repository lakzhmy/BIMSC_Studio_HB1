/**
 * KPI Formula Engine
 *
 * Defines:
 *  1. Parameters – named inputs with short variable aliases
 *  2. KPI formulas – pure functions that derive KPI values from parameters
 *
 * Parameter values are fetched from the published Google Sheet at runtime;
 * the formulas themselves are hardcoded here so the computation is
 * transparent and version-controlled.
 */

// ---------------------------------------------------------------------------
// 1. Parameter definitions
// ---------------------------------------------------------------------------

/** The three domains a parameter can belong to. */
export type ParameterDomain = 'PRG' | 'STR' | 'ENV';

export interface ParameterDef {
  /** Full canonical name as it appears in the sheet (e.g. PRG_PAR_Area) */
  name: string;
  /** Short algebraic alias used in formulae (e.g. Ar) */
  variable: string;
  /** Domain / sheet it belongs to */
  domain: ParameterDomain;
  /** Human-readable label */
  label: string;
}

export const PARAMETERS: ParameterDef[] = [
  // ── Program ──────────────────────────────────────────────────────────────
  { name: 'PRG_PAR_Area',                    variable: 'Ar',  domain: 'PRG', label: 'Area' },
  { name: 'PRG_PAR_UseRatio',                variable: 'Ur',  domain: 'PRG', label: 'Use Ratio' },
  { name: 'PRG_PAR_ResourceConsRatio',       variable: 'Rc',  domain: 'PRG', label: 'Resource Consumption Ratio' },
  { name: 'PRG_PAR_GeometryWeight',          variable: 'Wr',  domain: 'PRG', label: 'Geometry Weight' },
  { name: 'PRG_PAR_MeanDistToExit',          variable: 'Da',  domain: 'PRG', label: 'Mean Distance to Exit' },
  { name: 'PRG_PAR_IdealDistToExit',         variable: 'Di',  domain: 'PRG', label: 'Ideal Distance to Exit' },

  // ── Structure ────────────────────────────────────────────────────────────
  { name: 'STR_PAR_HeatReduction',           variable: 'Hr',  domain: 'STR', label: 'Heat Reduction' },
  { name: 'STR_PAR_SolarShadingEfficiency',  variable: 'Sse', domain: 'STR', label: 'Solar Shading Efficiency' },
  { name: 'STR_PAR_WindLoadReduction',       variable: 'Wlr', domain: 'STR', label: 'Wind Load Reduction' },
  { name: 'STR_PAR_DaylightFactor',          variable: 'Df',  domain: 'STR', label: 'Daylight Factor' },
  { name: 'STR_PAR_AirflowEfficiency',       variable: 'Ae',  domain: 'STR', label: 'Airflow Efficiency' },
  { name: 'STR_PAR_EnergyOptimization',      variable: 'Eo',  domain: 'STR', label: 'Energy Optimization' },
  { name: 'STR_PAR_WaterReuseEfficiency',    variable: 'Wre', domain: 'STR', label: 'Water Reuse Efficiency' },
  { name: 'STR_PAR_Density',                 variable: 'De',  domain: 'STR', label: 'Density' },
  { name: 'STR_PAR_StressLoad',              variable: 'Sl',  domain: 'STR', label: 'Stress Load' },
  { name: 'STR_PAR_FiltrationEfficiency',    variable: 'Fe',  domain: 'STR', label: 'Filtration Efficiency' },
  { name: 'STR_PAR_ShadingEfficiency',       variable: 'Se',  domain: 'STR', label: 'Shading Efficiency' },
  { name: 'STR_PAR_NoiseInterior',           variable: 'Ni',  domain: 'STR', label: 'Noise Interior' },

  // ── Environment ──────────────────────────────────────────────────────────
  { name: 'ENV_PAR_IncidentRadiation',       variable: 'Ir',  domain: 'ENV', label: 'Incident Radiation' },
  { name: 'ENV_PAR_ExternalPollution',       variable: 'Ep',  domain: 'ENV', label: 'External Pollution' },
  { name: 'ENV_PAR_NoiseExterior',           variable: 'Ne',  domain: 'ENV', label: 'Noise Exterior' },
  { name: 'ENV_PAR_WindPressure',            variable: 'Wl',  domain: 'ENV', label: 'Wind Pressure' },
];

/** Lookup helpers */
export const PARAM_BY_NAME = new Map(PARAMETERS.map(p => [p.name, p]));
export const PARAM_BY_VAR  = new Map(PARAMETERS.map(p => [p.variable, p]));

// ---------------------------------------------------------------------------
// 2. Parameter value bag
// ---------------------------------------------------------------------------

/**
 * A flat record keyed by the short variable alias.
 * Values are always numeric (sheets may deliver strings — callers must parse).
 */
export type ParamValues = Record<string, number>;

// ---------------------------------------------------------------------------
// 3. KPI formula definitions
// ---------------------------------------------------------------------------

/** Which dashboard tab a KPI should appear under. */
export type KPICategory = 'program' | 'structure' | 'environment';

/** Logic for evaluating if a KPI is within acceptable range. */
export type KPILogic = 'MAX' | 'MIN' | 'STRICT';

export interface KPIFormulaDef {
  /** Stable kebab-case id */
  id: string;
  /** Display name */
  name: string;
  /** Dashboard category / tab */
  category: KPICategory;
  /** Short-hand formula (for display / documentation) */
  formula: string;
  /** The parameter variables this KPI depends on */
  params: string[];
  /** Unit label */
  unit: string;
  /** Target value from the FORMULAS sheet */
  target: number;
  /** Logic for evaluating acceptable range: MAX (higher better), MIN (lower better), STRICT (±10%) */
  logic: KPILogic;
  /**
   * Compute the KPI value from a single row of parameters.
   * For aggregate KPIs (like PPI) use `computeAggregate` instead.
   */
  compute: (p: ParamValues) => number;
  /**
   * Optional: compute from an array of rows (e.g. when Σ sums are needed).
   * If not provided the engine falls back to `compute` on each row.
   */
  computeAggregate?: (rows: ParamValues[]) => number;
}

// ── Program KPIs ───────────────────────────────────────────────────────────

const effectiveProgrammaticArea: KPIFormulaDef = {
  id: 'effective-programmatic-area',
  name: 'Effective Programmatic Area (EPA)',
  category: 'program',
  formula: 'SUMPRODUCT(Ar_range, Ur_range)',
  params: ['Ur', 'Ar'],
  unit: 'm²',
  target: 1000000,
  logic: 'STRICT',
  compute: (p) => p.Ur * p.Ar,
  computeAggregate: (rows) => {
    if (rows.length === 0) return 0;
    
    // Calculate SUMPRODUCT: sum of (Ar_i * Ur_i) for each row
    let sumProduct = 0;
    for (const row of rows) {
      const ar = row.Ar || 0;
      const ur = row.Ur || 0;
      sumProduct += ar * ur;
    }
    
    return sumProduct;
  },
};

const programmaticProximityIndex: KPIFormulaDef = {
  id: 'programmatic-proximity-index',
  name: 'Programmatic Proximity Index (PPI)',
  category: 'program',
  formula: 'Σ(1/Da) / Σ(1/Di)',
  params: ['Da', 'Di'],
  unit: 'unitless [0.0-1.0]',
  target: 0.7,
  logic: 'STRICT',
  // Da is pre-computed as Σ(1/d) per row, Di as 1/d per row
  compute: (p) => (p.Di !== 0 ? p.Da / p.Di : 0),
  computeAggregate: (rows) => {
    let sumInvDa = 0;
    let sumInvDi = 0;
    for (const p of rows) {
      sumInvDa += p.Da;  // already Σ(1/d) per row
      sumInvDi += p.Di;  // already 1/d per row
    }
    return sumInvDi !== 0 ? sumInvDa / sumInvDi : 0;
  },
};

const resourceConsumptionIntensityRatio: KPIFormulaDef = {
  id: 'resource-consumption-intensity-ratio',
  name: 'Resource Consumption Intensity Ratio (RCIR)',
  category: 'program',
  formula: 'AVERAGE(Ur_range)*AVERAGE(Rc_range)',
  params: ['Ur', 'Rc'],
  unit: 'unitless [0.0-1.0]',
  target: 0.6,
  logic: 'MIN',
  compute: (p) => p.Ur * p.Rc,
  computeAggregate: (rows) => {
    if (rows.length === 0) return 0;
    
    // Extract parameter values
    const urValues = rows.map(r => r.Ur || 0);
    const rcValues = rows.map(r => r.Rc || 0);
    
    // Calculate averages using only non-zero values for each parameter
    const urNonZero = urValues.filter(v => v !== 0);
    const rcNonZero = rcValues.filter(v => v !== 0);
    
    const avgUr = urNonZero.length > 0 ? urNonZero.reduce((a, b) => a + b, 0) / urNonZero.length : 0;
    const avgRc = rcNonZero.length > 0 ? rcNonZero.reduce((a, b) => a + b, 0) / rcNonZero.length : 0;
    
    // Return AVERAGE(Ur) × AVERAGE(Rc)
    return avgUr * avgRc;
  },
};

// ── Structure KPIs ─────────────────────────────────────────────────────────

const thermalComfortComplianceRate: KPIFormulaDef = {
  id: 'thermal-comfort-compliance-rate',
  name: 'Thermal Comfort Compliance Rate',
  category: 'environment',
  formula: '200*((AVERAGE(De_range)-MIN(De_range))/(MAX(De_range)-MIN(De_range)))/(1+(AVERAGE(Ir_range)/400)+(AVERAGE(Wl_range)/300))',
  params: ['De', 'Ir', 'Wl'],
  unit: '%',
  target: 70,
  logic: 'MAX',
  compute: (p) => (200 * p.De) / (1 + (p.Ir / 400) + (p.Wl / 300)),
  computeAggregate: (rows) => {
    if (rows.length === 0) return 0;
    
    // Extract parameter values
    const deValues = rows.map(r => r.De || 0);
    const irValues = rows.map(r => r.Ir || 0);
    const wlValues = rows.map(r => r.Wl || 0);
    
    // Calculate averages using only non-zero values for each parameter
    const deNonZero = deValues.filter(v => v !== 0);
    const irNonZero = irValues.filter(v => v !== 0);
    const wlNonZero = wlValues.filter(v => v !== 0);
    
    const avgDe = deNonZero.length > 0 ? deNonZero.reduce((a, b) => a + b, 0) / deNonZero.length : 0;
    const avgIr = irNonZero.length > 0 ? irNonZero.reduce((a, b) => a + b, 0) / irNonZero.length : 0;
    const avgWl = wlNonZero.length > 0 ? wlNonZero.reduce((a, b) => a + b, 0) / wlNonZero.length : 0;
    
    // Find min/max for De normalization (use all values including zeros)
    const minDe = Math.min(...deValues);
    const maxDe = Math.max(...deValues);
    const deRange = maxDe - minDe;
    
    // Normalize the average De
    const normalizedDe = deRange !== 0 ? (avgDe - minDe) / deRange : 0;
    
    // Apply formula: 200*((AVERAGE(De) - MIN(De)) / (MAX(De) - MIN(De))) / (1 + (Ir/400) + (Wl/300))
    const denominator = 1 + (avgIr / 400) + (avgWl / 300);
    return (200 * normalizedDe) / denominator;
  },
};

const structuralEfficiencyPerformance: KPIFormulaDef = {
  id: 'structural-efficiency-performance',
  name: 'Structural Efficiency',
  category: 'structure',
  formula: '100 * normalized_De / (1 + AVERAGE(Sl_range) / AVERAGE(Wl_range))',
  params: ['De', 'Sl', 'Wl'],
  unit: '%',
  target: 70,
  logic: 'MAX',
  compute: (p) => p.De / (1 + (p.Sl / p.Wl)),
  computeAggregate: (rows) => {
    if (rows.length === 0) return 0;
    
    // Extract parameter values
    const deValues = rows.map(r => r.De || 0);
    const slValues = rows.map(r => r.Sl || 0);
    const wlValues = rows.map(r => r.Wl || 0);
    
    // Calculate averages using only non-zero values for each parameter
    const deNonZero = deValues.filter(v => v !== 0);
    const slNonZero = slValues.filter(v => v !== 0);
    const wlNonZero = wlValues.filter(v => v !== 0);
    
    const avgDe = deNonZero.length > 0 ? deNonZero.reduce((a, b) => a + b, 0) / deNonZero.length : 0;
    const avgSl = slNonZero.length > 0 ? slNonZero.reduce((a, b) => a + b, 0) / slNonZero.length : 0;
    const avgWl = wlNonZero.length > 0 ? wlNonZero.reduce((a, b) => a + b, 0) / wlNonZero.length : 0;
    
    // Find min/max for normalization (use all values including zeros)
    const minDe = Math.min(...deValues);
    const maxDe = Math.max(...deValues);
    const deRange = maxDe - minDe;
    
    // Normalize the average: (AVERAGE(De) - MIN(De)) / (MAX(De) - MIN(De))
    const normalizedDe = deRange !== 0 ? (avgDe - minDe) / deRange : 0;
    
    // Apply formula: 100 * normalized_De / (1 + AVERAGE(Sl) / AVERAGE(Wl))
    const denominator = avgWl !== 0 ? 1 + (avgSl / avgWl) : 1;
    const result = 100 * normalizedDe / denominator;
    
    return result;
  },
};

const solarControlPerformance: KPIFormulaDef = {
  id: 'solar-control-performance',
  name: 'Solar Control Performance',
  category: 'structure',
  formula: '100 * normalized_De / (1 + AVERAGE(Ir_range) / 100)',
  params: ['De', 'Ir'],
  unit: '%',
  target: 65,
  logic: 'MAX',
  compute: (p) => p.De / (1 + (p.Ir / 100)),
  computeAggregate: (rows) => {
    if (rows.length === 0) return 0;
    
    // Extract parameter values
    const deValues = rows.map(r => r.De || 0);
    const irValues = rows.map(r => r.Ir || 0);
    
    // Calculate averages using only non-zero values for each parameter
    const deNonZero = deValues.filter(v => v !== 0);
    const irNonZero = irValues.filter(v => v !== 0);
    
    const avgDe = deNonZero.length > 0 ? deNonZero.reduce((a, b) => a + b, 0) / deNonZero.length : 0;
    const avgIr = irNonZero.length > 0 ? irNonZero.reduce((a, b) => a + b, 0) / irNonZero.length : 0;
    
    // Find min/max for normalization (use all values including zeros)
    const minDe = Math.min(...deValues);
    const maxDe = Math.max(...deValues);
    const deRange = maxDe - minDe;
    
    // Normalize the average: (AVERAGE(De) - MIN(De)) / (MAX(De) - MIN(De))
    const normalizedDe = deRange !== 0 ? (avgDe - minDe) / deRange : 0;
    
    // Apply formula: 100 * normalized_De / (1 + AVERAGE(Ir) / 100)
    return 100 * normalizedDe / (1 + (avgIr / 100));
  },
};

const airPurificationEffectiveness: KPIFormulaDef = {
  id: 'air-purification-effectiveness',
  name: 'Air Purification Effectiveness',
  category: 'environment',
  formula: '600*((AVERAGE(Ep_range)-MIN(Ep_range))/(MAX(Ep_range)-MIN(Ep_range)))*AVERAGE(Ur_range)*AVERAGE(Fe_range)*AVERAGE(Rc_range)',
  params: ['Ep', 'Ur', 'Fe', 'Rc'],
  unit: '%',
  target: 70,
  logic: 'MAX',
  compute: (p) => 600 * p.Ep * p.Ur * p.Fe * p.Rc,
  computeAggregate: (rows) => {
    if (rows.length === 0) return 0;
    
    // Extract parameter values
    const epValues = rows.map(r => r.Ep || 0);
    const urValues = rows.map(r => r.Ur || 0);
    const feValues = rows.map(r => r.Fe || 0);
    const rcValues = rows.map(r => r.Rc || 0);
    
    // Calculate averages using only non-zero values for each parameter
    const epNonZero = epValues.filter(v => v !== 0);
    const urNonZero = urValues.filter(v => v !== 0);
    const feNonZero = feValues.filter(v => v !== 0);
    const rcNonZero = rcValues.filter(v => v !== 0);
    
    const avgEp = epNonZero.length > 0 ? epNonZero.reduce((a, b) => a + b, 0) / epNonZero.length : 0;
    const avgUr = urNonZero.length > 0 ? urNonZero.reduce((a, b) => a + b, 0) / urNonZero.length : 0;
    const avgFe = feNonZero.length > 0 ? feNonZero.reduce((a, b) => a + b, 0) / feNonZero.length : 0;
    const avgRc = rcNonZero.length > 0 ? rcNonZero.reduce((a, b) => a + b, 0) / rcNonZero.length : 0;
    
    // Find min/max for Ep normalization (use all values including zeros)
    const minEp = Math.min(...epValues);
    const maxEp = Math.max(...epValues);
    const epRange = maxEp - minEp;
    
    // Normalize Ep
    const normalizedEp = epRange !== 0 ? (avgEp - minEp) / epRange : 0;
    
    // Apply formula: 600 * ((AVERAGE(Ep) - MIN(Ep)) / (MAX(Ep) - MIN(Ep))) * AVERAGE(Ur) * AVERAGE(Fe) * AVERAGE(Rc)
    const result = 600 * normalizedEp * avgUr * avgFe * avgRc;
    
    return result;
  },
};

const acousticComfortNoiseImpactIndex: KPIFormulaDef = {
  id: 'acoustic-comfort-noise-impact-index',
  name: 'Acoustic Comfort Noise Impact Index',
  category: 'environment',
  formula: '(Wl + Sl) / (1 + (De/100))',
  params: ['Wl', 'Sl', 'De'],
  unit: 'dB',
  target: 35,
  logic: 'MIN',
  compute: (p) => (p.Wl + p.Sl) / (1 + (p.De / 100)),
};

const filtrationEfficiency: KPIFormulaDef = {
  id: 'filtration-efficiency',
  name: 'Filtration Efficiency',
  category: 'structure',
  formula: '100 * normalized_Fe / (1 + AVERAGE(Ep_range) / 100)',
  params: ['Fe', 'Ep'],
  unit: '%',
  target: 80,
  logic: 'STRICT',
  compute: (p) => p.Fe / (1 + (p.Ep / 100)),
  computeAggregate: (rows) => {
    if (rows.length === 0) return 0;
    
    // Extract parameter values
    const feValues = rows.map(r => r.Fe || 0);
    const epValues = rows.map(r => r.Ep || 0);
    
    // Calculate averages using only non-zero values for each parameter
    const feNonZero = feValues.filter(v => v !== 0);
    const epNonZero = epValues.filter(v => v !== 0);
    
    const avgFe = feNonZero.length > 0 ? feNonZero.reduce((a, b) => a + b, 0) / feNonZero.length : 0;
    const avgEp = epNonZero.length > 0 ? epNonZero.reduce((a, b) => a + b, 0) / epNonZero.length : 0;
    
    // Find min/max for normalization (use all values including zeros)
    const minFe = Math.min(...feValues);
    const maxFe = Math.max(...feValues);
    const feRange = maxFe - minFe;
    
    // Normalize the average: (AVERAGE(Fe) - MIN(Fe)) / (MAX(Fe) - MIN(Fe))
    const normalizedFe = feRange !== 0 ? (avgFe - minFe) / feRange : 0;
    
    // Apply formula: 100 * normalized_Fe / (1 + AVERAGE(Ep) / 100)
    return 100 * normalizedFe / (1 + (avgEp / 100));
  },
};

// ---------------------------------------------------------------------------
// 4. Exported registry
// ---------------------------------------------------------------------------

/** All KPI definitions, ordered by category. */
export const KPI_FORMULAS: KPIFormulaDef[] = [
  // Program
  effectiveProgrammaticArea,
  programmaticProximityIndex,
  resourceConsumptionIntensityRatio,
  // Structure (updated)
  structuralEfficiencyPerformance,
  solarControlPerformance,
  filtrationEfficiency,
  // Environment
  thermalComfortComplianceRate,
  airPurificationEffectiveness,
  acousticComfortNoiseImpactIndex,
];

/** Convenience: formulas grouped by dashboard category. */
export const KPI_BY_CATEGORY: Record<KPICategory, KPIFormulaDef[]> = {
  program:     KPI_FORMULAS.filter(k => k.category === 'program'),
  structure:   KPI_FORMULAS.filter(k => k.category === 'structure'),
  environment: KPI_FORMULAS.filter(k => k.category === 'environment'),
};

/** Lookup a formula def by id. */
export const KPI_BY_ID = new Map(KPI_FORMULAS.map(k => [k.id, k]));

// ---------------------------------------------------------------------------
// 5. Compute helpers
// ---------------------------------------------------------------------------

export interface ComputedKPI {
  id: string;
  name: string;
  category: KPICategory;
  value: number;
  unit: string;
  formula: string;
  target: number;
  logic: KPILogic;
}

/**
 * ENV_PAR variables that should default to 1 (not 0) when not yet available.
 * This prevents division-by-zero and zeroed-out formulas until the
 * environment parameter sheet is wired up.
 */
const ENV_DEFAULT_1: Set<string> = new Set(['Ir', 'Ep', 'Ne', 'Wl']);

/**
 * Compute a single KPI value from one set of parameter values.
 */
export function computeKPI(def: KPIFormulaDef, params: ParamValues): number {
  // Ensure every required param exists; ENV_PAR defaults to 1
  const safe: ParamValues = {};
  for (const v of def.params) {
    safe[v] = params[v] ?? (ENV_DEFAULT_1.has(v) ? 1 : 0);
  }
  return def.compute(safe);
}

/**
 * Compute all KPIs for a single row of parameter values.
 * Returns an array of ComputedKPI objects.
 */
export function computeAllKPIs(params: ParamValues): ComputedKPI[] {
  return KPI_FORMULAS.map(def => ({
    id: def.id,
    name: def.name,
    category: def.category,
    value: computeKPI(def, params),
    unit: def.unit,
    formula: def.formula,
    target: def.target,
    logic: def.logic,
  }));
}

/**
 * Compute aggregate KPIs (like PPI) that need multiple rows.
 * Falls back to per-row computation when no aggregate function is defined.
 */
export function computeAggregateKPIs(
  rows: ParamValues[],
  category?: KPICategory,
): ComputedKPI[] {
  const defs = category ? KPI_BY_CATEGORY[category] : KPI_FORMULAS;

  return defs.map(def => {
    let value: number;

    if (def.computeAggregate) {
      value = def.computeAggregate(rows);
    } else if (rows.length > 0) {
      // Average the per-row values as a sensible default
      const sum = rows.reduce((acc, r) => acc + computeKPI(def, r), 0);
      value = sum / rows.length;
    } else {
      value = 0;
    }

    return {
      id: def.id,
      name: def.name,
      category: def.category,
      value,
      unit: def.unit,
      formula: def.formula,
      target: def.target,
    };
  });
}

/**
 * Convert a parameter full-name → value record into the short-variable keyed
 * ParamValues expected by compute functions.
 *
 * Accepts either full names (`PRG_PAR_Area`) or short aliases (`Ar`).
 */
/**
 * Convert a parameter full-name → value record into the short-variable keyed
 * ParamValues expected by compute functions.
 *
 * Accepts either full names (`PRG_PAR_Area`) or short aliases (`Ar`).
 *
 * Special handling:
 * - Strips unit suffixes like " m²" from area values
 * - Parses "{20.2, 32.1, 2.3}" arrays for DependenciesDistance:
 *   stores Σ(1/d) so the PPI aggregate can just sum them
 * - Parses percentage strings like "8.0%" by dropping the '%'
 */
function parseNumericValue(rawVal: number | string): number {
  if (typeof rawVal === 'number') return rawVal;
  // Strip everything that isn't digit, dot, minus, or comma
  const cleaned = String(rawVal).replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const num = Number(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

function parseArrayToSumInverse(rawVal: number | string): number {
  const str = String(rawVal);
  // Match numbers inside "{x, y, z}" or just a plain number
  const matches = str.match(/-?\d+\.?\d*/g);
  if (!matches || matches.length === 0) return 0;
  let sum = 0;
  for (const m of matches) {
    const v = Number(m);
    if (v !== 0) sum += 1 / v;
  }
  return sum;
}

export function toParamValues(raw: Record<string, number | string>): ParamValues {
  const result: ParamValues = {};

  for (const [key, rawVal] of Object.entries(raw)) {
    // Try as full name first
    const byName = PARAM_BY_NAME.get(key);
    const varName = byName?.variable;
    const paramKey = varName || (PARAM_BY_VAR.has(key) ? key : null);
    if (!paramKey) continue;

    // Special handling for DependenciesDistance arrays:
    // Store Σ(1/d) so aggregate PPI can just sum across rows
    if (key === 'PRG_PAR_DependenciesDistance' || paramKey === 'Da') {
      result[paramKey] = parseArrayToSumInverse(rawVal);
      continue;
    }
    // IdealDependenciesDistance: store 1/value
    if (key === 'PRG_PAR_IdealDependenciesDistance' || paramKey === 'Di') {
      const num = parseNumericValue(rawVal);
      result[paramKey] = num !== 0 ? 1 / num : 0;
      continue;
    }

    result[paramKey] = parseNumericValue(rawVal);
  }

  return result;
}

/**
 * Update KPI target values and logic from the FORMULA sheet.
 * Matches KPI names from the sheet with KPI definitions and updates their targets and logic.
 */
export function updateKPITargets(formulaData: Record<string, { target: number; logic: 'MAX' | 'MIN' | 'STRICT' }>): void {
  for (const def of KPI_FORMULAS) {
    // Try to match by exact name
    if (formulaData[def.name] !== undefined) {
      def.target = formulaData[def.name].target;
      def.logic = formulaData[def.name].logic;
      continue;
    }

    // Try to match by normalized name (lowercase, replace hyphens with spaces)
    const normalizedName = def.name.toLowerCase();
    for (const [sheetName, data] of Object.entries(formulaData)) {
      if (sheetName.toLowerCase() === normalizedName) {
        def.target = data.target;
        def.logic = data.logic;
        break;
      }
    }
  }

  // Rebuild KPI_BY_CATEGORY to reflect updated targets and logic
  KPI_BY_CATEGORY.program     = KPI_FORMULAS.filter(k => k.category === 'program');
  KPI_BY_CATEGORY.structure   = KPI_FORMULAS.filter(k => k.category === 'structure');
  KPI_BY_CATEGORY.environment = KPI_FORMULAS.filter(k => k.category === 'environment');
}

/**
 * Evaluate if a KPI value is within acceptable range based on its logic type.
 * Returns { withinMargin, acceptable }
 * - withinMargin: true if within ±10% of target (used for visual styling)
 * - acceptable: true if the value meets the logic criteria (green status)
 */
export function evaluateKPIStatus(
  value: number,
  target: number,
  logic: KPILogic,
): { withinMargin: boolean; acceptable: boolean } {
  if (target === 0) {
    return { withinMargin: value === 0, acceptable: value === 0 };
  }

  if (logic === 'STRICT') {
    // Within ±10% of target
    const margin = Math.abs(target) * 0.1;
    const withinMargin = Math.abs(value - target) <= margin;
    return { withinMargin, acceptable: withinMargin };
  }

  if (logic === 'MAX') {
    // Higher is better
    // - If value >= target: green (within or exceeded)
    // - If value is within 10% below target: still acceptable (withinMargin)
    // - If value is > 10% below target: red
    const margin = Math.abs(target) * 0.1;
    const withinMargin = value >= target - margin;
    const acceptable = value >= target || (value >= target - margin);
    return { withinMargin, acceptable };
  }

  if (logic === 'MIN') {
    // Lower is better
    // - If value <= target: green (within or below)
    // - If value is within 10% above target: still acceptable (withinMargin)
    // - If value is > 10% above target: red
    const margin = Math.abs(target) * 0.1;
    const withinMargin = value <= target + margin;
    const acceptable = value <= target || (value <= target + margin);
    return { withinMargin, acceptable };
  }

  return { withinMargin: false, acceptable: false };
}

