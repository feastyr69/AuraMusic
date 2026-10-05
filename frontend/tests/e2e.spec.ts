import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Aura - Listen together/);
});

test('registers with username, email, and password', async ({ page }) => {
  let requestBody;
  await page.route('**/api/auth/refresh', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/auth/register', async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ status: true }) });
  });

  await page.goto('/register');
  await page.getByLabel('Username').fill('alex_music');
  await page.getByLabel('Email').fill('alex@example.com');
  await page.getByLabel('Password').fill('test-password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(requestBody).toEqual({ username: 'alex_music', email: 'alex@example.com', password: 'test-password' });
});

test('signs in with email identifier', async ({ page }) => {
  let loginBody;
  await page.route('**/api/auth/refresh', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/auth/login', async (route) => {
    loginBody = route.request().postDataJSON();
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ status: true, token: 'login-token' }) });
  });
  await page.route('**/api/auth/status', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 1, username: 'alex_music' } }),
  }));

  await page.goto('/login');
  await page.getByLabel('Username or email').fill('alex@example.com');
  await page.getByLabel('Password').fill('test-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(loginBody).toEqual({ identifier: 'alex@example.com', password: 'test-password' });
});

test('requires Google users to choose username before app access', async ({ page }) => {
  let setupBody;
  await page.route('**/api/auth/refresh', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, accessToken: 'google-token', user: { id: 2, username: null } }),
  }));
  await page.route('**/api/auth/username', async (route) => {
    setupBody = route.request().postDataJSON();
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ status: true, token: 'updated-token', user: { id: 2, username: 'google_fan' } }),
    });
  });
  await page.route('**/api/auth/status', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 2, username: 'google_fan' } }),
  }));

  await page.goto('/');
  await expect(page).toHaveURL(/\/setup$/);
  await page.getByLabel('Username').fill('google_fan');
  for (const taste of ['Indie', 'R&B', 'Electronic']) {
    await page.getByRole('button', { name: taste, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Let’s go' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(setupBody).toEqual({ username: 'google_fan', musicTastes: ['Indie', 'R&B', 'Electronic'] });
});

test('redirects users with a username away from onboarding', async ({ page }) => {
  await page.route('**/api/auth/refresh', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, accessToken: 'existing-user-token', user: { id: 3, username: 'already_set_up' } }),
  }));

  await page.goto('/setup');

  await expect(page).toHaveURL(/\/$/);
});

test('views a public profile and its listening statistics', async ({ page }) => {
  await page.route('**/api/auth/refresh', (route) => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ success: false }),
  }));
  await page.route('**/api/profiles/alex', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      username: 'alex', displayName: 'Alex', avatarUrl: null, bio: 'Music fan', musicTastes: ['Indie', 'Jazz', 'Pop'],
      createdAt: '2025-01-01T00:00:00.000Z', isOwner: false, statsPublic: true,
      stats: { listenedMinutes: 125, roomSessions: 8, topArtists: [{ artist: 'Artist', listenedMinutes: 60 }], topTracks: [{ videoId: 'track1', title: 'Track', artist: 'Artist', listenedMinutes: 60 }] },
    }),
  }));

  await page.goto('/profile/alex');
  await expect(page.getByRole('heading', { name: 'Alex', exact: true })).toBeVisible();
  await expect(page.getByText('125 min')).toBeVisible();
  await expect(page.getByText('Track', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Music tastes')).toContainText('Indie');
});

