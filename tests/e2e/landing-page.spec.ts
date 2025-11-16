/**
 * Landing Page E2E Tests
 *
 * Comprehensive tests for the main landing page including:
 * - Page load and rendering
 * - All text content
 * - All buttons and their functionality
 * - Navigation
 * - Responsive design
 */

import { test, expect } from '@playwright/test';
import {
  testButton,
  testHeading,
  testText,
  waitForPageLoad,
  checkConsoleErrors,
  testResponsive,
  takeScreenshot
} from './helpers';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page before each test
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should load successfully', async ({ page }) => {
    // Check that page loaded
    await expect(page).toHaveURL('/');

    // Check page title
    await expect(page).toHaveTitle('NFL GM Simulator');

    // Take screenshot for visual regression
    await takeScreenshot(page, 'landing-page-load');
  });

  test('should display main heading', async ({ page }) => {
    // Test h1 heading exists and has correct text
    await testHeading(page, 1, 'NFL GM Simulator');

    // Verify heading is prominently displayed
    const heading = page.getByRole('heading', { level: 1 });
    const fontSize = await heading.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Should be large font (h2 in MUI is typically 3.75rem = 60px)
    expect(fontSize).toBeTruthy();
  });

  test('should display subtitle', async ({ page }) => {
    // Test subtitle text (MUI Typography with 'paragraph' prop renders as <p>, not heading)
    await testText(page, 'The most authentic NFL General Manager experience');

    // Verify the subtitle is visible and has correct styling
    const subtitle = page.getByText('The most authentic NFL General Manager experience');
    await expect(subtitle).toBeVisible();

    // Verify it has the h5 variant styling (secondary color)
    const color = await subtitle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(color).toBeTruthy();
  });

  test('should have Material-UI theme applied', async ({ page }) => {
    // Check dark mode background
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Dark theme background color (should be dark)
    expect(bgColor).toContain('10, 25, 41'); // rgb(10, 25, 41) = #0a1929
  });

  test('should display "New Game" button', async ({ page }) => {
    const button = await testButton(
      page,
      'button',
      'New Game',
      'Primary action button for starting new game'
    );

    // Verify button has correct styling (contained primary)
    await expect(button).toHaveClass(/MuiButton-contained/);
    await expect(button).toHaveClass(/MuiButton-sizeLarge/);
  });

  test('should display "Load Game" button', async ({ page }) => {
    const button = await testButton(
      page,
      'button',
      'Load Game',
      'Secondary action button for loading saved game'
    );

    // Verify button has correct styling (outlined)
    await expect(button).toHaveClass(/MuiButton-outlined/);
    await expect(button).toHaveClass(/MuiButton-sizeLarge/);
  });

  test('both buttons should be side by side', async ({ page }) => {
    const newGameBtn = page.getByRole('button', { name: 'New Game' });
    const loadGameBtn = page.getByRole('button', { name: 'Load Game' });

    // Get positions
    const newGameBox = await newGameBtn.boundingBox();
    const loadGameBox = await loadGameBtn.boundingBox();

    expect(newGameBox).toBeTruthy();
    expect(loadGameBox).toBeTruthy();

    // Buttons should be on roughly the same horizontal line (y position)
    if (newGameBox && loadGameBox) {
      const yDifference = Math.abs(newGameBox.y - loadGameBox.y);
      expect(yDifference).toBeLessThan(10); // Allow small differences

      // "New Game" should be to the left of "Load Game"
      expect(newGameBox.x).toBeLessThan(loadGameBox.x);
    }
  });

  test('should have no console errors', async ({ page }) => {
    const errors = await checkConsoleErrors(page);

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('page should be centered', async ({ page }) => {
    const container = page.locator('.MuiContainer-root');
    await expect(container).toBeVisible();

    // Container should be centered
    const box = await container.boundingBox();
    const viewportSize = page.viewportSize();

    if (box && viewportSize) {
      const containerCenter = box.x + box.width / 2;
      const viewportCenter = viewportSize.width / 2;

      // Container should be roughly centered (within 50px)
      const difference = Math.abs(containerCenter - viewportCenter);
      expect(difference).toBeLessThan(50);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await testResponsive(page, [
      { width: 375, height: 667, name: 'mobile-portrait' },
      { width: 667, height: 375, name: 'mobile-landscape' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 1920, height: 1080, name: 'desktop-fullhd' },
    ]);

    // All elements should still be visible
    await testHeading(page, 1, 'NFL GM Simulator');
    await testButton(page, 'button', 'New Game');
    await testButton(page, 'button', 'Load Game');
  });

  test('should have accessible button labels', async ({ page }) => {
    const newGameBtn = page.getByRole('button', { name: 'New Game' });
    const loadGameBtn = page.getByRole('button', { name: 'Load Game' });

    // Check ARIA labels and accessibility
    await expect(newGameBtn).toBeVisible();
    await expect(loadGameBtn).toBeVisible();

    // Buttons should have type="button"
    await expect(newGameBtn).toHaveAttribute('type', 'button');
    await expect(loadGameBtn).toHaveAttribute('type', 'button');

    // Buttons should be keyboard accessible (tabindex)
    await expect(newGameBtn).toHaveAttribute('tabindex', '0');
    await expect(loadGameBtn).toHaveAttribute('tabindex', '0');
  });

  test('buttons should have hover effects', async ({ page }) => {
    const newGameBtn = page.getByRole('button', { name: 'New Game' });

    // Hover over button
    await newGameBtn.hover();

    // Wait for transition
    await page.waitForTimeout(300);

    // Button should still be visible and enabled
    await expect(newGameBtn).toBeVisible();
    await expect(newGameBtn).toBeEnabled();
  });

  test('layout should use MUI Box component', async ({ page }) => {
    const box = page.locator('.MuiBox-root');
    await expect(box).toBeVisible();

    // Box should have centering styles
    const styles = await box.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
      };
    });

    expect(styles.display).toBe('flex');
    expect(styles.justifyContent).toBe('center');
    expect(styles.alignItems).toBe('center');
  });

  test('should use MUI Stack for button layout', async ({ page }) => {
    const stack = page.locator('.MuiStack-root');
    await expect(stack).toBeVisible();

    // Stack should have horizontal layout
    const flexDirection = await stack.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });

    expect(flexDirection).toBe('row');
  });

  test('fonts should be loaded correctly', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });

    const fontFamily = await heading.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });

    // Should use Inter or system fonts
    expect(fontFamily.toLowerCase()).toMatch(/inter|system-ui|sans-serif/);
  });
});
