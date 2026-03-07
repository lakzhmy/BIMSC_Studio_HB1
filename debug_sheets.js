/**
 * Debug script to test target parsing
 */

const PUBLISHED_SHEET_ID = '2PACX-1vQJyHJ_3Aj9l9YbfZlDatXoptBXyXJOplk2Jfna84XI4PWYslXOqftPkuN5QT_ygffxYZMPj4gE012c';
const PUBLISHED_BASE_URL = 'https://docs.google.com/spreadsheets/d/e';
const FORMULA_GID = '0';

async function fetchSheet(gid, label) {
  try {
    const url = `${PUBLISHED_BASE_URL}/${PUBLISHED_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;
    console.log(`\nFetching ${label}: ${url}`);
    
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const rows = csvText.split('\n').map(line => line.split(','));
    
    console.log(`\n=== IMPROVED FORMULA TARGET PARSING ===`);
    
    // Parse like the IMPROVED function does
    for (let i = 2; i < Math.min(12, rows.length); i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;

      const kpiName = row[1]?.trim() || '';
      if (!kpiName) break;

      let targetStr = '';
      let logicStr = '';
      
      if (row.length >= 7) {
        targetStr = row[5]?.trim() || '';
        logicStr = row[6]?.trim().toUpperCase() || 'STRICT';
        
        // Check if the target looks incomplete (quoted value that was split)
        console.log(`  Row ${i}: Initial targetStr="${targetStr}", logicStr="${logicStr}"`);
        
        if (targetStr.startsWith('"') && !targetStr.endsWith('"')) {
          console.log(`    → Detected split quoted value, reconstructing...`);
          let j = 5;
          while (j < row.length && !targetStr.endsWith('"')) {
            j++;
            if (j < row.length) {
              targetStr += ',' + (row[j]?.trim() || '');
              console.log(`    → Appended row[${j}]: targetStr="${targetStr}"`);
            }
          }
          logicStr = row[j + 1]?.trim().toUpperCase() || 'STRICT';
          console.log(`    → Final targetStr="${targetStr}", logicStr="${logicStr}"`);
        }
      }

      // Extract numeric part
      const numericMatch = targetStr.match(/-?[\d.,]+/);
      const targetValue = numericMatch 
        ? Number(numericMatch[0].replace(/,/g, '').trim())
        : NaN;

      const logic = (['MAX', 'MIN', 'STRICT'].includes(logicStr) ? logicStr : 'STRICT');
      
      if (!Number.isNaN(targetValue)) {
        console.log(`✅ KPI="${kpiName}" | Target=${targetValue} | Logic=${logic}`);
      } else {
        console.log(`❌ KPI="${kpiName}" | Failed to parse target: "${targetStr}" | Logic=${logicStr}`);
      }
    }
    
  } catch (error) {
    console.error(`Error:`, error);
  }
}

fetchSheet(FORMULA_GID, 'FORMULAS');

