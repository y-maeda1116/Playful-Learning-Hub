/**
 * クイズをつくろう（ユーザー作成コンテンツ）のテスト
 * Tests for UserContent
 */

const { initUserContent } = require('./user-content.js');

describe('initUserContent', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'user-content';
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

    function fillCreateForm(question, choiceTexts, answerIndex) {
        document.getElementById('uc-question').value = question;
        const choices = document.querySelectorAll('.uc-choice');
        choiceTexts.forEach((t, i) => { choices[i].value = t; });
        if (typeof answerIndex === 'number') {
            document.querySelectorAll('.uc-answer-radio')[answerIndex].checked = true;
        }
    }

    test('コンテナが存在する場合、メニューUIが作成される', () => {
        initUserContent();

        expect(container.querySelector('#uc-create-btn')).not.toBeNull();
        expect(container.querySelector('#uc-list')).not.toBeNull();
    });

    test('コンテナが存在しない場合はエラーにならない', () => {
        expect(() => initUserContent()).not.toThrow();
    });

    test('初期状態はリストが空のメッセージ', () => {
        initUserContent();

        expect(container.querySelector('#uc-list').textContent).toContain('まだありません');
    });

    test('つくるボタンで作成フォームが表示される', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();

        expect(container.querySelector('#uc-question')).not.toBeNull();
        expect(container.querySelectorAll('.uc-choice').length).toBe(4);
        expect(container.querySelector('#uc-save-btn')).not.toBeNull();
    });

    test('クイズを作成して保存するとリストに表示される', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();
        fillCreateForm('1+1は？', ['1', '2', '3', '4'], 1);
        container.querySelector('#uc-save-btn').click();

        expect(container.querySelector('#uc-list').textContent).toContain('1+1は？');
    });

    test('問題未入力は保存されずメッセージ表示', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();
        fillCreateForm('', ['1', '2', '3', '4'], 1);
        container.querySelector('#uc-save-btn').click();

        expect(container.querySelector('#uc-message').textContent).toContain('もんだい');
    });

    test('正解未選択は保存されずメッセージ表示', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();
        fillCreateForm('問題', ['1', '2', '3', '4'], null);
        container.querySelector('#uc-save-btn').click();

        expect(container.querySelector('#uc-message').textContent).toContain('せいかい');
    });

    test('NGワード含む場合は保存を拒否', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();
        fillCreateForm('ばか', ['1', '2', '3', '4'], 1);
        container.querySelector('#uc-save-btn').click();

        expect(container.querySelector('#uc-message').textContent).toContain('つかえない');
    });

    test('作成クイズをプレイして正解', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();
        fillCreateForm('1+1は？', ['1', '2', '3', '4'], 1);
        container.querySelector('#uc-save-btn').click();

        // カードの「あそぶ」をクリック
        const playBtn = Array.from(container.querySelectorAll('.uc-card .uc-button'))
            .find(b => b.textContent === 'あそぶ');
        playBtn.click();

        // 正解(2=index1)をクリック
        const correctBtn = Array.from(container.querySelectorAll('.uc-choice-btn'))
            .find(b => b.textContent === '2');
        correctBtn.click();

        expect(container.querySelector('#uc-feedback').textContent).toContain('せいかい');
        expect(correctBtn.classList.contains('correct')).toBe(true);
    });

    test('報告するとカードがreportedマーク付きで再描画', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();
        fillCreateForm('問題', ['a', 'b', 'c', 'd'], 0);
        container.querySelector('#uc-save-btn').click();

        const reportBtn = Array.from(container.querySelectorAll('.uc-card .uc-button'))
            .find(b => b.textContent === 'ほうこく');
        reportBtn.click();

        expect(container.querySelector('.uc-card.reported')).not.toBeNull();
    });

    test('削除するとリストから消える', () => {
        initUserContent();
        container.querySelector('#uc-create-btn').click();
        fillCreateForm('問題', ['a', 'b', 'c', 'd'], 0);
        container.querySelector('#uc-save-btn').click();
        expect(container.querySelectorAll('.uc-card').length).toBe(1);

        const delBtn = Array.from(container.querySelectorAll('.uc-card .uc-button'))
            .find(b => b.textContent === 'けす');
        delBtn.click();

        expect(container.querySelector('#uc-list').textContent).toContain('まだありません');
    });
});
