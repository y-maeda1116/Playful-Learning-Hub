import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// HTMLの読み込み
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

// JSDOMのセットアップ
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.FileReader = dom.window.FileReader;
global.alert = vi.fn();

const { initUserContent } = require('./user-content.js');

describe('ユーザー作成コンテンツ機能', () => {
    beforeEach(() => {
        // JSDOMのウィンドウをリセット
        dom.reconfigure({ url: 'http://localhost' });
        document.documentElement.innerHTML = html;
        localStorage.clear();

        // 初期化関数を実行
        initUserContent();
    });

    it('不適切な単語をフィルタリングする', () => {
        const form = document.getElementById('create-quiz-form');
        const titleInput = document.getElementById('quiz-title');
        const questionInput = document.getElementById('quiz-question');
        const choiceInputs = document.querySelectorAll('.quiz-choice');

        titleInput.value = '馬鹿なクイズ';
        questionInput.value = 'これは死ねという問題ですか？';
        choiceInputs[0].value = 'はい';
        choiceInputs[1].value = 'いいえ';
        choiceInputs[2].value = 'アホ';
        choiceInputs[3].value = 'ばか';

        form.dispatchEvent(new window.Event('submit'));

        const quizList = document.getElementById('user-quiz-list');
        expect(quizList.innerHTML).toContain('***なクイズ');

        const storedQuizzes = JSON.parse(localStorage.getItem('userQuizzes'));
        const newQuiz = storedQuizzes[0];
        expect(newQuiz.title).toBe('***なクイズ');
        expect(newQuiz.question).toBe('これは***という問題ですか？');
        expect(newQuiz.choices[2]).toBe('***');
        expect(newQuiz.choices[3]).toBe('***');
    });

    it('新しいクイズを作成し、表示する', () => {
        const form = document.getElementById('create-quiz-form');
        const titleInput = document.getElementById('quiz-title');
        const questionInput = document.getElementById('quiz-question');
        const choiceInputs = document.querySelectorAll('.quiz-choice');

        titleInput.value = '動物クイズ';
        questionInput.value = 'ネコ科の動物は？';
        choiceInputs[0].value = 'ライオン';
        choiceInputs[1].value = 'イヌ';
        choiceInputs[2].value = 'ゾウ';
        choiceInputs[3].value = 'キリン';

        form.dispatchEvent(new window.Event('submit'));

        const quizList = document.getElementById('user-quiz-list');
        expect(quizList.children.length).toBe(1);
        expect(quizList.innerHTML).toContain('動物クイズ');

        const storedQuizzes = JSON.parse(localStorage.getItem('userQuizzes'));
        expect(storedQuizzes.length).toBe(1);
        expect(storedQuizzes[0].title).toBe('動物クイズ');
        expect(storedQuizzes[0].correctAnswer).toBe('ライオン');
    });

    it('クイズを報告するとアラートが表示される', () => {
        const form = document.getElementById('create-quiz-form');
        const titleInput = document.getElementById('quiz-title');
        const questionInput = document.getElementById('quiz-question');
        const choiceInputs = document.querySelectorAll('.quiz-choice');

        titleInput.value = '報告テスト';
        questionInput.value = '報告される？';
        choiceInputs[0].value = 'はい';
        choiceInputs[1].value = 'いいえ';
        choiceInputs[2].value = 'かも';
        choiceInputs[3].value = 'しれない';

        form.dispatchEvent(new window.Event('submit'));

        const reportButton = document.querySelector('.report-quiz-btn');
        reportButton.dispatchEvent(new window.Event('click'));

        expect(alert).toHaveBeenCalledWith('クイズが報告されました。');
    });
});
