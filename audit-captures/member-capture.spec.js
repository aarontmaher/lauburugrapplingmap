const { test, expect } = require('@playwright/test');

test('Member audit capture', async ({ page }) => {
  const SITE = 'https://aarontmaher.github.io/Chat-gpt/';
  const EMAIL = 'aaron.t.maher@gmail.com';
  const PASSWORD = 'Goldfighting!';

  // 1. Open site
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'audit-captures/01-guest-landing.png', fullPage: false });

  // 2. Click Create Account / Login
  const authBtn = page.locator('#authBtn');
  if (await authBtn.isVisible()) {
    await authBtn.click();
    await page.waitForTimeout(1000);
  }

  // 3. Fill login
  const emailInput = page.locator('#authEmail');
  const passInput = page.locator('#authPassword');
  const loginBtn = page.locator('#authLoginBtn');

  if (await emailInput.isVisible()) {
    await emailInput.fill(EMAIL);
    await passInput.fill(PASSWORD);
    await page.screenshot({ path: 'audit-captures/02-login-filled.png', fullPage: false });
    await loginBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'audit-captures/03-post-login.png', fullPage: false });
  }

  // 4. Reference view home screen
  const refTab = page.locator('[data-view="reference"]');
  if (await refTab.isVisible()) {
    await refTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'audit-captures/04-member-reference-home.png', fullPage: false });
  }

  // 5. Expand first section
  const firstSection = page.locator('.section-header').first();
  if (await firstSection.isVisible()) {
    await firstSection.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'audit-captures/05-section-expanded.png', fullPage: false });
  }

  // 6. Position Map
  const mapTab = page.locator('[data-view="graph3d"]');
  if (await mapTab.isVisible()) {
    await mapTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'audit-captures/06-position-map.png', fullPage: false });
  }

  // 7. AI Coach
  const aiBtn = page.locator('#aiToggleBtn');
  if (await aiBtn.isVisible()) {
    await aiBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'audit-captures/07-ai-coach.png', fullPage: false });
  }

  // 8. Belt dropdown
  const beltArea = page.locator('#beltArea');
  if (await beltArea.isVisible()) {
    await beltArea.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'audit-captures/08-belt-dropdown.png', fullPage: false });
  }

  // 9. Hamburger menu
  const menuBtn = page.locator('#headerMenuToggle');
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'audit-captures/09-hamburger-menu.png', fullPage: false });
  }

  // 10. Get member state summary
  const state = await page.evaluate(() => {
    return {
      authState: typeof AUTH_STATE !== 'undefined' ? AUTH_STATE : 'unknown',
      authUser: typeof AUTH_USER !== 'undefined' && AUTH_USER ? AUTH_USER.email : 'none',
      totalNodes: typeof STATE !== 'undefined' ? STATE.totalNodes : 0,
      progressCount: typeof STATE !== 'undefined' ? Object.keys(STATE.progress).length : 0,
      successLogCount: typeof STATE !== 'undefined' && STATE.successLog ? STATE.successLog.length : 0,
      recentCount: typeof STATE !== 'undefined' && STATE.recentViewed ? STATE.recentViewed.length : 0,
      belt: typeof window._getCurrentBelt === 'function' ? window._getCurrentBelt() : 'unknown',
      sections: typeof SECTIONS !== 'undefined' ? SECTIONS.length : 0,
      netNodes: typeof NET_NODES !== 'undefined' ? NET_NODES.length : 0,
    };
  });

  const fs = require('fs');
  fs.writeFileSync('audit-captures/member-state.json', JSON.stringify(state, null, 2));
  console.log('Member state:', JSON.stringify(state));
});
