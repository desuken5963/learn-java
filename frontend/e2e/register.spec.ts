import { test, expect } from '@playwright/test';

test.describe('ユーザー登録', () => {
  test.beforeEach(async ({ page }) => {
    // ホームページにアクセス
    await page.goto('/');
    // ユーザー登録ページに遷移
    await page.click('text=ユーザー登録');
    await expect(page).toHaveURL('/register');
  });

  test('正常なユーザー登録ができること', async ({ page }) => {
    // フォームに入力
    await page.fill('input[name="username"]', `testuser_${Date.now()}`);
    await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');

    // 送信ボタンをクリック
    await page.click('button[type="submit"]');

    // 成功メッセージが表示されることを確認
    await expect(page.locator('text=登録が完了しました')).toBeVisible({ timeout: 10000 });
    
    // ユーザー名が表示されることを確認
    await expect(page.locator('text=/ユーザー名: testuser_/')).toBeVisible();
  });

  test('バリデーションエラーが表示されること', async ({ page }) => {
    // 短いユーザー名を入力
    await page.fill('input[name="username"]', 'ab');
    // 無効なメールアドレスを入力
    await page.fill('input[name="email"]', 'invalid-email');
    // 短いパスワードを入力
    await page.fill('input[name="password"]', '123');

    // 送信ボタンをクリック
    await page.click('button[type="submit"]');

    // バリデーションエラーメッセージが表示されることを確認
    await expect(page.locator('text=/ユーザー名は3文字以上/')).toBeVisible();
    await expect(page.locator('text=/有効なメールアドレスを入力してください/')).toBeVisible();
    await expect(page.locator('text=/パスワードは8文字以上/')).toBeVisible();
  });

  test('重複エラーが表示されること', async ({ page }) => {
    const username = `duplicate_user_${Date.now()}`;
    const email = `duplicate_${Date.now()}@example.com`;

    // 最初のユーザーを登録
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 成功メッセージを待つ
    await expect(page.locator('text=登録が完了しました')).toBeVisible({ timeout: 10000 });
    
    // ホームに戻る
    await page.click('text=ホームに戻る');
    await page.click('text=ユーザー登録');

    // 同じユーザー名で再度登録を試みる
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', `different_${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 重複エラーメッセージが表示されることを確認
    await expect(page.locator('text=/このユーザー名は既に使用されています/')).toBeVisible({ timeout: 10000 });
  });

  test('必須項目が未入力の場合にエラーが表示されること', async ({ page }) => {
    // 何も入力せずに送信
    await page.click('button[type="submit"]');

    // HTML5のバリデーションメッセージが表示されることを確認
    // (ブラウザのネイティブバリデーション)
    const usernameInput = page.locator('input[name="username"]');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    // HTML5バリデーションが機能していることを確認
    await expect(usernameInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });
});

