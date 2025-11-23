import { test, expect } from '@playwright/test';

test.describe('投稿機能', () => {
  let testUsername: string;
  let testEmail: string;
  let testPassword: string;
  let otherUsername: string;
  let otherEmail: string;

  test.beforeEach(async ({ request }) => {
    // テスト用ユーザーを作成
    testUsername = `testuser_post_${Date.now()}`;
    testEmail = `test_post_${Date.now()}@example.com`;
    testPassword = 'password123';

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    // 他のユーザーも作成（所有者チェック用）
    otherUsername = `otheruser_post_${Date.now()}`;
    otherEmail = `other_post_${Date.now()}@example.com`;

    await request.post('http://localhost:8080/api/auth/register', {
      data: {
        username: otherUsername,
        email: otherEmail,
        password: testPassword,
      },
    });
  });

  test('投稿一覧が表示されること', async ({ page, request }) => {
    // ログイン
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    // テスト用投稿を作成
    const postResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: 'テスト投稿タイトル',
        content: 'これはテスト投稿の本文です',
      },
    });

    expect(postResponse.ok()).toBeTruthy();

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token, userData: user });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿一覧が表示されることを確認
    await expect(page.locator('text=投稿一覧')).toBeVisible();
    await expect(page.locator('text=テスト投稿タイトル').first()).toBeVisible();
  });

  test('投稿を作成できること', async ({ page, request }) => {
    // ログイン
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, username, email }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }, { token, username: testUsername, email: testEmail });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿作成フォームを表示
    await page.click('text=投稿を作成');
    await expect(page.locator('input[name="title"]')).toBeVisible();

    // フォームに入力
    await page.fill('input[name="title"]', 'E2Eテスト投稿');
    await page.fill('textarea[name="content"]', 'これはE2Eテストで作成された投稿です');

    // 投稿する
    await page.click('button[type="submit"]');

    // 投稿が一覧に表示されることを確認
    await expect(page.locator('text=E2Eテスト投稿').first()).toBeVisible({ timeout: 5000 });
  });

  test('投稿詳細が表示されること', async ({ page, request }) => {
    // ログイン
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    // テスト用投稿を作成
    const postResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: '詳細表示テスト投稿',
        content: 'これは詳細表示のテストです',
      },
    });

    const postData = await postResponse.json();
    const postId = postData.id;

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token, userData: user });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿をクリックして詳細ページに遷移
    await page.click(`text=詳細表示テスト投稿`);
    // URLが投稿詳細ページであることを確認（IDは動的）
    await expect(page).toHaveURL(/\/posts\/\d+/, { timeout: 5000 });

    // 投稿詳細が表示されることを確認
    await expect(page.locator('text=詳細表示テスト投稿')).toBeVisible();
    await expect(page.locator('text=これは詳細表示のテストです')).toBeVisible();
  });

  test('投稿を編集できること（所有者のみ）', async ({ page, request }) => {
    // ログイン
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    // テスト用投稿を作成
    const postResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: '編集前のタイトル',
        content: '編集前の本文',
      },
    });

    const postData = await postResponse.json();
    const postId = postData.id;

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token, userData: user });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // 編集ボタンが表示されることを確認
    await expect(page.locator('button:has-text("編集")')).toBeVisible();

    // 編集ページに遷移
    await page.click('button:has-text("編集")');
    await expect(page).toHaveURL(`/posts/${postId}/edit`);

    // フォームを編集
    await page.fill('input[name="title"]', '編集後のタイトル');
    await page.fill('textarea[name="content"]', '編集後の本文');

    // 更新する
    await page.click('button[type="submit"]');

    // 投稿詳細ページに戻り、更新内容が反映されていることを確認
    await expect(page).toHaveURL(`/posts/${postId}`);
    await expect(page.locator('text=編集後のタイトル')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=編集後の本文')).toBeVisible();
  });

  test('投稿を削除できること（所有者のみ）', async ({ page, request }) => {
    // ログイン
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    // テスト用投稿を作成
    const postResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: '削除テスト投稿',
        content: 'これは削除される投稿です',
      },
    });

    const postData = await postResponse.json();
    const postId = postData.id;

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token, userData: user });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // 削除ボタンが表示されることを確認
    await expect(page.locator('button:has-text("削除")')).toBeVisible();

    // 削除ボタンをクリック（確認ダイアログを自動でOKにする）
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.click('button:has-text("削除")');

    // ホームページにリダイレクトされることを確認
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // 投稿一覧を再読み込み
    await page.reload();
    await page.waitForTimeout(2000);

    // 削除した投稿が存在しないことを確認（APIで直接確認）
    const checkResponse = await request.get(`http://localhost:8080/api/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    expect(checkResponse.status()).toBe(404);
  });

  test('所有者以外は編集・削除ボタンが表示されないこと', async ({ page, request }) => {
    // テストユーザーでログインして投稿を作成
    const loginResponse1 = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData1 = await loginResponse1.json();
    const token1 = loginData1.token;

    // テスト用投稿を作成
    const postResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: '所有者チェックテスト投稿',
        content: 'これは所有者チェックのテストです',
      },
    });

    const postData = await postResponse.json();
    const postId = postData.id;

    // 他のユーザーでログイン
    const loginResponse2 = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: otherUsername,
        password: testPassword,
      },
    });

    const loginData2 = await loginResponse2.json();
    const token2 = loginData2.token;
    const user2 = loginData2.user;

    // ページにアクセスして他のユーザーでログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token: token2, userData: user2 });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿詳細ページに移動
    await page.goto(`/posts/${postId}`);
    await page.waitForTimeout(1000);

    // 編集・削除ボタンが表示されないことを確認
    await expect(page.locator('button:has-text("編集")')).not.toBeVisible();
    await expect(page.locator('button:has-text("削除")')).not.toBeVisible();
  });

  test('バリデーションエラーが表示されること', async ({ page, request }) => {
    // ログイン
    const loginResponse = await request.post('http://localhost:8080/api/auth/login', {
      data: {
        usernameOrEmail: testUsername,
        password: testPassword,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    // ページにアクセスしてログイン
    await page.goto('/');
    await page.evaluate(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }, { token, userData: user });

    await page.reload();
    await page.waitForTimeout(1000);

    // 投稿作成フォームを表示
    await page.click('text=投稿を作成');

    // タイトルなしで送信
    await page.fill('textarea[name="content"]', '本文のみ');
    await page.click('button[type="submit"]');

    // バリデーションエラーが表示されることを確認（HTML5バリデーションまたはエラーメッセージ）
    // HTML5バリデーションの場合、input要素にrequired属性があることを確認
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveAttribute('required');
    
    // エラーメッセージが表示される場合も確認
    const errorMessage = page.locator('text=/タイトル/');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 });
    }
  });
});

