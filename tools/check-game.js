const { chromium } = require('playwright');

const targetUrl = process.argv[2] || 'http://localhost:8000/game.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });
  try {
    await page.goto(targetUrl, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(5000);
  } catch (err) {
    console.error('Error while loading game:', err);
  } finally {
    await browser.close();
  }
})();