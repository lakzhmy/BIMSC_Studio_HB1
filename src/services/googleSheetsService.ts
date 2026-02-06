/**
 * Google Sheets API Service
 * Fetches KPI data from the published Google Sheet
 */

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

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
}

interface ParsedSheetData {
  weeks: string[];
  scenarios: string[];
  data: DataRow[];
  kpiNames: string[];
}

/**
 * Fetch a specific sheet from Google Sheets
 */
async function fetchSheet(sheetName: string): Promise<string[][]> {
  try {
    const url = `${API_URL}/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    
    const data: SheetData = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName} sheet:`, error);
    return [];
  }
}

/**
 * Parse sheet data with Week | Scenario | KPI values format
 * Row 1: Headers (Week | Scenario | KPI_Name_1 | KPI_Name_2 | ...)
 * Row 2: Units (- | - | unit_1 | unit_2 | ...)
 * Row 3+: Data (Week_X | Scenario_Name | value_1 | value_2 | ...)
 */
function parseSheetData(rows: string[][]): ParsedSheetData {
  if (rows.length < 3) return { weeks: [], scenarios: [], data: [], kpiNames: [] };
  
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
  
  return {
    weeks: Array.from(weeks),
    scenarios: Array.from(scenarios),
    data: dataRows,
    kpiNames,
  };
}

/**
 * Fetch and parse data for a specific category
 */
export async function fetchKPIsByCategory(category: 'data' | 'structure' | 'program' | 'vitals'): Promise<ParsedSheetData> {
  const sheetNameMap = {
    data: 'DATA',
    structure: 'STRUCTURE',
    program: 'PROGRAM',
    vitals: 'VITALS',
  };
  
  const rows = await fetchSheet(sheetNameMap[category]);
  return parseSheetData(rows);
}

/**
 * Get KPIs for a specific week and scenario
 */
export function getKPIsForSelection(sheetData: ParsedSheetData, week: string, scenario: string): KPI[] {
  const row = sheetData.data.find(r => r.week === week && r.scenario === scenario);
  return row?.kpis || [];
}
