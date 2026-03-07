/**
 * Google Sheets API Service
 * Fetches KPI data from the published Google Sheet
 */

const PUBLISHED_SHEET_ID =
  import.meta.env.VITE_GOOGLE_SHEETS_PUBLISHED_ID ||
  '2PACX-1vQJyHJ_3Aj9l9YbfZlDatXoptBXyXJOplk2Jfna84XI4PWYslXOqftPkuN5QT_ygffxYZMPj4gE012c';
const PUBLISHED_BASE_URL = 'https://docs.google.com/spreadsheets/d/e';

const SHEET_GIDS: Record<'data' | 'structure' | 'program', string> = {
  data: '846484099',
  structure: '1045283988',
  program: '631520491',
};

/** GID for the FORMULA sheet with target values */
const FORMULA_GID = '0';

/** GID for the raw STR_PAR_* parameters sheet */
const STRUCTURE_PARAMS_GID = '227623084';

/** GID for the raw PRG_PAR_* parameters sheet */
const PROGRAM_PARAMS_GID = '486267241';

interface SheetData {
  values: string[][];
}

interface KPI {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface DataRow {
  week: string;
  scenario: string;
  kpis: KPI[];
  spaceName?: string;
}

interface ParsedSheetData {
  weeks: string[];
  scenarios: string[];
  data: DataRow[];
  kpiNames: string[];
  targets?: number[];
  targetsByScenario?: Record<string, number[]>;
}

/**
 * Fetch a specific sheet from Google Sheets
 */
function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(text: string): string[][] {
  if (!text.trim()) return [];
  return text
    .split(/\r?\n/)
    .filter(line => line.length > 0)
    .map(line => parseCsvRow(line));
}

async function fetchSheet(sheetCategory: 'data' | 'structure' | 'program'): Promise<string[][]> {
  try {
    const gid = SHEET_GIDS[sheetCategory];
    const url = `${PUBLISHED_BASE_URL}/${PUBLISHED_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return parseCsv(csvText);
  } catch (error) {
    console.error(`Error fetching ${sheetCategory} sheet:`, error);
    return [];
  }
}

/**
 * Fetch a sheet by arbitrary GID
 */
async function fetchSheetByGid(gid: string): Promise<string[][]> {
  try {
    const url = `${PUBLISHED_BASE_URL}/${PUBLISHED_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet (gid=${gid}): ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCsv(csvText);
  } catch (error) {
    console.error(`Error fetching sheet gid=${gid}:`, error);
    return [];
  }
}

/**

 * Parse sheet data with Week | Scenario | KPI values format
 * Row 1: Headers (Week | Scenario | KPI_Name_1 | KPI_Name_2 | ...)
 * Row 2: Units (- | - | unit_1 | unit_2 | ...)
 * Row 3+: Data (Week_X | Scenario_Name | value_1 | value_2 | ...)
 */
function parseSheetData(rows: string[][], targetRowIndexes: number[] = []): ParsedSheetData {
  if (rows.length < 3) return { weeks: [], scenarios: [], data: [], kpiNames: [], targets: [], targetsByScenario: {} };
  
  const headerRow = rows[0];
  const unitsRow = rows[1];
  
  // Extract KPI names and units from headers (starting from column C)
  const kpiNames = headerRow.slice(2).map(name => name || '');
  const units = unitsRow.slice(2).map(unit => unit || '');
  
  const weeks = new Set<string>();
  const scenarios = new Set<string>();
  const dataRows: DataRow[] = [];
  
  // Parse data rows (starting from row 3)
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;
    
    const week = row[0]?.trim() || '';
    const scenario = row[1]?.trim() || '';
    
    if (!week || !scenario) continue;
    
    weeks.add(week);
    scenarios.add(scenario);
    
    // Parse KPI values
    const kpis: KPI[] = [];
    for (let j = 0; j < kpiNames.length; j++) {
      const valueStr = row[2 + j]?.trim() || '';
      const value = isNaN(Number(valueStr)) ? valueStr : Number(valueStr);
      
      kpis.push({
        id: kpiNames[j].toLowerCase().replace(/\s+/g, '-'),
        name: kpiNames[j],
        value,
        unit: units[j] || '',
        status: 'good', // Default; can be enhanced with targets
      });
    }
    
    dataRows.push({
      week,
      scenario,
      kpis,
    });
  }
  
  const targetsByScenario: Record<string, number[]> = {};
  targetRowIndexes.forEach((rowIndex) => {
    const row = rows[rowIndex];
    if (!row) return;
    const scenarioLabel = row[1]?.trim() || '';
    if (!scenarioLabel || !/(summer|winter|peak)/i.test(scenarioLabel)) return;
    const targets = kpiNames.map((_, index) => {
      const rawValue = String(row[2 + index] || '').replace(/,/g, '').trim();
      const parsed = Number(rawValue);
      return Number.isNaN(parsed) ? 0 : parsed;
    });
    targetsByScenario[scenarioLabel] = targets;
  });

  return {
    weeks: Array.from(weeks),
    scenarios: Array.from(scenarios),
    data: dataRows,
    kpiNames,
    targets: [],
    targetsByScenario,
  };
}

function parseProgramSheetData(rows: string[][]): ParsedSheetData {
  if (rows.length < 4) {
    return { weeks: [], scenarios: [], data: [], kpiNames: [], targets: [] };
  }
  
  const headerRow = rows[0];
  
  // Extract KPI names from columns E+ (index 4+), skip column D (space_name)
  const kpiNames = headerRow.slice(4).map(name => name || '');
  
  const weeks = new Set<string>();
  const scenarios = new Set<string>(); // Will store Column C values
  const dataRows: DataRow[] = [];
  
  // Parse data rows 4-25 (indices 3-24)
  for (let i = 3; i < Math.min(25, rows.length); i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;
    
    const week = row[0]?.trim() || '';
    const columnC = row[2]?.trim() || '';
    const spaceName = row[3]?.trim() || '';
    
    // Only require columnC to be non-empty
    if (!columnC) continue;
    
    weeks.add(week || 'default');
    scenarios.add(columnC);
    
    // Parse KPI values from columns E+ (index 4+)
    const kpis: KPI[] = [];
    for (let j = 0; j < kpiNames.length; j++) {
      const valueStr = row[4 + j]?.trim() || '';
      const value = isNaN(Number(valueStr)) ? valueStr : Number(valueStr);
      
      kpis.push({
        id: kpiNames[j].toLowerCase().replace(/\s+/g, '-'),
        name: kpiNames[j],
        value,
        unit: '',
        status: 'good',
      });
    }
    
    dataRows.push({
      week: week || 'default',
      scenario: columnC,
      kpis,
      spaceName,
    });
  }
  
  const targetRow = rows[26] || [];
  const targets = kpiNames.map((_, index) => {
    const rawValue = String(targetRow[4 + index] || '').replace(/,/g, '').trim();
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? 0 : parsed;
  });

  return {
    weeks: Array.from(weeks),
    scenarios: Array.from(scenarios),
    data: dataRows,
    kpiNames,
    targets,
  };
}

/**
 * Fetch and parse data for a specific category
 */
export async function fetchKPIsByCategory(category: 'data' | 'structure' | 'program' | 'vitals'): Promise<ParsedSheetData> {
  if (category === 'vitals') {
    return { weeks: [], scenarios: [], data: [], kpiNames: [], targets: [] };
  }

  const rows = await fetchSheet(category);
  
  // Use specialized parsing for PROGRAM sheet
  if (category === 'program') {
    return parseProgramSheetData(rows);
  }

  if (category === 'structure') {
    return parseSheetData(rows, [10, 11]);
  }

  if (category === 'data') {
    return parseSheetData(rows, [18, 19]);
  }

  return parseSheetData(rows);
}

/**
 * Get KPIs for a specific week and scenario
 */
export function getKPIsForSelection(sheetData: ParsedSheetData, week: string, scenario: string): KPI[] {
  const row = sheetData.data.find(r => r.week === week && r.scenario === scenario);
  return row?.kpis || [];
}

// ---------------------------------------------------------------------------
// Parameter extraction helpers  (used by the formula engine)
// ---------------------------------------------------------------------------

import {
  PARAMETERS,
  type ParamValues,
  toParamValues,
} from './kpiFormulas';

/**
 * Extract raw parameter values from a ParsedSheetData row.
 *
 * The sheet column headers (kpiNames) are matched against parameter full names
 * (e.g. `PRG_PAR_Area`) or labels (e.g. `Area`).  The returned ParamValues
 * object is keyed by the short variable alias (e.g. `Ar`).
 */
export function extractParamValues(
  kpiNames: string[],
  kpis: KPI[],
): ParamValues {
  const raw: Record<string, number | string> = {};

  for (let i = 0; i < kpiNames.length; i++) {
    const colName = kpiNames[i]?.trim();
    const kpi = kpis[i];
    if (!colName || !kpi) continue;

    // Try matching by full parameter name first
    const byName = PARAMETERS.find(p => p.name === colName);
    if (byName) {
      raw[byName.name] = kpi.value;
      continue;
    }

    // Fallback: match by label
    const byLabel = PARAMETERS.find(
      p => p.label.toLowerCase() === colName.toLowerCase(),
    );
    if (byLabel) {
      raw[byLabel.name] = kpi.value;
    }
  }

  return toParamValues(raw);
}

/**
 * Extract parameter values for every data row in a ParsedSheetData result.
 * Returns an array of `{ week, scenario, params }` for downstream computation.
 */
export function extractAllParamRows(
  sheetData: ParsedSheetData,
): Array<{ week: string; scenario: string; spaceName?: string; params: ParamValues }> {
  return sheetData.data.map(row => ({
    week: row.week,
    scenario: row.scenario,
    spaceName: row.spaceName,
    params: extractParamValues(sheetData.kpiNames, row.kpis),
  }));
}

// ---------------------------------------------------------------------------
// Structure raw-parameter sheet  (GID 227623084)
// ---------------------------------------------------------------------------

export interface StructureParamRow {
  week: string;
  scenario: string;
  params: ParamValues;
}

/**
 * Fetch the raw STR_PAR_* parameters sheet and return typed rows.
 * Sheet layout: Week | Scenario | STR_PAR_HeatReduction | ... | STR_PAR_NoiseInterior
 */
export async function fetchStructureParams(): Promise<{
  weeks: string[];
  scenarios: string[];
  rows: StructureParamRow[];
}> {
  const csvRows = await fetchSheetByGid(STRUCTURE_PARAMS_GID);
  if (csvRows.length < 2) return { weeks: [], scenarios: [], rows: [] };

  const headerRow = csvRows[0];
  // Column names from C onward are the STR_PAR_* parameter names
  const paramNames = headerRow.slice(2).map(h => h?.trim() || '');

  const weeks = new Set<string>();
  const scenarios = new Set<string>();
  const rows: StructureParamRow[] = [];

  for (let i = 1; i < csvRows.length; i++) {
    const row = csvRows[i];
    if (!row || row.length < 3) continue;

    const week = row[0]?.trim() || '';
    const scenario = row[1]?.trim() || '';
    if (!week || !scenario) continue;

    weeks.add(week);
    scenarios.add(scenario);

    const raw: Record<string, number | string> = {};
    for (let j = 0; j < paramNames.length; j++) {
      const name = paramNames[j];
      const val = row[2 + j]?.trim() || '';
      if (name) raw[name] = val;
    }

    rows.push({
      week,
      scenario,
      params: toParamValues(raw),
    });
  }

  return {
    weeks: Array.from(weeks),
    scenarios: Array.from(scenarios),
    rows,
  };
}

/**
 * Fetch the raw PRG_PAR_* parameters sheet and return typed rows.
 * Sheet layout: Week | Scenario | PRG_PAR_Area | ... | PRG_PAR_GeometryWeight
 */
export async function fetchProgramParams(): Promise<{
  rows: ParamValues[];
}> {
  const csvRows = await fetchSheetByGid(PROGRAM_PARAMS_GID);
  if (csvRows.length < 2) return { rows: [] };

  const headerRow = csvRows[0];
  // Column names from B onward are the PRG_PAR_* parameter names
  // Sheet layout: program | PRG_PAR_Area | PRG_PAR_UseRatio | ...
  const paramNames = headerRow.slice(1).map(h => h?.trim() || '');

  const rows: ParamValues[] = [];

  for (let i = 1; i < csvRows.length; i++) {
    const row = csvRows[i];
    if (!row || row.length < 2) continue;

    const raw: Record<string, number | string> = {};
    for (let j = 0; j < paramNames.length; j++) {
      const name = paramNames[j];
      const val = row[1 + j]?.trim() || '';
      if (name) raw[name] = val;
    }

    rows.push(toParamValues(raw));
  }

  return {
    rows,
  };
}

/**
 * Fetch KPI target values from the FORMULA sheet
 * Column B contains KPI names, Column F contains target values, Column G contains logic type
 * Logic types: MAX (higher is better), MIN (lower is better), STRICT (within ±10%)
 * Returns a mapping of KPI name -> { target, logic }
 */
export async function fetchFormulaTargets(): Promise<Record<string, { target: number; logic: 'MAX' | 'MIN' | 'STRICT' }>> {
  const csvRows = await fetchSheetByGid(FORMULA_GID);
  if (csvRows.length < 3) return {};

  const targets: Record<string, { target: number; logic: 'MAX' | 'MIN' | 'STRICT' }> = {};

  // Start from row 3 (index 2), read until we hit an empty KPI name
  for (let i = 2; i < csvRows.length; i++) {
    const row = csvRows[i];
    if (!row || row.length < 2) continue;

    const kpiName = row[1]?.trim() || ''; // Column B
    if (!kpiName) break; // Stop at first empty KPI name

    // For target, we need to handle cases where the value may span multiple columns
    // due to embedded commas (e.g., "110,000.00 m²" might be split across columns)
    // The target is typically in column F (index 5), but may extend to index 6 if quoted
    let targetStr = '';
    let logicStr = '';
    
    // Try to extract target and logic, accounting for values that may span columns
    if (row.length >= 7) {
      // Standard case: target in F (index 5), logic in G (index 6)
      targetStr = row[5]?.trim() || '';
      logicStr = row[6]?.trim().toUpperCase() || 'STRICT';
      
      // Check if the target looks incomplete (quoted value that was split)
      if (targetStr.startsWith('"') && !targetStr.endsWith('"')) {
        // The value was split by comma; reconstruct it
        let j = 5;
        while (j < row.length && !targetStr.endsWith('"')) {
          j++;
          if (j < row.length) {
            targetStr += ',' + (row[j]?.trim() || '');
          }
        }
        // Now logicStr should come after the reconstructed target
        logicStr = row[j + 1]?.trim().toUpperCase() || 'STRICT';
      }
    }

    // Clean up the target string: remove quotes and unit labels (like "m²")
    // Extract just the numeric part
    const numericMatch = targetStr.match(/-?[\d.,]+/);
    const targetValue = numericMatch 
      ? Number(numericMatch[0].replace(/,/g, '').trim())
      : NaN;

    if (!Number.isNaN(targetValue)) {
      const logic = (['MAX', 'MIN', 'STRICT'].includes(logicStr) ? logicStr : 'STRICT') as 'MAX' | 'MIN' | 'STRICT';
      targets[kpiName] = { target: targetValue, logic };
      console.log(`✅ Fetched target for "${kpiName}": ${targetValue} (logic: ${logic})`);
    } else {
      console.log(`⚠️ Failed to parse target for "${kpiName}": raw="${targetStr}"`);
    }
  }

  return targets;
}

