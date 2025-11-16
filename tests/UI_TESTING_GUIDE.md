# UI Testing Guide

**NFL GM Simulator - Comprehensive UI Testing with Playwright**

This guide explains how to write, maintain, and run UI tests for the application. Following this guide ensures that every page, button, and interaction is tested.

---

## Table of Contents

1. [Overview](#overview)
2. [Running Tests](#running-tests)
3. [Writing New Tests](#writing-new-tests)
4. [Test Checklist](#test-checklist)
5. [Helper Functions](#helper-functions)
6. [Best Practices](#best-practices)
7. [Debugging](#debugging)
8. [CI/CD Integration](#cicd-integration)

---

## Overview

### What We Test

- ✅ **Page Loading:** Every page loads successfully
- ✅ **All Buttons:** Every button exists, is visible, and is clickable
- ✅ **Button Actions:** Every button click performs the expected action
- ✅ **Navigation:** All links navigate to the correct pages
- ✅ **Text Content:** All headings, labels, and important text are displayed
- ✅ **Forms:** All input fields are functional
- ✅ **Responsive Design:** Pages work on all screen sizes
- ✅ **Accessibility:** Keyboard navigation and ARIA labels work
- ✅ **No Errors:** Pages don't have console errors

### Test Structure

```
tests/
├── e2e/                          # End-to-end UI tests
│   ├── helpers.ts                # Shared test utilities
│   ├── template.spec.ts          # Template for new page tests
│   ├── landing-page.spec.ts      # Landing page tests
│   ├── button-interactions.spec.ts
│   └── [page-name].spec.ts       # Tests for each page
├── database.test.ts              # Database tests
└── cap-calculator.test.ts        # Cap calculator tests
```

---

## Running Tests

### Quick Start

```bash
# Run all tests (unit + e2e)
npm test

# Run only UI tests
npm run test:e2e

# Run with visual interface
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

### Browser-Specific Tests

```bash
# Test in Chromium only
npm run test:e2e:chromium

# Test in Firefox only
npm run test:e2e:firefox

# Test in Safari (WebKit) only
npm run test:e2e:webkit
```

### View Test Reports

```bash
# View HTML report of last test run
npm run test:report
```

---

## Writing New Tests

### Step 1: Copy the Template

When creating a new page, copy the test template:

```bash
cp tests/e2e/template.spec.ts tests/e2e/my-new-page.spec.ts
```

### Step 2: Update Placeholders

Replace all placeholders in the template:

- `[PAGE_NAME]` → Your page name (e.g., "Dashboard")
- `[ROUTE]` → Your page route (e.g., "/dashboard")
- `[MAIN_HEADING_TEXT]` → The h1 text on your page

### Step 3: Test All Buttons

**IMPORTANT:** Add a test for EVERY button on your page.

```typescript
test('should display all buttons', async ({ page }) => {
  // Test button exists and is clickable
  await testButton(page, 'button', 'Save Changes', 'Saves form data');
  await testButton(page, 'button', 'Cancel', 'Cancels form');
  await testButton(page, 'button', 'Delete', 'Deletes item');
});
```

### Step 4: Test Button Interactions

**CRITICAL:** Test that each button actually does something.

```typescript
test('clicking "Save Changes" should save data', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Save Changes' });

  // Click the button
  await button.click();

  // Verify the expected action happened
  await expect(page.getByText('Changes saved!')).toBeVisible();
  // OR verify navigation
  // await expect(page).toHaveURL('/success');
});
```

### Step 5: Test All Links

```typescript
test('should have all navigation links', async ({ page }) => {
  await testLink(page, 'Back to Dashboard', '/dashboard');
  await testLink(page, 'View Roster', '/roster');
});
```

### Step 6: Test Text Content

```typescript
test('should display all required text', async ({ page }) => {
  await testHeading(page, 1, 'My Page Title');
  await testText(page, 'Important instruction text');
  await testText(page, /Regular expression text/);
});
```

### Step 7: Test Forms (if applicable)

```typescript
test('should have functional input fields', async ({ page }) => {
  // Test each input
  await testInput(page, 'Player Name', 'John Smith');
  await testInput(page, 'Jersey Number', '12');

  // Submit form
  await page.getByRole('button', { name: 'Submit' }).click();

  // Verify submission
  await expect(page).toHaveURL('/success');
});
```

---

## Test Checklist

Use this checklist when adding a new page:

### Basic Tests
- [ ] Page loads successfully
- [ ] Page has correct URL
- [ ] Page title is correct
- [ ] Main heading (h1) is displayed

### Button Tests
- [ ] All buttons exist and are visible
- [ ] All buttons have correct text
- [ ] All buttons are clickable
- [ ] All button clicks perform expected actions
- [ ] Buttons work with keyboard (Enter/Space)
- [ ] Tab navigation works between buttons

### Link Tests
- [ ] All navigation links exist
- [ ] All links have correct href attributes
- [ ] Clicking links navigates correctly

### Content Tests
- [ ] All headings are displayed
- [ ] All important text is visible
- [ ] All labels are correct

### Form Tests (if applicable)
- [ ] All inputs are visible and editable
- [ ] Form validation works
- [ ] Form submission works
- [ ] Error messages display correctly

### Quality Tests
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] ARIA labels are correct

### Visual Tests
- [ ] Screenshots captured for visual regression
- [ ] Layout looks correct on all screen sizes

---

## Helper Functions

We provide helper functions in `tests/e2e/helpers.ts` to make testing easier.

### `testButton()`

Test that a button exists, is visible, and clickable.

```typescript
await testButton(page, 'button', 'Click Me', 'Optional description');
```

### `testHeading()`

Test that a heading exists with the correct text.

```typescript
await testHeading(page, 1, 'Page Title'); // h1
await testHeading(page, 2, 'Subtitle');   // h2
```

### `testText()`

Test that text is visible on the page.

```typescript
await testText(page, 'Exact text');
await testText(page, /Regular expression/);
```

### `testLink()`

Test that a link exists and has the correct href.

```typescript
await testLink(page, 'Dashboard', '/dashboard');
```

### `testInput()`

Test that an input field is functional.

```typescript
await testInput(page, 'Email', 'test@example.com');
```

### `waitForPageLoad()`

Wait for page to fully load before testing.

```typescript
await waitForPageLoad(page);
```

### `takeScreenshot()`

Capture a screenshot for visual regression testing.

```typescript
await takeScreenshot(page, 'dashboard-loaded');
```

---

## Best Practices

### 1. Test Every Button

**RULE:** If there's a button on the page, there MUST be a test for it.

```typescript
// ❌ BAD - No test for button
// Button exists but isn't tested

// ✅ GOOD - Button is tested
test('should have "Delete" button', async ({ page }) => {
  await testButton(page, 'button', 'Delete');
});

test('clicking "Delete" should remove item', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Item deleted')).toBeVisible();
});
```

### 2. Test Button Actions, Not Just Existence

```typescript
// ❌ BAD - Only tests that button exists
test('should have button', async ({ page }) => {
  await testButton(page, 'button', 'Submit');
});

// ✅ GOOD - Tests button action
test('clicking "Submit" should save data', async ({ page }) => {
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Saved!')).toBeVisible();
});
```

### 3. Use Descriptive Test Names

```typescript
// ❌ BAD - Vague test name
test('button test', async ({ page }) => { ... });

// ✅ GOOD - Clear test name
test('clicking "New Game" should navigate to team selection', async ({ page }) => { ... });
```

### 4. Test One Thing Per Test

```typescript
// ❌ BAD - Tests multiple things
test('page works', async ({ page }) => {
  await testButton(page, 'button', 'Save');
  await testButton(page, 'button', 'Cancel');
  await testLink(page, 'Back', '/dashboard');
  // ... lots more
});

// ✅ GOOD - Separate tests
test('should have "Save" button', async ({ page }) => {
  await testButton(page, 'button', 'Save');
});

test('should have "Cancel" button', async ({ page }) => {
  await testButton(page, 'button', 'Cancel');
});
```

### 5. Use Meaningful Selectors

```typescript
// ❌ BAD - Fragile CSS selectors
await page.locator('.css-1234567-MuiButton-root').click();

// ✅ GOOD - Semantic selectors
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@example.com');
```

### 6. Always Wait for Page Load

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/my-page');
  await waitForPageLoad(page); // ← IMPORTANT
});
```

### 7. Check for Console Errors

Every page should have this test:

```typescript
test('should have no console errors', async ({ page }) => {
  const errors = await checkConsoleErrors(page);
  await page.waitForTimeout(2000);
  expect(errors).toHaveLength(0);
});
```

---

## Debugging

### Visual Debugging

```bash
# Open Playwright UI for visual debugging
npm run test:e2e:ui
```

### Step-by-Step Debugging

```bash
# Run in debug mode with Playwright Inspector
npm run test:e2e:debug
```

### See Browser While Testing

```bash
# Run tests in headed mode
npm run test:e2e:headed
```

### View Screenshots

Failed tests automatically capture screenshots:

```
test-results/
└── screenshots/
    └── failed-test-screenshot.png
```

### View Videos

Failed tests record videos:

```
test-results/
└── videos/
    └── failed-test-video.webm
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm test

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Common Patterns

### Testing a Form

```typescript
test('contact form should work', async ({ page }) => {
  // Fill out form
  await testInput(page, 'Name', 'John Smith');
  await testInput(page, 'Email', 'john@example.com');
  await testInput(page, 'Message', 'Hello!');

  // Submit
  await page.getByRole('button', { name: 'Send' }).click();

  // Verify success
  await expect(page.getByText('Message sent!')).toBeVisible();
});
```

### Testing Navigation

```typescript
test('clicking logo should go home', async ({ page }) => {
  await page.getByRole('link', { name: 'Logo' }).click();
  await expect(page).toHaveURL('/');
});
```

### Testing Dropdown/Select

```typescript
test('team select should work', async ({ page }) => {
  await page.selectOption('select[name="team"]', 'KC');
  await expect(page.locator('select[name="team"]')).toHaveValue('KC');
});
```

### Testing Modal/Dialog

```typescript
test('delete confirmation modal should work', async ({ page }) => {
  // Open modal
  await page.getByRole('button', { name: 'Delete' }).click();

  // Modal should be visible
  await expect(page.getByRole('dialog')).toBeVisible();

  // Confirm delete
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Modal should close
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
```

---

## Quick Reference

### Must-Have Tests for Every Page

1. Page loads successfully
2. Main heading displays
3. All buttons exist
4. All buttons are clickable
5. All button clicks work correctly
6. No console errors

### When Adding a New Button

1. Add test that button exists
2. Add test that button is clickable
3. Add test that button click does expected action
4. Update documentation if needed

### When Adding a New Page

1. Copy `template.spec.ts`
2. Update all placeholders
3. Add tests for all UI elements
4. Run tests and verify they pass
5. Commit tests with the page code

---

## Need Help?

- Check `tests/e2e/landing-page.spec.ts` for examples
- Check `tests/e2e/template.spec.ts` for template
- Check `tests/e2e/helpers.ts` for available utilities
- Read Playwright docs: https://playwright.dev

---

## Summary

**Remember:** Every button, every link, every input must be tested!

✅ **DO:**
- Test that every button exists
- Test that every button works when clicked
- Test keyboard navigation
- Test on multiple browsers
- Write descriptive test names

❌ **DON'T:**
- Skip testing buttons
- Test only that elements exist (test they work!)
- Use fragile CSS selectors
- Write mega-tests that test everything
- Forget to check for console errors

**Your tests ensure that the app always works. Keep them comprehensive!**