test('edits own profile and saves statistics visibility', async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 900 });
  let profile = {
    username: 'alex', displayName: 'Alex', avatarUrl: null, bio: '',
    createdAt: '2025-01-01T00:00:00.000Z', isOwner: true, statsPublic: true,
    stats: { listenedMinutes: 0, roomSessions: 0, topArtists: [], topTracks: [] },
  };
  await page.route('**/api/auth/refresh', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, accessToken: 'test-token', user: { id: 1, username: 'alex' } }),
  }));
  await page.route('**/api/profiles/alex', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(profile) }));
  await page.route('**/api/profiles/me', async (route) => {
    const body = route.request().postDataJSON();
    profile = { ...profile, displayName: body.displayName, bio: body.bio, statsPublic: body.statsPublic };
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.goto('/profile/alex');
  const profileCard = page.getByTestId('profile-card');
  const originalCardBox = await profileCard.boundingBox();
  expect(originalCardBox).not.toBeNull();

  await page.getByRole('button', { name: 'Edit profile' }).click();
  const editor = page.getByTestId('profile-editor');
  await expect(editor).toBeVisible();
  await expect(page.getByTestId('profile-stats')).toHaveCSS('opacity', '0');
  const expandedCardBox = await profileCard.boundingBox();
  const desktopEditorBox = await editor.boundingBox();
  expect(expandedCardBox).not.toBeNull();
  expect(desktopEditorBox).not.toBeNull();
  expect(desktopEditorBox!.x).toBeGreaterThanOrEqual(expandedCardBox!.x);
  expect(desktopEditorBox!.y).toBeGreaterThanOrEqual(expandedCardBox!.y);
  expect(desktopEditorBox!.x + desktopEditorBox!.width).toBeLessThanOrEqual(expandedCardBox!.x + expandedCardBox!.width + 1);
  expect(desktopEditorBox!.y + desktopEditorBox!.height).toBeLessThanOrEqual(expandedCardBox!.y + expandedCardBox!.height + 1);
  expect(Math.abs(expandedCardBox!.height - originalCardBox!.height)).toBeLessThanOrEqual(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByLabel('Display name').fill('Alex Moon');
  await page.getByLabel('Bio').fill('Into late night jams');
  await page.getByLabel('Make listening statistics public').uncheck();
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByRole('heading', { name: 'Alex Moon' })).toBeVisible();
  await expect(page.getByTestId('profile-details').getByText('Into late night jams')).toBeVisible();

  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(editor).toBeVisible();
  const mobileCardBox = await profileCard.boundingBox();
  const profileDetailsBox = await page.getByTestId('profile-details').boundingBox();
  const mobileEditorBox = await editor.boundingBox();
  expect(mobileCardBox).not.toBeNull();
  expect(profileDetailsBox).not.toBeNull();
  expect(mobileEditorBox).not.toBeNull();
  expect(mobileEditorBox!.y).toBeGreaterThanOrEqual(profileDetailsBox!.y + profileDetailsBox!.height - 1);
  expect(mobileEditorBox!.x).toBeGreaterThanOrEqual(mobileCardBox!.x);
  expect(mobileEditorBox!.x + mobileEditorBox!.width).toBeLessThanOrEqual(mobileCardBox!.x + mobileCardBox!.width + 1);
  expect(mobileEditorBox!.y + mobileEditorBox!.height).toBeLessThanOrEqual(mobileCardBox!.y + mobileCardBox!.height + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByLabel('Make listening statistics public')).not.toBeChecked();
});

test('changes username and moves profile to new public URL', async ({ page }) => {
  let username = 'alex';
  await page.route('**/api/auth/refresh', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, accessToken: 'old-token', user: { id: 1, username } }),
  }));
  await page.route('**/api/auth/username', async (route) => {
    username = route.request().postDataJSON().username.toLowerCase();
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ status: true, token: 'new-token', refreshToken: 'new-refresh', user: { id: 1, username } }) });
  });
  await page.route('**/api/auth/status', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 1, username } }),
  }));
  await page.route('**/api/profiles/*', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      username, displayName: 'Alex', avatarUrl: null, bio: '',
      createdAt: '2025-01-01T00:00:00.000Z', isOwner: true, statsPublic: true,
      stats: { listenedMinutes: 0, roomSessions: 0, topArtists: [], topTracks: [] },
    }),
  }));

  await page.goto('/profile/alex');
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.getByLabel('Username').fill('alex_new');
  await page.getByRole('button', { name: 'Change username' }).click();
  await expect(page).toHaveURL(/\/profile\/alex_new$/);
  await expect(page.getByText('@alex_new')).toBeVisible();
});
