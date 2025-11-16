/**
 * Playwright Test Helpers
 *
 * Shared utilities and helper functions for UI tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Test that a button exists, is visible, and clickable
 */
export async function testButton(
  page: Page,
  buttonSelector: string,
  buttonText: string,
  description?: string
) {
  const button = page.getByRole('button', { name: buttonText });

  // Button should exist
  await expect(button).toBeAttached({
    timeout: 5000,
  });

  // Button should be visible
  await expect(button).toBeVisible();

  // Button should be enabled
  await expect(button).toBeEnabled();

  // Button should have correct text
  await expect(button).toHaveText(buttonText);

  if (description) {
    console.log(`✓ Button "${buttonText}" - ${description}`);
  }

  return button;
}

/**
 * Test that a link exists and is clickable
 */
export async function testLink(
  page: Page,
  linkText: string,
  expectedHref?: string
) {
  const link = page.getByRole('link', { name: linkText });

  await expect(link).toBeVisible();
  await expect(link).toBeEnabled();

  if (expectedHref) {
    await expect(link).toHaveAttribute('href', expectedHref);
  }

  return link;
}

/**
 * Test that a heading exists with correct text
 */
export async function testHeading(
  page: Page,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  text: string | RegExp
) {
  const heading = page.getByRole('heading', { level, name: text });
  await expect(heading).toBeVisible();
  return heading;
}

/**
 * Test that a text element contains specific content
 */
export async function testText(
  page: Page,
  text: string | RegExp,
  options?: { exact?: boolean }
) {
  const element = page.getByText(text, options);
  await expect(element).toBeVisible();
  return element;
}

/**
 * Test navigation to a new page
 */
export async function testNavigation(
  page: Page,
  action: () => Promise<void>,
  expectedUrl: string | RegExp
) {
  await action();
  await expect(page).toHaveURL(expectedUrl);
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Test that an input field is functional
 */
export async function testInput(
  page: Page,
  label: string,
  testValue: string
) {
  const input = page.getByLabel(label);

  await expect(input).toBeVisible();
  await expect(input).toBeEditable();

  await input.fill(testValue);
  await expect(input).toHaveValue(testValue);

  return input;
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string
) {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true
  });
}

/**
 * Test Material-UI component rendering
 */
export async function testMuiComponent(
  page: Page,
  componentClass: string
) {
  const component = page.locator(`.${componentClass}`);
  await expect(component).toBeAttached();
  return component;
}

/**
 * Test that page has no console errors
 */
export async function checkConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Test responsive behavior
 */
export async function testResponsive(
  page: Page,
  sizes: Array<{ width: number; height: number; name: string }>
) {
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await waitForPageLoad(page);
    await takeScreenshot(page, `responsive-${size.name}`);
  }
}
