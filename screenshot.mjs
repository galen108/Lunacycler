import { chromium } from 'playwright';
const BASE = 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/lc2-title.png' });
console.log('Title OK');

// Click "Begin Reading"
await page.click('button:has-text("Begin Reading")');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/lc2-abstract.png' });
console.log('Abstract OK');

// Navigate via sidebar § buttons
for (const [label, file] of [
  ['Literature Review', '/tmp/lc2-literature.png'],
  ['Mathematical Model', '/tmp/lc2-math.png'],
  ['Conclusion', '/tmp/lc2-conclusion.png'],
]) {
  await page.locator(`button:has-text("${label}")`).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: file });
  console.log(`${label} OK`);
}

console.log('Console errors:', errs.length === 0 ? 'none' : errs);
await browser.close();
