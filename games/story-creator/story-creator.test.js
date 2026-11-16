/**
 * ものがたりづくり（物語作成ツール）のテスト
 * Tests for StoryCreator
 */

const { initStoryCreator } = require('./story-creator.js');

describe('initStoryCreator', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'story-creator';
        document.body.appendChild(container);
        const store = {};
        window.localStorage = {
            getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            removeItem: (k) => { delete store[k]; },
            clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        };
    });

    afterEach(() => {
        document.body.removeChild(container);
        delete window.localStorage;
    });

    test('コンテナが存在する場合、UIが作成される', () => {
        initStoryCreator();

        expect(container.querySelector('#story-scene')).not.toBeNull();
        expect(container.querySelector('#story-saved')).not.toBeNull();
        expect(container.querySelector('#story-restart-btn')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initStoryCreator()).not.toThrow();
    });

    test('開始ノードのテキストと選択肢2つが表示される', () => {
        initStoryCreator();

        expect(container.querySelector('#story-text').textContent).toContain('もり');
        expect(container.querySelectorAll('.story-choice-btn').length).toBe(2);
    });

    test('選択肢をクリックすると次のノードへ進む', () => {
        initStoryCreator();

        const rightBtn = Array.from(container.querySelectorAll('.story-choice-btn'))
            .find(b => b.dataset.next === 'river');
        rightBtn.click();

        expect(container.querySelector('#story-text').textContent).toContain('かわ');
    });

    test('保存済み一覧は初期状態で「まだありません」', () => {
        initStoryCreator();

        expect(container.querySelector('#story-saved').textContent).toContain('まだありません');
    });

    test('終了ノードまで進むと「おしまい」表示と保存される', () => {
        initStoryCreator();

        // start → river → treasure（終了）
        container.querySelector('[data-next="river"]').click();
        container.querySelector('[data-next="treasure"]').click();

        expect(container.querySelector('.story-end').textContent).toContain('おしまい');
        const items = container.querySelectorAll('.story-saved-item');
        expect(items.length).toBe(1);
    });

    test('保存した物語をクリックすると内容が表示される', () => {
        initStoryCreator();

        container.querySelector('[data-next="river"]').click();
        container.querySelector('[data-next="treasure"]').click();

        container.querySelector('.story-saved-item').click();

        expect(container.querySelector('#story-text').textContent).toContain('たからもの');
    });

    test('はじめからボタンで開始ノードに戻る', () => {
        initStoryCreator();

        container.querySelector('[data-next="river"]').click();
        container.querySelector('#story-restart-btn').click();

        expect(container.querySelector('#story-text').textContent).toContain('もり');
        expect(container.querySelectorAll('.story-choice-btn').length).toBe(2);
    });
});
