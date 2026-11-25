/**
 * きせつのイベント（季節のイベント機能）のテスト
 * Tests for SeasonalEvent
 */

const { initSeasonalEvent, getSeasonalEvent } = require('./seasonal-event.js');

describe('getSeasonalEvent', () => {
    test('10月20日はハロウィン', () => {
        expect(getSeasonalEvent(new Date(2026, 9, 20)).key).toBe('halloween');
    });

    test('11月1日はハロウィン', () => {
        expect(getSeasonalEvent(new Date(2026, 10, 1)).key).toBe('halloween');
    });

    test('1月3日はお正月', () => {
        expect(getSeasonalEvent(new Date(2026, 0, 3)).key).toBe('newyear');
    });

    test('12月25日はお正月期間', () => {
        expect(getSeasonalEvent(new Date(2026, 11, 25)).key).toBe('newyear');
    });

    test('8月15日は期間外でnull', () => {
        expect(getSeasonalEvent(new Date(2026, 7, 15))).toBeNull();
    });
});

describe('initSeasonalEvent', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'seasonal-banner';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('バナー不在でもエラーにならない', () => {
        expect(() => initSeasonalEvent(new Date(2026, 9, 20))).not.toThrow();
    });

    test('期間内はバナー表示', () => {
        initSeasonalEvent(new Date(2026, 9, 20)); // 10/20

        expect(container.querySelector('.seasonal-card')).not.toBeNull();
        expect(container.textContent).toContain('ハロウィン');
        expect(container.querySelector('.seasonal-play-btn')).not.toBeNull();
    });

    test('期間外はバナーが空', () => {
        initSeasonalEvent(new Date(2026, 7, 15)); // 8/15

        expect(container.querySelector('.seasonal-card')).toBeNull();
        expect(container.textContent).toBe('');
    });

    test('あそぶボタンでクイズ表示', () => {
        initSeasonalEvent(new Date(2026, 9, 20));
        container.querySelector('.seasonal-play-btn').click();

        expect(container.querySelector('.seasonal-quiz')).not.toBeNull();
        expect(container.querySelectorAll('.seasonal-choice-btn').length).toBe(3);
    });

    test('クイズ正解で「せいかい」', () => {
        initSeasonalEvent(new Date(2026, 9, 20));
        container.querySelector('.seasonal-play-btn').click();

        const correctBtn = Array.from(container.querySelectorAll('.seasonal-choice-btn'))
            .find(b => b.textContent === 'おばけのかめん');
        correctBtn.click();

        expect(container.querySelector('.seasonal-feedback').textContent).toContain('せいかい');
    });

    test('クイズ不正解で「ざんねん」', () => {
        initSeasonalEvent(new Date(2026, 9, 20));
        container.querySelector('.seasonal-play-btn').click();

        const wrongBtn = Array.from(container.querySelectorAll('.seasonal-choice-btn'))
            .find(b => b.textContent === 'ぼうし');
        wrongBtn.click();

        expect(container.querySelector('.seasonal-feedback').textContent).toContain('ざんねん');
    });

    test('お正月期間はお正月クイズ', () => {
        initSeasonalEvent(new Date(2026, 0, 3)); // 1/3
        container.querySelector('.seasonal-play-btn').click();

        expect(container.querySelector('.seasonal-question').textContent).toContain('おもちゃ');
    });
});
