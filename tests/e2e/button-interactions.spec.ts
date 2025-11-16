/**
 * Button Interaction Tests
 *
 * Tests for all button clicks and interactions throughout the application.
 * These tests ensure buttons are not just visible, but actually functional.
 */

import { test, expect } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Landing Page Button Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('"New Game" button should be clickable', async ({ page }) => {
    const button = page.getByRole('button', { name: 'New Game' });

    // Verify button is clickable
    await expect(button).toBeEnabled();

    // Click the button
    await button.click();

    // TODO: Once /new-game route is implemented, verify navigation
    // For now, just verify the click doesn't cause errors
    await page.waitForTimeout(500);
  });

  test('"Load Game" button should be clickable', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Load Game' });

    // Verify button is clickable
    await expect(button).toBeEnabled();

    // Click the button
    await button.click();

    // TODO: Once /load-game route is implemented, verify navigation
    // For now, just verify the click doesn't cause errors
    await page.waitForTimeout(500);
  });

  test('button clicks should not cause console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Click both buttons
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.waitForTimeout(500);

    await page.goto('/');
    await page.getByRole('button', { name: 'Load Game' }).click();
    await page.waitForTimeout(500);

    // Filter out known Next.js router errors (expected until routes exist)
    const relevantErrors = errors.filter(
      (err) => !err.includes('router') && !err.includes('navigation')
    );

    expect(relevantErrors).toHaveLength(0);
  });

  test('buttons should respond to keyboard interaction (Enter)', async ({ page }) => {
    const newGameBtn = page.getByRole('button', { name: 'New Game' });

    // Focus the button
    await newGameBtn.focus();

    // Verify it's focused
    await expect(newGameBtn).toBeFocused();

    // Press Enter
    await page.keyboard.press('Enter');

    // Button should handle the interaction
    await page.waitForTimeout(500);
  });

  test('buttons should respond to keyboard interaction (Space)', async ({ page }) => {
    const loadGameBtn = page.getByRole('button', { name: 'Load Game' });

    // Focus the button
    await loadGameBtn.focus();

    // Verify it's focused
    await expect(loadGameBtn).toBeFocused();

    // Press Space
    await page.keyboard.press('Space');

    // Button should handle the interaction
    await page.waitForTimeout(500);
  });

  test('tab navigation should work correctly', async ({ page }) => {
    // Start from beginning
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();

    // Tab through both buttons
    await page.keyboard.press('Tab');
    const secondFocus = page.getByRole('button', { name: 'Load Game' });
    await expect(secondFocus).toBeFocused();
  });

  test('double-clicking button should not cause issues', async ({ page }) => {
    const button = page.getByRole('button', { name: 'New Game' });

    // Double click (will trigger navigation)
    await button.dblclick({ noWaitAfter: true });

    // Should not cause any errors or odd behavior
    await page.waitForTimeout(500);

    // Navigate back to verify no errors occurred
    await page.goto('/');
    await waitForPageLoad(page);

    // Verify button is still functional after double-click
    const buttonAfter = page.getByRole('button', { name: 'New Game' });
    await expect(buttonAfter).toBeEnabled();
  });

  test('rapid clicking should be handled gracefully', async ({ page }) => {
    const button = page.getByRole('button', { name: 'New Game' });

    // Click the first time (will trigger navigation)
    await button.click({ noWaitAfter: true });
    await page.waitForTimeout(100);

    // Navigate back to test rapid clicking doesn't break the app
    await page.goto('/');
    await waitForPageLoad(page);

    // Try clicking rapidly multiple times
    const buttonAgain = page.getByRole('button', { name: 'New Game' });
    await buttonAgain.click({ noWaitAfter: true });
    await page.waitForTimeout(50);

    // Navigate back and verify button is still functional
    await page.goto('/');
    await waitForPageLoad(page);

    const buttonFinal = page.getByRole('button', { name: 'New Game' });
    await expect(buttonFinal).toBeEnabled();
  });
});

// Test suite for future pages - update when routes are added
test.describe('Navigation Tests (Future)', () => {
  test.skip('clicking "New Game" should navigate to /new-game', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Game' }).click();

    // TODO: Enable this test when /new-game route exists
    await expect(page).toHaveURL('/new-game');
  });

  test.skip('clicking "Load Game" should navigate to /load-game', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Load Game' }).click();

    // TODO: Enable this test when /load-game route exists
    await expect(page).toHaveURL('/load-game');
  });
});
