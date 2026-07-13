import { test, expect } from '@playwright/test';

test.describe('Retro Portfolio E2E Tests', () => {

  test('Boot & Desktop Load', async ({ page }) => {
    await page.goto('/');

    // Wait for the desktop folder icon to be visible (means loader has disappeared)
    const projectsIcon = page.locator('[data-finder-item-id="projects"]');
    await expect(projectsIcon).toBeVisible({ timeout: 15000 });

    // Verify other desktop icons and topbar are present
    const mediaHdIcon = page.locator('[data-finder-item-id="mediaHd"]');
    const trashIcon = page.locator('[data-finder-item-id="trash"]');
    
    await expect(mediaHdIcon).toBeVisible();
    await expect(trashIcon).toBeVisible();
  });

  test('Window Management', async ({ page }) => {
    await page.goto('/');

    const projectsIcon = page.locator('[data-finder-item-id="projects"]');
    await expect(projectsIcon).toBeVisible({ timeout: 15000 });

    // Double click to open Projects folder
    await projectsIcon.dblclick();

    // Verify the Projects window opens
    const windowEl = page.locator('[data-window-id="projects"]');
    await expect(windowEl).toBeVisible();

    // Find the close button (the first button in windowTop) and click it
    const closeBtn = windowEl.locator('[class*="windowTopButton"]').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Verify window is closed
    await expect(windowEl).not.toBeVisible();
  });

  test('BSOD Easter Egg Trigger', async ({ page }) => {
    await page.goto('/');

    const trashIcon = page.locator('[data-finder-item-id="trash"]');
    await expect(trashIcon).toBeVisible({ timeout: 15000 });

    // Click trash icon 5 times in quick succession to trigger SystemCrashOverlay (BSOD)
    for (let i = 0; i < 5; i++) {
      await trashIcon.click();
      await page.waitForTimeout(100);
    }

    // Verify BSOD Overlay is displayed using semantic aria-live attribute
    const bsodOverlay = page.locator('[aria-live="assertive"]');
    await expect(bsodOverlay).toBeVisible({ timeout: 10000 });

    // Wait for the 2-second bomb/SadMac lock period to end before dismissing
    await page.waitForTimeout(2200);

    // Press Enter to restart/dismiss the crash screen
    await page.keyboard.press('Enter');

    // Verify BSOD is gone and desktop is restored
    await expect(bsodOverlay).not.toBeVisible();
  });

  test('LocalStorage Position Persistence', async ({ page }) => {
    await page.goto('/');

    const projectsIcon = page.locator('[data-finder-item-id="projects"]');
    await expect(projectsIcon).toBeVisible({ timeout: 15000 });

    // Double click to open Projects folder
    await projectsIcon.dblclick();

    const windowEl = page.locator('[data-window-id="projects"]');
    await expect(windowEl).toBeVisible();

    // Get initial position of Projects window using the Framer Motion drag handle
    const dragHandle = page.locator('[class*="dragHandle"]').first();
    await expect(dragHandle).toBeVisible();

    const initialBox = await dragHandle.boundingBox();
    expect(initialBox).not.toBeNull();

    // Drag the window by moving mouse to empty space at x: 100, y: 100 to avoid interception
    await page.mouse.move(initialBox!.x + initialBox!.width / 2, initialBox!.y + initialBox!.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(150); // wait for drag gesture recognition threshold in framer-motion
    await page.mouse.move(100, 100, { steps: 15 });
    await page.mouse.up();

    // Wait 1 second to ensure throttled localStorage write finishes completely
    await page.waitForTimeout(1000);

    // Get the window position after dragging
    const handleBoxAfterDrag = await dragHandle.boundingBox();
    expect(handleBoxAfterDrag).not.toBeNull();

    // Reload the page
    await page.reload();

    // Open projects folder again
    const projectsIconReloaded = page.locator('[data-finder-item-id="projects"]');
    await expect(projectsIconReloaded).toBeVisible();
    await projectsIconReloaded.dblclick();

    // Verify the window opened at the saved coordinates
    const windowElReloaded = page.locator('[data-window-id="projects"]');
    await expect(windowElReloaded).toBeVisible();
    const dragHandleReloaded = page.locator('[class*="dragHandle"]').first();
    const handleBoxAfterReload = await dragHandleReloaded.boundingBox();
    expect(handleBoxAfterReload).not.toBeNull();

    // Check that it opened at the dragged position
    expect(Math.abs(handleBoxAfterReload!.x - handleBoxAfterDrag!.x)).toBeLessThan(20);
  });
});
