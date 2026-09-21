const XLSX = require('C:/Users/user/AppData/Roaming/npm/node_modules/xlsx');
const fs = require('fs');

function t(val) {
  if (!val || typeof val !== 'number') return '';
  const totalSec = Math.round(val * 86400);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return h + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

const wb = XLSX.readFile('Bickfaya Race Results 2026.xlsx');
const ws = wb.Sheets['Race Results-2026'];
const data = XLSX.utils.sheet_to_json(ws, {header:1});
const results = [];
data.slice(3).forEach(r => {
  if (!r[0] || typeof r[0] !== 'number') return;
  const catRank = r[5];
  const catRankStr = catRank === '\uD83C\uDFC6 Winner' ? '\uD83C\uDFC6' : (typeof catRank === 'number' ? '#' + catRank : '');
  results.push({
    place:    r[0],
    bib:      r[1],
    name:     r[2],
    gender:   r[3],
    category: r[4] || '',
    catRank:  catRankStr,
    team:     r[6] || '',
    gunTime:  t(r[7]),
    chipTime: t(r[8]),
    pace:     t(r[9])
  });
});

if (!fs.existsSync('public')) fs.mkdirSync('public');
fs.writeFileSync('public/results-data.json', JSON.stringify(results), 'utf8');
console.log('Written', results.length, 'rows');
console.log('Sample:', JSON.stringify(results[0]));
console.log('Last:', JSON.stringify(results[results.length - 1]));
