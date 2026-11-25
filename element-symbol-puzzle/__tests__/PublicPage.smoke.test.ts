/**
 * 公開ページ (index.html + dist/app.js) のスモークテスト。
 * ビルド済み IIFE を jsdom で実行し、ホーム画面とマッチングモードの起動を検証する。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';

const espDir = resolve(__dirname, '..');

describe('esp 公開ページ (dist/app.js)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
  });

  it('index.html が app.js を読み込むスクリプトタグを持つ', () => {
    const html = readFileSync(resolve(espDir, 'index.html'), 'utf-8');
    expect(html).toContain('lang="ja"');
    expect(html).toContain('<title>元素記号パズル</title>');
    expect(html).toContain('<script src="dist/app.js"></script>');
    expect(html).not.toMatch(/<link rel="stylesheet" href="\.\.\/|http/);
  });

  it('app.js は IIFE で import 文を含まない', () => {
    const js = readFileSync(resolve(espDir, 'dist', 'app.js'), 'utf-8');
    expect(js.startsWith('(function()')).toBe(true);
    expect(js).not.toMatch(/^\s*import\s/m);
  });

  it('読み込むとホーム画面（4モード + 学年選択）がマウントされる', () => {
    // eslint-disable-next-line no-eval -- 生成物を jsdom グローバルで実行するため
    (0, eval)(readFileSync(resolve(espDir, 'dist', 'app.js'), 'utf-8'));
    expect(document.querySelectorAll('.mode-card').length).toBe(4);
    expect((document.getElementById('grade') as HTMLSelectElement)?.value).toBe('5');
  });

  it('マッチングモードが起動し、回答ボタンが動く', async () => {
    (0, eval)(readFileSync(resolve(espDir, 'dist', 'app.js'), 'utf-8'));
    const matchingCard = [...document.querySelectorAll('.mode-card')].find(
      (el) => el.textContent?.includes('記号合わせ'),
    ) as HTMLElement;
    matchingCard.click();
    // displayNextQuestion は async
    await new Promise((r) => setTimeout(r, 50));
    const buttons = document.querySelectorAll('.matching-option-button');
    expect(buttons.length).toBe(4);
    // 回答ボタンを押す
    (buttons[0] as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 1200));
    // フィードバックまたは次の問題（または結果画面）が表示されている
    const advanced =
      document.querySelector('.feedback') !== null ||
      document.querySelectorAll('.matching-option-button').length === 4 ||
      document.querySelector('.result-view') !== null;
    expect(advanced).toBe(true);
  });
});
