// small CSV splitter that handles quoted fields (drops quotes)
function splitCsvLine(line) {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // handle escaped quotes "" -> " inside quoted field
      if (inQuotes && line[i+1] === '"') {
        cur += '"';
        i++; // skip the escaped quote
        continue;
      }
      inQuotes = !inQuotes;
      continue; // drop surrounding quotes
    }
    if (ch === ',' && !inQuotes) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}

module.exports = { splitCsvLine };