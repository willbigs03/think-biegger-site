const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');

const viewports = {
  desktop: { width: 1440, height: 1200 },
  mobile: { width: 390, height: 1200 },
};

async function main() {
  let server;
  let target = process.env.SITE_URL;

  if (!target) {
    const root = path.resolve(__dirname, 'dist');
    const port = Number(process.env.SITE_PORT || 8765);

    server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
      const requested = urlPath === '/' ? '/index.html' : urlPath;
      const filePath = path.join(root, requested);

      if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath);
      const type = {
        '.html': 'text/html; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.xml': 'application/xml',
        '.txt': 'text/plain; charset=utf-8',
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': type });
      fs.createReadStream(filePath).pipe(res);
    });

    await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
    target = `http://127.0.0.1:${port}/index.html`;
  }

  fs.mkdirSync('./screenshots', { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (const [name, viewport] of Object.entries(viewports)) {
      const page = await browser.newPage({ viewport });
      await page.goto(target, { waitUntil: 'networkidle' });

      const checks = {
        nav: await page.locator('.nav').isVisible(),
        access: Boolean(await page.locator('#access').boundingBox()),
        build: Boolean(await page.locator('#build').boundingBox()),
        horizontalOverflow: await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1
        ),
        brokenAnchors: await page.evaluate(() =>
          [...document.querySelectorAll('a[href^="#"]')]
            .map((anchor) => anchor.getAttribute('href'))
            .filter((href) => href !== '#' && !document.querySelector(href))
        ),
      };

      await page.screenshot({
        path: `./screenshots/think-biegger-${name}.png`,
        fullPage: false,
      });
      await page.close();

      if (!checks.nav || !checks.access || !checks.build || checks.horizontalOverflow || checks.brokenAnchors.length) {
        throw new Error(`${name} failed checks: ${JSON.stringify(checks)}`);
      }

      console.log(`${name}: passed`);
    }
  } finally {
    await browser.close();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
