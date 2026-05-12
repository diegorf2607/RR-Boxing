const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1960, height: 1200, deviceScaleFactor: 1 });

  const fileUrl = 'file:///' + path.resolve(__dirname, 'linkedin-finanzas.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Give scaleCards() a tick to run, plus a small buffer for fonts/render
  await new Promise(r => setTimeout(r, 800));

  const cards = ['finanzas', 'finanzas-jobs', 'marketing', 'comercial'];
  for (const id of cards) {
    const el = await page.$('#' + id);
    if (!el) {
      console.error('Card not found:', id);
      continue;
    }
    const out = `myworkin-${id}.png`;
    await el.screenshot({ path: out });
    console.log('Saved ' + out);
  }

  await browser.close();
})();
