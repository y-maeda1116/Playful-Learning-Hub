/**
 * 漢字パズルゲームのテスト
 * Tests for KanjiPuzzle
 */

const { KanjiPuzzle } = require('./kanji-puzzle.js');

describe('KanjiPuzzle', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'kanji-puzzle-game';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('初期化', () => {
        test('デフォルト設定でインスタンスが作成される', () => {
            const puzzle = new KanjiPuzzle(container);

            expect(puzzle.ageGroup).toBe('7-8');
            expect(puzzle.currentGrade).toBe(1);
            expect(puzzle.score).toBe(0);
            expect(puzzle.totalQuestions).toBe(0);
            expect(puzzle.isGameActive).toBe(true);
            puzzle.destroy();
        });

        test('カスタムオプションが反映される', () => {
            const puzzle = new KanjiPuzzle(container, {
                ageGroup: '9-10',
                startGrade: 2,
            });

            expect(puzzle.ageGroup).toBe('9-10');
            expect(puzzle.currentGrade).toBe(2);
            puzzle.destroy();
        });

        test('コンテナにDOM要素が作成される', () => {
            const puzzle = new KanjiPuzzle(container);

            expect(container.querySelector('.kanji-puzzle-header')).not.toBeNull();
            expect(container.querySelector('.kanji-question-area')).not.toBeNull();
            expect(container.querySelector('.kanji-choices-area')).not.toBeNull();
            expect(container.querySelector('.kanji-feedback')).not.toBeNull();
            puzzle.destroy();
        });

        test('コンテナがnullの場合はエラーにならない', () => {
            expect(() => new KanjiPuzzle(null)).not.toThrow();
        });
    });

    describe('漢字データ', () => {
        test('各学年のデータが存在する', () => {
            const puzzle = new KanjiPuzzle(container);

            expect(puzzle.kanjiDatabase.grade1).toBeDefined();
            expect(puzzle.kanjiDatabase.grade2).toBeDefined();
            expect(puzzle.kanjiDatabase.grade3).toBeDefined();
            expect(puzzle.kanjiDatabase.grade4).toBeDefined();
            expect(puzzle.kanjiDatabase.grade5).toBeDefined();
            expect(puzzle.kanjiDatabase.grade6).toBeDefined();
            puzzle.destroy();
        });

        test('各漢字が必要なプロパティを持つ', () => {
            const puzzle = new KanjiPuzzle(container);

            Object.values(puzzle.kanjiDatabase).forEach(gradeList => {
                gradeList.forEach(entry => {
                    expect(entry).toHaveProperty('kanji');
                    expect(entry).toHaveProperty('reading');
                    expect(entry).toHaveProperty('meaning');
                    expect(entry).toHaveProperty('hint');
                });
            });
            puzzle.destroy();
        });

        test('構成データが存在する', () => {
            const puzzle = new KanjiPuzzle(container);

            expect(puzzle.compositions.length).toBeGreaterThan(0);
            puzzle.compositions.forEach(comp => {
                expect(comp).toHaveProperty('left');
                expect(comp).toHaveProperty('right');
                expect(comp).toHaveProperty('result');
                expect(comp).toHaveProperty('hint');
            });
            puzzle.destroy();
        });
    });

    describe('getAvailableKanji', () => {
        test('7-8歳はgrade1のデータを返す', () => {
            const puzzle = new KanjiPuzzle(container, { ageGroup: '7-8' });

            const kanji = puzzle.getAvailableKanji();
            expect(kanji.length).toBe(20); // grade1 only
            expect(kanji[0].kanji).toBe('一');
            puzzle.destroy();
        });

        test('9-10歳は設定された学年範囲のデータを返す', () => {
            const puzzle = new KanjiPuzzle(container, {
                ageGroup: '9-10',
                startGrade: 2,
            });

            const kanji = puzzle.getAvailableKanji();
            expect(kanji.length).toBe(40); // grade1 + grade2
            puzzle.destroy();
        });
    });

    describe('generateReadingProblem', () => {
        test('読み問題が正しく生成される', () => {
            const puzzle = new KanjiPuzzle(container);

            const problem = puzzle.generateReadingProblem();

            expect(problem).not.toBeNull();
            expect(problem.type).toBe('reading');
            expect(problem.choices.length).toBe(4);
            expect(problem.choices).toContain(problem.answer);
            expect(problem.display).toBeDefined();
            puzzle.destroy();
        });
    });

    describe('generateCompositionProblem', () => {
        test('構成問題が正しく生成される', () => {
            const puzzle = new KanjiPuzzle(container, {
                ageGroup: '9-10',
                startGrade: 2,
            });

            const problem = puzzle.generateCompositionProblem();

            expect(problem).not.toBeNull();
            expect(['reading', 'composition']).toContain(problem.type);
            if (problem.type === 'composition') {
                expect(problem.choices.length).toBe(4);
                expect(problem.choices).toContain(problem.answer);
                expect(problem.display).toContain('+');
            }
            puzzle.destroy();
        });
    });

    describe('checkAnswer', () => {
        test('正解時にスコアが増える', () => {
            const puzzle = new KanjiPuzzle(container);
            puzzle.currentProblem = {
                type: 'reading',
                display: '山',
                answer: 'やま',
                choices: ['やま', 'かわ', 'た', 'そら'],
            };

            const btn = document.createElement('button');
            const prevScore = puzzle.score;

            puzzle.checkAnswer('やま', btn);

            expect(puzzle.score).toBe(prevScore + 1);
            expect(btn.classList.contains('correct')).toBe(true);
            expect(puzzle.feedbackArea.textContent).toContain('せいかい');
            puzzle.destroy();
        });

        test('不正解時にスコアは増えない', () => {
            const puzzle = new KanjiPuzzle(container);
            puzzle.currentProblem = {
                type: 'reading',
                display: '山',
                answer: 'やま',
                choices: ['やま', 'かわ', 'た', 'そら'],
            };

            const btn = document.createElement('button');

            puzzle.checkAnswer('かわ', btn);

            expect(puzzle.score).toBe(0);
            expect(btn.classList.contains('incorrect')).toBe(true);
            expect(puzzle.feedbackArea.textContent).toContain('ざんねん');
            puzzle.destroy();
        });
    });

    describe('advanceGrade', () => {
        test('5問正解で学年が進む', () => {
            const puzzle = new KanjiPuzzle(container, { ageGroup: '7-8' });

            expect(puzzle.currentGrade).toBe(1);

            puzzle.correctInLevel = 5;
            puzzle.advanceGrade();

            expect(puzzle.currentGrade).toBe(2);
            expect(puzzle.correctInLevel).toBe(0);
            puzzle.destroy();
        });

        test('最大学年を超えない', () => {
            const puzzle = new KanjiPuzzle(container, { ageGroup: '7-8' });
            puzzle.currentGrade = 2;
            puzzle.correctInLevel = 5;

            puzzle.advanceGrade();

            expect(puzzle.currentGrade).toBe(2); // 7-8歳の上限
            puzzle.destroy();
        });
    });

    describe('getProgress', () => {
        test('進捗情報が正しく返される', () => {
            const puzzle = new KanjiPuzzle(container);
            puzzle.score = 3;
            puzzle.totalQuestions = 5;

            const progress = puzzle.getProgress();

            expect(progress.score).toBe(3);
            expect(progress.totalQuestions).toBe(5);
            expect(progress.currentGrade).toBe(1);
            expect(progress.isGameActive).toBe(true);
            puzzle.destroy();
        });
    });

    describe('destroy', () => {
        test('ゲームが停止しコンテナがクリアされる', () => {
            const puzzle = new KanjiPuzzle(container);

            puzzle.destroy();

            expect(puzzle.isGameActive).toBe(false);
            expect(container.querySelector('.kanji-puzzle-header')).toBeNull();
        });
    });
});
