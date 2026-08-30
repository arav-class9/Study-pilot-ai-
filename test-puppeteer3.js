import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      console.error('Console error:', msg.text());
    }
  });
  page.on('pageerror', err => {
    console.error('Page error:', err.toString());
  });
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('CREATE MY TIMETABLE')) {
        await btn.click();
        console.log('Clicked!');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
  } catch(e) {
    console.error('Click error:', e);
  }
  await browser.close();
})();
