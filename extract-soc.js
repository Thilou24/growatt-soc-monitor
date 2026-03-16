const { chromium } = require('playwright');

async function extractSOC() {
  let browser;
  try {
    console.log('[PLAYWRIGHT] Launching browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('[PLAYWRIGHT] Navigating to login...');
    await page.goto('https://server.growatt.com/login', { waitUntil: 'networkidle' });
    
    console.log('[PLAYWRIGHT] Filling User Name...');
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('Thilou24');
      console.log('[PLAYWRIGHT] Filling Password...');
      await inputs[1].fill('LaNatEst1TempleShi');
    }
    
    console.log('[PLAYWRIGHT] Clicking Login button...');
    await page.click('button:has-text("Login")');
    
    console.log('[PLAYWRIGHT] Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 });
    
    console.log('[PLAYWRIGHT] Extracting SOC...');
    const soc = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/(\d{1,3})\s*%/);
      return match ? match[1] : null;
    });
    
    console.log('[PLAYWRIGHT] ✅ SOC FOUND: ' + soc + '%');
    
    if (soc && process.env.HOSTINGER_WEBHOOK_URL) {
      console.log('[PLAYWRIGHT] Sending to Hostinger...');
      const url = process.env.HOSTINGER_WEBHOOK_URL + '&soc=' + soc + '&timestamp=' + new Date().toISOString();
      const response = await page.goto(url);
      console.log('[PLAYWRIGHT] Response: ' + response.status());
    }
    
  } catch (error) {
    console.error('[PLAYWRIGHT] ❌ ERROR: ' + error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

extractSOC();
