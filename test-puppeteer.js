import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text(), msg.location().url);
    }
  });
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
