import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { generateMysqlDumpSql } from './export-to-mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  const distDir = path.join(rootDir, 'dist');
  const distIndex = path.join(distDir, 'index.html');
  if (!fs.existsSync(distIndex)) {
    throw new Error('Missing dist/index.html. Run "npm run build" first.');
  }

  const outBase = path.join(rootDir, 'hostinger-deploy');
  const outPublic = path.join(outBase, 'public_html');

  // Clean previous build output
  if (fs.existsSync(outBase)) {
    fs.rmSync(outBase, { recursive: true, force: true });
  }
  fs.mkdirSync(outPublic, { recursive: true });

  // 1. Copy compiled React/Vite dist/ into public_html/ and rename index.html -> app-shell.html
  copyDirRecursive(distDir, outPublic);
  const copiedIndex = path.join(outPublic, 'index.html');
  const appShellPath = path.join(outPublic, 'app-shell.html');
  if (fs.existsSync(copiedIndex)) {
    fs.renameSync(copiedIndex, appShellPath);
  }

  // 2. Copy PHP front controller & .htaccess
  fs.copyFileSync(
    path.join(rootDir, 'php-backend/public/.htaccess'),
    path.join(outPublic, '.htaccess')
  );
  fs.copyFileSync(
    path.join(rootDir, 'php-backend/public/index.php'),
    path.join(outPublic, 'index.php')
  );

  // 3. Copy PHP REST API backend (api/)
  copyDirRecursive(
    path.join(rootDir, 'php-backend/api'),
    path.join(outPublic, 'api')
  );

  // 4. Copy existing media uploads/
  const uploadsDest = path.join(outPublic, 'uploads');
  fs.mkdirSync(uploadsDest, { recursive: true });
  copyDirRecursive(path.join(rootDir, 'uploads'), uploadsDest);

  // 5. Generate live MySQL dump (schema + all exported SQLite records)
  const dumpSql = generateMysqlDumpSql();
  const sqlOutDeploy = path.join(outBase, 'database_mysql.sql');
  const sqlOutRepo = path.join(rootDir, 'php-backend/database/database_mysql.sql');
  fs.writeFileSync(sqlOutDeploy, dumpSql, 'utf-8');
  fs.writeFileSync(sqlOutRepo, dumpSql, 'utf-8');

  // 6. Write Hostinger Quick Deployment Guide
  const guide = `# Hostinger Premium Deployment Guide (PHP 8 + MySQL)

## Step 1: Create MySQL Database in Hostinger hPanel
1. Log in to **Hostinger hPanel** -> go to **Databases -> Management**.
2. Create a new MySQL Database (note your **Database Name**, **Username**, and **Password**).
3. Open **phpMyAdmin** for that database -> click **Import** -> select \`database_mysql.sql\` -> click **Import**.

## Step 2: Configure Database Credentials
Before or right after uploading, edit \`public_html/api/config/config.php\` (or create \`public_html/api/config/config.local.php\`):
\`\`\`php
<?php
return [
    'DB_HOST'    => 'localhost',
    'DB_NAME'    => 'u123456789_your_db_name',
    'DB_USER'    => 'u123456789_your_db_user',
    'DB_PASS'    => 'your_db_password',
    'JWT_SECRET' => 'change_this_to_a_long_random_secret_string_2026',
];
\`\`\`

## Step 3: Upload Files to \`public_html/\`
1. Open Hostinger **File Manager** -> open \`public_html\`.
2. Delete any default Hostinger \`default.php\` placeholder file.
3. Upload \`public_html.zip\` into \`public_html/\` -> right click -> **Extract** (make sure \`.htaccess\`, \`index.php\`, \`app-shell.html\`, \`api/\`, \`assets/\`, and \`uploads/\` sit directly inside \`public_html/\`, not inside an extra subfolder).
4. Ensure \`public_html/uploads/\` has permission \`755\`.

## Step 4: Verify Live Deployment
- Check API & DB health: \`https://yourdomain.com/api/health\`
- Check Admin Login: \`https://yourdomain.com/admin\` (default: \`admin@toufiqmotion.com\` / \`admin123\` — change password after login!)
- Check Dynamic Sitemap: \`https://yourdomain.com/sitemap.xml\`
- Check Dynamic Robots.txt: \`https://yourdomain.com/robots.txt\`
`;
  fs.writeFileSync(path.join(outBase, 'DEPLOY_HOSTINGER.md'), guide, 'utf-8');

  // 7. Create Linux-compatible ZIP (forward slashes '/' + includes .htaccess)
  const zipPath = path.join(outBase, 'public_html.zip');
  try {
    const entries = fs.readdirSync(outPublic);
    const quotedEntries = entries.map((e) => `"${e}"`).join(' ');
    if (process.platform === 'win32') {
      execSync(`tar -a -cf "${zipPath}" -C "${outPublic}" ${quotedEntries}`, { stdio: 'pipe' });
    } else {
      execSync(`cd "${outPublic}" && zip -r "${zipPath}" ${quotedEntries}`, { stdio: 'pipe' });
    }
    const sizeKb = (fs.statSync(zipPath).size / 1024).toFixed(1);
    console.log(`✅ Built Hostinger ZIP package: ${zipPath} (${sizeKb} KB)`);
  } catch (err: any) {
    console.warn('⚠️ ZIP creation skipped (folder ready at hostinger-deploy/public_html):', err?.message || err);
  }

  console.log(`✅ Hostinger deployment folder ready: ${outBase}`);
}

main();
