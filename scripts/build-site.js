const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const files = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'think-biegger-og.svg',
];

const dirs = ['videos'];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(dist, file));
  }
}

for (const dir of dirs) {
  const source = path.join(root, dir);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(dist, dir), { recursive: true });
  }
}

execFileSync('zip', ['-qr', 'think-biegger-site.zip', 'dist'], {
  cwd: root,
  stdio: 'inherit',
});

console.log('Built dist/ and think-biegger-site.zip');
