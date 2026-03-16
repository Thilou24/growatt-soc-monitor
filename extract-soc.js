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
    await page.fill('#ryl_loginAccount', 'Thilou24');
    
    console.log('[PLAYWRIGHT] Filling Password...');
    await page.fill('#val_loginPwd', 'LaNatEst1TempleShi');
    
    console.log('[PLAYWRIGHT] Clicking Login...');
    await page.click('button.loginBtn');
    
    console.log('[PLAYWRIGHT] Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 });
    
    console.log('[PLAYWRIGHT] Extracting SOC...');
    const soc = await page.evaluate(() => {
      const text = document.body.innerText;
      // Chercher "SoC: XX%" spécifiquement
      const match = text.match(/SoC[:\s]+(\d{1,3})\s*%/i);
      return match ? match[1] : null;
    });
    
    console.log('[PLAYWRIGHT] ✅ SOC FOUND: ' + soc + '%');
    
    if (soc && process.env.HOSTINGER_WEBHOOK_URL) {
      console.log('[PLAYWRIGHT] Sending to Hostinger...');
      try {
        const url = process.env.HOSTINGER_WEBHOOK_URL + '&soc=' + soc + '&timestamp=' + new Date().toISOString();
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        console.log('[PLAYWRIGHT] Response: ' + response.status());
      } catch (err) {
        console.log('[PLAYWRIGHT] Send error (may be firewall): ' + err.message);
      }
    }
    
  } catch (error) {
    console.error('[PLAYWRIGHT] ❌ ERROR: ' + error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

extractSOC();
