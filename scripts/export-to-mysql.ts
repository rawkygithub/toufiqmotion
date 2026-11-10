import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db/index.js';
import { seedDatabase } from '../server/db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Ensure DB schema + seed are present and WAL is checkpointed cleanly
seedDatabase();
try {
  db.pragma('wal_checkpoint(TRUNCATE)');
} catch {
  // Ignore if locked or unavailable
}

const DATETIME_COLS = new Set([
  'created_at',
  'updated_at',
  'subscribed_at',
  'last_accessed',
  'last_detected',
  'last_clicked_at'
]);

function normalizeMysqlDateTime(val: string): string {
  const parsed = new Date(val);
  if (Number.isNaN(parsed.getTime())) return val;
  return parsed.toISOString().slice(0, 19).replace('T', ' ');
}

function escapeSqlValue(col: string, val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';

  let str = String(val);
  if (DATETIME_COLS.has(col) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
    str = normalizeMysqlDateTime(str);
  }

  // Standard MySQL string literal escaping
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\x1a/g, '\\Z');

  return `'${escaped}'`;
}

const TABLES_IN_ORDER = [
  'users',
  'categories',
  'articles',
  'comments',
  'newsletter_subscribers',
  'inquiries',
  'seo_redirects',
  'seo_crawl_errors',
  'seo_settings',
  'seo_search_queries',
  'seo_indexing_logs',
  'site_settings',
  'media',
  'pages',
  'affiliate_links',
  'affiliate_clicks'
];

export function generateMysqlDumpSql(): string {
  const schemaPath = path.join(rootDir, 'php-backend/database/schema_mysql.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  const lines: string[] = [
    schemaSql.trim(),
    '',
    '-- ==========================================================',
    `-- Live SQLite Export -> MySQL (Generated ${new Date().toISOString()})`,
    '-- ==========================================================',
    'SET NAMES utf8mb4;',
    'SET FOREIGN_KEY_CHECKS = 0;',
    ''
  ];

  let totalRows = 0;

  for (const table of TABLES_IN_ORDER) {
    const rows = db.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[];
    if (rows.length === 0) {
      lines.push(`-- Table \`${table}\`: 0 rows`);
      lines.push('');
      continue;
    }

    lines.push(`-- Table \`${table}\`: ${rows.length} rows`);
    const cols = Object.keys(rows[0]);
    const quotedCols = cols.map((c) => `\`${c}\``).join(', ');

    for (const row of rows) {
      const valuesSql = cols.map((c) => escapeSqlValue(c, row[c])).join(', ');
      lines.push(`INSERT INTO \`${table}\` (${quotedCols}) VALUES (${valuesSql}) ON DUPLICATE KEY UPDATE ${cols.filter((c) => c !== 'id' && c !== 'key').map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(', ') || `\`${cols[0]}\` = VALUES(\`${cols[0]}\`)`};`);
      totalRows++;
    }
    lines.push('');
  }

  lines.push('SET FOREIGN_KEY_CHECKS = 1;');
  lines.push(`-- Total exported rows: ${totalRows}`);
  return lines.join('\n');
}

// Run when executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const sql = generateMysqlDumpSql();
  const outPath = path.join(rootDir, 'php-backend/database/database_mysql.sql');
  fs.writeFileSync(outPath, sql, 'utf-8');
  console.log(`✅ Exported SQLite data + MySQL schema to: ${outPath} (${(Buffer.byteLength(sql, 'utf-8') / 1024).toFixed(1)} KB)`);
}

