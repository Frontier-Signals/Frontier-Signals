// Optional browser regression: install Playwright, or set PLAYWRIGHT_MODULE to
// its installed path. PLAYWRIGHT_CHANNEL defaults to msedge on Windows.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');

(async () => {
    const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
    const snapshots = [];
    try {
        for (const timezoneId of ['UTC', 'America/Denver', 'Asia/Kolkata', 'Pacific/Auckland']) {
            const context = await browser.newContext({ timezoneId, viewport: { width: 1600, height: 1100 } });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(String(error)));
            await page.route('**/*', route => /^(file:|data:)/.test(route.request().url()) ? route.continue() : route.abort());
            await page.addInitScript(() => {
                globalThis.chartText = [];
                const originalFill = CanvasRenderingContext2D.prototype.fillText;
                CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
                    globalThis.chartText.push(String(text));
                    return originalFill.call(this, text, ...args);
                };
                const originalRead = CanvasRenderingContext2D.prototype.getImageData;
                CanvasRenderingContext2D.prototype.getImageData = function(...args) {
                    const result = originalRead.apply(this, args);
                    if (result.width === 1000 && result.height === 500) globalThis.textureReady = true;
                    return result;
                };
            });
            await page.goto(pathToFileURL(path.resolve(__dirname, '../pole-shift-star-chart.html')).href);
            await page.waitForFunction(() => globalThis.textureReady);
            await page.locator('#pssc-observe-date').fill('2026-01-01');
            await page.locator('#pssc-observe-date').dispatchEvent('change');
            await page.locator('#pssc-time-slider').evaluate(element => { element.value = '0'; element.dispatchEvent(new Event('input', { bubbles: true })); });
            assert.equal(await page.locator('#pssc-observe-time').inputValue(), '00:00');
            assert.equal(await page.locator('#pssc-time-slider-label').innerText(), '00:00 UTC');
            assert.equal(await page.locator('#pssc-solar-time').innerText(), '2025-12-31 17:20:00 (UTC-06:40:00)');
            const snapshot = await page.evaluate(() => ({
                solar: document.querySelector('#pssc-solar-time').textContent,
                sidereal: document.querySelector('#pssc-lst-label').textContent,
                image: document.querySelector('#pssc-map-canvas').toDataURL(),
            }));
            snapshot.image = createHash('sha256').update(snapshot.image).digest('hex');
            snapshots.push(snapshot);
            await page.getByRole('button', { name: 'Ben Davidson', exact: true }).click();
            assert.equal(await page.locator('#pssc-observe-time').inputValue(), '00:00');
            const changed = await page.locator('#pssc-solar-time').innerText();
            assert.notEqual(changed, snapshot.solar);
            console.log(`${timezoneId}: Davidson solar clock ${changed}`);
            const downloadEvent = page.waitForEvent('download');
            await page.locator('#pssc-download').click();
            assert.equal(await (await downloadEvent).failure(), null);
            const text = await page.evaluate(() => globalThis.chartText);
            assert.ok(text.includes('2026-01-01 00:00 UTC'));
            assert.ok(text.some(line => line.startsWith('Solar: 2025-12-31')));
            const popupEvent = page.waitForEvent('popup');
            await page.locator('#pssc-print-chart').click();
            const popup = await popupEvent;
            await popup.waitForLoadState();
            assert.equal(await popup.locator('img').count(), 1);
            assert.deepEqual(errors, []);
            await context.close();
        }
        for (const snapshot of snapshots) assert.deepEqual(snapshot, snapshots[0]);
        console.log('PASS: identical chart pixels, sidereal time, and solar time across four device time zones; UTC slider, pole changes, PNG and print labels verified.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
