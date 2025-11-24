import { test, expect } from '@playwright/test';

test.describe('コメント機能', () => {
  let testUsername: string;
  let testEmail: string;
  let testPassword: string;
  let otherUsername: string;
  let otherEmail: string;
  let postId: number;
  let testToken: string;
  let testUser: any;

  test.beforeEach(async ({ request }) => {
    // テスト用ユーザーを作成
    testUsername = `testuser_comment_${Date.now()}`;
    testEmail = `test_comment_${Date.now()}@example.com`;
    testPassword = 'password123';

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    // 他のユーザーも作成（所有者チェック用）
    otherUsername = `otheruser_comment_${Date.now()}`;
    otherEmail = `other_comment_${Date.now()}@example.com`;

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: otherUsername,
        email: otherEmail,
        password: testPassword,
      },
    });

    // テスト用投稿を作成
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    testToken = loginData.token;
    testUser = loginData.user;

    const postResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: 'コメントテスト用投稿',
        content: 'これはコメント機能のテスト用投稿です',
      },
    });

    const postData = await postResponse.json();
    postId = postData.id;
  });

  test('コメント一覧が表示されること', async ({ page, request }) => {
    // テスト用コメントを作成
    await request.post(`http://localhost:8080/api/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        content: 'テストコメント1',
      },
    });

    await request.post(`http://localhost:8080/api/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        content: 'テストコメント2',
      },
    });

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: testToken, userData: testUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // コメントセクションが表示されることを確認
    await expect(page.locator('h2:has-text("コメント (")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=テストコメント1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=テストコメント2')).toBeVisible({ timeout: 10000 });
  });

  test('コメントを投稿できること', async ({ page }) => {
    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: testToken, userData: testUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // コメント投稿フォームが表示されることを確認
    await expect(page.locator('h2:has-text("コメントを投稿")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="コメントを入力"]')).toBeVisible();

    // コメントを入力
    await page.fill('textarea[placeholder*="コメントを入力"]', 'E2Eテストで作成されたコメント');

    // 投稿ボタンをクリック
    await page.click('button:has-text("コメントを投稿")');

    // コメントが一覧に表示されることを確認
    await expect(page.locator('text=E2Eテストで作成されたコメント')).toBeVisible({ timeout: 5000 });
    
    // フォームがクリアされていることを確認
    await expect(page.locator('textarea[placeholder*="コメントを入力"]')).toHaveValue('');
  });

  test('コメントを編集できること（所有者のみ）', async ({ page, request }) => {
    // テスト用コメントを作成
    const commentResponse = await request.post(`http://localhost:8080/api/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        content: '編集前のコメント',
      },
    });

    const commentData = await commentResponse.json();
    const commentId = commentData.id;

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: testToken, userData: testUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // 編集ボタンが表示されることを確認
    await expect(page.locator('button:has-text("編集")').first()).toBeVisible();

    // 編集ボタンをクリック
    const editButton = page.locator('div').filter({ hasText: '編集前のコメント' }).locator('button:has-text("編集")');
    await editButton.click();

    // 編集モードになることを確認（テキストエリアが表示される）
    // 編集モードでは、コメントカード内にtextareaが表示される
    const commentCard = page.locator('div').filter({ hasText: '編集前のコメント' }).first();
    const textarea = commentCard.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await expect(textarea).toHaveValue('編集前のコメント');

    // コメント内容を編集
    await textarea.fill('編集後のコメント');

    // 更新ボタンをクリック
    await page.click('button:has-text("更新")');

    // コメントが更新されていることを確認
    await expect(page.locator('text=編集後のコメント')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=編集前のコメント')).not.toBeVisible();
  });

  test('コメントを削除できること（所有者のみ）', async ({ page, request }) => {
    // テスト用コメントを作成
    const commentResponse = await request.post(`http://localhost:8080/api/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        content: '削除されるコメント',
      },
    });

    const commentData = await commentResponse.json();
    const commentId = commentData.id;

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: testToken, userData: testUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // 削除ボタンが表示されることを確認（コメントカード内の削除ボタン）
    const commentCard = page.locator('div').filter({ hasText: '削除されるコメント' }).first();
    await expect(commentCard.locator('button:has-text("削除")')).toBeVisible();

    // 削除ボタンをクリック（確認ダイアログを自動でOKにする）
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('本当にこのコメントを削除しますか');
      await dialog.accept();
    });

    await commentCard.locator('button:has-text("削除")').click();

    // コメントが削除されていることを確認
    await expect(page.locator('text=削除されるコメント')).not.toBeVisible({ timeout: 5000 });
  });

  test('所有者以外は編集・削除ボタンが表示されないこと', async ({ page, request }) => {
    // テストユーザーでコメントを作成
    const commentResponse = await request.post(`http://localhost:8080/api/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        content: '所有者チェック用コメント',
      },
    });

    // 他のユーザーでログイン
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: otherUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    const otherToken = loginData.token;
    const otherUser = loginData.user;

    // ページにアクセスして他のユーザーでログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: otherToken, userData: otherUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // コメントは表示されるが、編集・削除ボタンが表示されないことを確認
    await expect(page.locator('text=所有者チェック用コメント')).toBeVisible();
    
    // コメントカード内の編集・削除ボタンが表示されないことを確認
    const commentCard = page.locator('text=所有者チェック用コメント').locator('..').locator('..');
    await expect(commentCard.locator('button:has-text("編集")')).not.toBeVisible();
    await expect(commentCard.locator('button:has-text("削除")')).not.toBeVisible();
  });

  test('空のコメントは投稿できないこと', async ({ page }) => {
    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: testToken, userData: testUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // コメント投稿フォームが表示されることを確認
    await expect(page.locator('textarea[placeholder*="コメントを入力"]')).toBeVisible();

    // 空の状態で投稿ボタンをクリック（ボタンは無効化されているはず）
    const submitButton = page.locator('button:has-text("コメントを投稿")');
    await expect(submitButton).toBeDisabled();

    // スペースのみのコメントも投稿できないことを確認
    await page.fill('textarea[placeholder*="コメントを入力"]', '   ');
    await expect(submitButton).toBeDisabled();
  });

  test('コメントが0件の場合、空のメッセージが表示されること', async ({ page }) => {
    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: testToken, userData: testUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // コメントセクションが表示されることを確認
    await expect(page.locator('text=コメント (0)')).toBeVisible();
    await expect(page.locator('text=まだコメントがありません')).toBeVisible();
  });

  test('コメント編集をキャンセルできること', async ({ page, request }) => {
    // テスト用コメントを作成
    await request.post(`http://localhost:8080/api/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        content: '元のコメント内容',
      },
    });

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: testToken, userData: testUser });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // 編集ボタンをクリック
    const editButton = page.locator('div').filter({ hasText: '元のコメント内容' }).locator('button:has-text("編集")');
    await editButton.click();

    // 編集モードになることを確認
    // コメント編集用のテキストエリアを取得
    const commentCard = page.locator('div').filter({ hasText: '元のコメント内容' }).first();
    const textarea = commentCard.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // コメント内容を編集
    await textarea.fill('編集したがキャンセルする内容');

    // キャンセルボタンをクリック
    await page.click('button:has-text("キャンセル")');

    // 元のコメント内容が表示されることを確認
    await expect(page.locator('text=元のコメント内容')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=編集したがキャンセルする内容')).not.toBeVisible();
  });
});

