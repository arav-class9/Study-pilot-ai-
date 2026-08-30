import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });
  page.on('pageerror', err => {
    console.error('Page error:', err.toString());
  });
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to click "CREATE MY TIMETABLE"
  try {
    const btn = await page.$x("//button[contains(., 'CREATE MY TIMETABLE')]");
    if (btn.length > 0) {
      await btn[0].click();
      console.log('Clicked CREATE MY TIMETABLE');
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch(e) {
    console.error('Click error:', e);
  }
  await browser.close();
})();
