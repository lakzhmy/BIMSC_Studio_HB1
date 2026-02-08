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
