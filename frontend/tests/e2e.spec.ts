import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Aura - Listen together/);
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
      username: 'alex', displayName: 'Alex', avatarUrl: null, bio: 'Music fan',
      createdAt: '2025-01-01T00:00:00.000Z', isOwner: false, statsPublic: true,
      stats: { listenedMinutes: 125, roomSessions: 8, topArtists: [{ artist: 'Artist', listenedMinutes: 60 }], topTracks: [{ videoId: 'track1', title: 'Track', artist: 'Artist', listenedMinutes: 60 }] },
    }),
  }));

  await page.goto('/profile/alex');
  await expect(page.getByRole('heading', { name: 'Alex', exact: true })).toBeVisible();
  await expect(page.getByText('125 min')).toBeVisible();
  await expect(page.getByText('Track', { exact: true })).toBeVisible();
});

test('edits own profile and saves statistics visibility', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.getByLabel('Display name').fill('Alex Moon');
  await page.getByLabel('Bio').fill('Into late night jams');
  await page.getByLabel('Show my listening statistics on my public profile').uncheck();
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByRole('heading', { name: 'Alex Moon' })).toBeVisible();
  await expect(page.getByText('Into late night jams')).toBeVisible();
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await expect(page.getByLabel('Show my listening statistics on my public profile')).not.toBeChecked();
});
