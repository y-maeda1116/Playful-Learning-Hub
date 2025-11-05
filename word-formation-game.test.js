/**
 * 単語形成ゲームのテスト
 * Tests for Word Formation Game
 */

const { WordFormationGame } = require('./word-formation-game.js');
const { vi } = require('vitest');

// モックDOM環境のセットアップ
const mockDOM = () => {
    global.document = {
        createElement: (tag) => ({
            tagName: tag.toUpperCase(),
            className: '',
            innerHTML: '',
            style: {},
            dataset: {},
            addEventListener: vi.fn(),
            appendChild: vi.fn(),
            querySelector: () => ({
                textContent: '',
                className: '',
                style: { display: 'block' },
                disabled: false,
                classList: {
                    add: vi.fn(),
                    remove: vi.fn(),
                    contains: () => false
                },
                addEventListener: vi.fn()
            }),
            querySelectorAll: () => [],
            classList: {
                add: vi.fn(),
                remove: vi.fn(),
                contains: () => false
            }
        }),
        querySelector: () => null,
        querySelectorAll: () => [],
        body: {
            appendChild: vi.fn(),
            removeChild: vi.fn()
        }
    };
    
    global.window = {
        CharacterData: require('./character-data.js')
    };
};

describe('WordFormationGame', () => {
    let mockContainer;
    let game;

    beforeEach(() => {
        mockDOM();
        mockContainer = {
            appendChild: vi.fn(),
            removeChild: vi.fn()
        };
    });

    afterEach(() => {
        if (game) {
            game.destroy();
        }
    });

    describe('初期化', () => {
        test('デフォルト設定でゲームが作成される', () => {
            game = new WordFormationGame(mockContainer);
            
            expect(game.ageGroup).toBe('5-6');
            expect(game.mode).toBe('hiragana');
            expect(game.currentLevel).toBe(1);
            expect(game.score).toBe(0);
            expect(game.isGameActive).toBe(true);
        });

        test('カスタム設定でゲームが作成される', () => {
            const options = {
                ageGroup: '5-6',
                mode: 'katakana',
                audioManager: { playFeedbackSound: vi.fn() }
            };
            
            game = new WordFormationGame(mockContainer, options);
            
            expect(game.ageGroup).toBe('5-6');
            expect(game.mode).toBe('katakana');
            expect(game.audioManager).toBeDefined();
        });
    });

    describe('難易度設定', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
        });

        test('レベル1の設定が正しい', () => {
            const settings = game.difficultySettings[1];
            
            expect(settings.wordLength).toBe(2);
            expect(settings.characterPool).toBe(8);
            expect(settings.hintLevel).toBe('high');
            expect(settings.examples).toContain('あか');
        });

        test('レベル2の設定が正しい', () => {
            const settings = game.difficultySettings[2];
            
            expect(settings.wordLength).toBe(3);
            expect(settings.characterPool).toBe(10);
            expect(settings.hintLevel).toBe('medium');
        });

        test('レベル3の設定が正しい', () => {
            const settings = game.difficultySettings[3];
            
            expect(settings.wordLength).toBe(4);
            expect(settings.characterPool).toBe(12);
            expect(settings.hintLevel).toBe('low');
        });
    });

    describe('単語データベース', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
        });

        test('レベル1の単語が正しく定義されている', () => {
            const level1Words = game.wordDatabase.level1;
            
            expect(level1Words).toBeDefined();
            expect(level1Words.length).toBeGreaterThan(0);
            
            const firstWord = level1Words[0];
            expect(firstWord).toHaveProperty('word');
            expect(firstWord).toHaveProperty('meaning');
            expect(firstWord).toHaveProperty('category');
            expect(firstWord).toHaveProperty('hint');
        });

        test('レベル2の単語が正しく定義されている', () => {
            const level2Words = game.wordDatabase.level2;
            
            expect(level2Words).toBeDefined();
            expect(level2Words.length).toBeGreaterThan(0);
            
            // 3文字以上の単語が含まれているかチェック
            const hasLongerWords = level2Words.some(word => word.word.length >= 3);
            expect(hasLongerWords).toBe(true);
        });

        test('レベル3の単語が正しく定義されている', () => {
            const level3Words = game.wordDatabase.level3;
            
            expect(level3Words).toBeDefined();
            expect(level3Words.length).toBeGreaterThan(0);
            
            // 4文字以上の単語が含まれているかチェック
            const hasLongerWords = level3Words.some(word => word.word.length >= 4);
            expect(hasLongerWords).toBe(true);
        });
    });

    describe('単語選択', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
        });

        test('レベルに応じた単語が選択される', () => {
            const level1Word = game.selectRandomWord(1);
            expect(level1Word).toBeDefined();
            expect(game.wordDatabase.level1).toContain(level1Word);

            const level2Word = game.selectRandomWord(2);
            expect(level2Word).toBeDefined();
            expect(game.wordDatabase.level2).toContain(level2Word);
        });

        test('存在しないレベルではnullが返される', () => {
            const invalidWord = game.selectRandomWord(99);
            expect(invalidWord).toBeNull();
        });
    });

    describe('文字生成', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
            game.currentWord = { word: 'あか', meaning: '赤', category: 'color', hint: '🔴' };
            game.currentLevel = 1;
        });

        test('利用可能な文字が正しく生成される', () => {
            game.generateAvailableCharacters();
            
            expect(game.availableCharacters).toBeDefined();
            expect(game.availableCharacters.length).toBe(8); // レベル1の設定
            
            // 正解の文字が含まれているかチェック
            expect(game.availableCharacters).toContain('あ');
            expect(game.availableCharacters).toContain('か');
        });

        test('ダミー文字が正しく生成される', () => {
            const targetChars = ['あ', 'か'];
            const dummyChars = game.generateDummyCharacters(targetChars, 3);
            
            expect(dummyChars).toBeDefined();
            expect(dummyChars.length).toBeLessThanOrEqual(3);
            
            // 正解文字が含まれていないかチェック
            dummyChars.forEach(char => {
                expect(targetChars).not.toContain(char);
            });
        });
    });

    describe('文字選択機能', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
            game.currentWord = { word: 'あか', meaning: '赤', category: 'color', hint: '🔴' };
        });

        test('文字が正しく選択される', () => {
            const mockButton = {
                disabled: false,
                classList: { add: vi.fn() }
            };
            
            game.selectCharacter('あ', mockButton);
            
            expect(game.selectedCharacters).toHaveLength(1);
            expect(game.selectedCharacters[0].character).toBe('あ');
            expect(mockButton.disabled).toBe(true);
        });

        test('最大文字数を超えて選択できない', () => {
            const mockButton = { disabled: false, classList: { add: vi.fn() } };
            
            // 最大文字数まで選択
            game.selectCharacter('あ', mockButton);
            game.selectCharacter('か', mockButton);
            
            // 3文字目を選択しようとする
            game.selectCharacter('さ', mockButton);
            
            expect(game.selectedCharacters).toHaveLength(2);
        });

        test('選択された文字が正しく削除される', () => {
            const mockButton = {
                disabled: true,
                classList: { add: vi.fn(), remove: vi.fn() }
            };
            
            game.selectedCharacters = [
                { character: 'あ', buttonElement: mockButton }
            ];
            
            game.removeSelectedCharacter(0);
            
            expect(game.selectedCharacters).toHaveLength(0);
            expect(mockButton.disabled).toBe(false);
        });
    });

    describe('単語チェック機能', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
            game.currentWord = { word: 'あか', meaning: '赤', category: 'color', hint: '🔴' };
            game.currentLevel = 1;
        });

        test('正解の単語が正しく判定される', () => {
            game.selectedCharacters = [
                { character: 'あ' },
                { character: 'か' }
            ];
            
            const initialScore = game.score;
            game.checkWord();
            
            expect(game.score).toBe(initialScore + 10); // レベル1 × 10点
        });

        test('不正解の単語が正しく判定される', () => {
            game.selectedCharacters = [
                { character: 'あ' },
                { character: 'い' }
            ];
            
            const initialScore = game.score;
            game.checkWord();
            
            expect(game.score).toBe(initialScore); // スコア変化なし
        });
    });

    describe('レベルアップ機能', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
        });

        test('レベルアップ条件が正しく判定される', () => {
            game.currentLevel = 1;
            game.score = 50; // 5問正解相当
            
            const shouldLevelUp = game.shouldLevelUp();
            expect(shouldLevelUp).toBe(true);
        });

        test('最大レベルではレベルアップしない', () => {
            game.currentLevel = 3;
            game.score = 150;
            
            const shouldLevelUp = game.shouldLevelUp();
            expect(shouldLevelUp).toBe(false);
        });

        test('レベルアップが正しく実行される', () => {
            game.currentLevel = 1;
            game.levelUp();
            
            expect(game.currentLevel).toBe(2);
        });
    });

    describe('進捗管理', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
        });

        test('進捗情報が正しく取得される', () => {
            game.score = 30;
            game.currentLevel = 2;
            game.totalQuestions = 5;
            
            const progress = game.getProgress();
            
            expect(progress.score).toBe(30);
            expect(progress.level).toBe(2);
            expect(progress.totalQuestions).toBe(5);
            expect(progress.mode).toBe('hiragana');
            expect(progress.ageGroup).toBe('5-6');
        });
    });

    describe('カテゴリ名変換', () => {
        beforeEach(() => {
            game = new WordFormationGame(mockContainer);
        });

        test('英語カテゴリ名が日本語に変換される', () => {
            expect(game.getCategoryName('color')).toBe('色');
            expect(game.getCategoryName('animal')).toBe('動物');
            expect(game.getCategoryName('nature')).toBe('自然');
            expect(game.getCategoryName('food')).toBe('食べ物');
        });

        test('未定義のカテゴリ名はそのまま返される', () => {
            expect(game.getCategoryName('unknown')).toBe('unknown');
        });
    });

    describe('ゲーム破棄', () => {
        test('ゲームが正しく破棄される', () => {
            game = new WordFormationGame(mockContainer);
            
            game.destroy();
            
            expect(game.isGameActive).toBe(false);
        });
    });
});