import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/lc-final-dashboard.png' });
console.log('Dashboard OK');

await page.locator('button:has-text("Track Sleep")').first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/lc-final-track.png' });
console.log('Track OK');

console.log('Console errors:', errors.length, errors);
await browser.close();
