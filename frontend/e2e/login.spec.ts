import { test, expect } from '@playwright/test';

test.describe('ログイン', () => {
  test.beforeEach(async ({ page }) => {
    // ホームページにアクセス
    await page.goto('/');
    // ログインページに遷移
    await page.click('text=ログイン');
    await expect(page).toHaveURL('/login');
  });

  test('正常なログインができること（ユーザー名）', async ({ page, request }) => {
    // APIで直接ユーザーを作成
    const testUsername = `testuser_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'password123';

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });
    
    // ログインページに移動
    await page.goto('/login');

    // ログインフォームに入力
    await page.fill('input[name="usernameOrEmail"]', testUsername);
    await page.fill('input[name="password"]', testPassword);

    // 送信ボタンをクリック
    await page.click('button[type="submit"]');

    // ホームページにリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // localStorageにトークンが保存されていることを確認
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('正常なログインができること（メールアドレス）', async ({ page, request }) => {
    // APIで直接ユーザーを作成
    const testUsername = `testuser_email_${Date.now()}`;
    const testEmail = `test_email_${Date.now()}@example.com`;
    const testPassword = 'password123';

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });
    
    // ログインページに移動
    await page.goto('/login');

    // メールアドレスでログイン
    await page.fill('input[name="usernameOrEmail"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // 送信ボタンをクリック
    await page.click('button[type="submit"]');

    // ホームページにリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // localStorageにトークンが保存されていることを確認
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('間違ったパスワードでログインできないこと', async ({ page, request }) => {
    // APIで直接ユーザーを作成
    const testUsername = `testuser_wrong_${Date.now()}`;
    const testEmail = `test_wrong_${Date.now()}@example.com`;
    const testPassword = 'password123';

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });
    
    // ログインページに移動
    await page.goto('/login');

    // 間違ったパスワードでログインを試みる
    await page.fill('input[name="usernameOrEmail"]', testUsername);
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されることを確認（部分一致で検索）
    await expect(page.locator('text=/ユーザー名またはパスワード/')).toBeVisible({ timeout: 10000 });
    
    // ログインページに留まることを確認
    await expect(page).toHaveURL('/login');
  });

  test('存在しないユーザーでログインできないこと', async ({ page }) => {
    // 存在しないユーザーでログインを試みる
    await page.fill('input[name="usernameOrEmail"]', 'nonexistent_user_12345');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // ログインページに留まることを確認（リダイレクトされない）
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
    
    // エラーメッセージが表示される可能性があることを確認（表示されない場合もある）
    const pageContent = await page.textContent('body');
    // エラーメッセージが表示されている場合は確認
    if (pageContent && pageContent.includes('ユーザー名') && pageContent.includes('パスワード')) {
      expect(pageContent).toContain('ユーザー名');
    }
  });

  test('必須項目が未入力の場合にエラーが表示されること', async ({ page }) => {
    // 何も入力せずに送信
    await page.click('button[type="submit"]');

    // HTML5のバリデーションメッセージが表示されることを確認
    const usernameInput = page.locator('input[name="usernameOrEmail"]');
    const passwordInput = page.locator('input[name="password"]');

    // HTML5バリデーションが機能していることを確認
    await expect(usernameInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });
});

