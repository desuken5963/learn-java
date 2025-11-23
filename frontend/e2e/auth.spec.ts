import { test, expect } from '@playwright/test';

test.describe('JWT認証フィルター', () => {
  test('認証が必要なAPIにトークンありでアクセスできること', async ({ page, request }) => {
    // テスト用ユーザーを作成
    const testUsername = `testuser_auth_${Date.now()}`;
    const testEmail = `test_auth_${Date.now()}@example.com`;
    const testPassword = 'password123';

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    // ログインしてトークンを取得
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.token;

    // トークンを使って認証が必要なAPIにアクセス
    const userResponse = await request.get('http://localhost:8080/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    expect(userResponse.ok()).toBeTruthy();
    const userData = await userResponse.json();
    expect(userData.username).toBe(testUsername);
    expect(userData.message).toBe('認証成功');
  });

  test('認証が必要なAPIにトークンなしでアクセスできないこと', async ({ request }) => {
    // トークンなしで認証が必要なAPIにアクセス
    const response = await request.get('http://localhost:8080/api/users/me');

    expect(response.status()).toBe(401);
    const errorData = await response.json();
    expect(errorData.message).toContain('認証が必要です');
  });

  test('無効なトークンでアクセスできないこと', async ({ request }) => {
    // 無効なトークンで認証が必要なAPIにアクセス
    const response = await request.get('http://localhost:8080/api/users/me', {
      headers: {
        'Authorization': 'Bearer invalid_token_12345',
      },
    });

    expect(response.status()).toBe(401);
    const errorData = await response.json();
    expect(errorData.message).toContain('認証が必要です');
  });

  test('公開エンドポイントは認証なしでアクセスできること', async ({ request }) => {
    // 公開エンドポイントにアクセス
    const healthResponse = await request.get('http://localhost:8080/api/health');
    expect(healthResponse.ok()).toBeTruthy();

    const registerResponse = await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: `testuser_public_${Date.now()}`,
        email: `test_public_${Date.now()}@example.com`,
        password: 'password123',
      },
    });
    expect(registerResponse.ok()).toBeTruthy();
  });

  test('ホームページでログイン状態がサーバー側で検証されること', async ({ page, request }) => {
    // テスト用ユーザーを作成してログイン
    const testUsername = `testuser_home_${Date.now()}`;
    const testEmail = `test_home_${Date.now()}@example.com`;
    const testPassword = 'password123';

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    // ログインページに移動してログイン
    await page.goto('/login');
    await page.fill('input[name="usernameOrEmail"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // ホームページにリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // ログイン状態が表示されることを確認
    await expect(page.locator('text=ログイン中')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${testUsername}`)).toBeVisible();
  });

  test('無効なトークンの場合、ホームページで自動的に削除されること', async ({ page }) => {
    // 無効なトークンをlocalStorageに設定
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid_token_12345');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    });

    // ページをリロード
    await page.reload();

    // ログインしていない状態になることを確認（サーバー側検証でトークンが削除される）
    await page.waitForTimeout(2000);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeFalsy(); // トークンが削除されていること

    // ログインしていないメッセージが表示されることを確認
    await expect(page.locator('text=ログインしていません')).toBeVisible({ timeout: 5000 });
  });
});

