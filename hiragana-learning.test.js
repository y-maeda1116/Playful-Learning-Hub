/**
 * ひらがな・カタカナ学習ゲームのテスト
 * Tests for Hiragana and Katakana Learning Game
 */

const { HiraganaLearningGame } = require('./hiragana-learning.js');
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
        querySelectorAll: () => []
    };
    
    global.window = {
        CharacterData: require('./character-data.js')
    };
};

describe('HiraganaLearningGame', () => {
    let mockContainer;
    
    beforeEach(() => {
        mockDOM();
        mockContainer = {
            appendChild: vi.fn()
        };
    });
    
    describe('初期化', () => {
        test('3-4歳向けゲームが正しく初期化される', () => {
            const game = new HiraganaLearningGame('3-4', mockContainer);
            
            expect(game.ageGroup).toBe('3-4');
            expect(game.mode).toBe('hiragana');
            expect(game.difficultySettings.choiceCount).toBe(3);
            expect(game.characters.length).toBeGreaterThan(0);
            expect(game.isGameActive).toBe(true);
        });
        
        test('5-6歳向けゲームが正しく初期化される', () => {
            const game = new HiraganaLearningGame('5-6', mockContainer);
            
            expect(game.ageGroup).toBe('5-6');
            expect(game.difficultySettings.choiceCount).toBe(4);
            expect(game.characters.length).toBeGreaterThan(0);
        });
    });
    
    describe('難易度設定', () => {
        test('年齢別難易度設定が正しく取得される', () => {
            const game34 = new HiraganaLearningGame('3-4', mockContainer);
            const game56 = new HiraganaLearningGame('5-6', mockContainer);
            
            expect(game34.difficultySettings.choiceCount).toBe(3);
            expect(game34.difficultySettings.characterRange).toBe('basic');
            expect(game34.difficultySettings.maxDifficulty).toBe(1);
            
            expect(game56.difficultySettings.choiceCount).toBe(4);
            expect(game56.difficultySettings.characterRange).toBe('full');
            expect(game56.difficultySettings.maxDifficulty).toBe(3);
        });
    });
    
    describe('文字セット取得', () => {
        test('3-4歳向けは基本ひらがなのみ取得される', () => {
            const game = new HiraganaLearningGame('3-4', mockContainer);
            
            expect(game.characters.every(char => char.type === 'hiragana')).toBe(true);
            expect(game.characters.every(char => char.difficulty <= 1)).toBe(true);
        });
        
        test('5-6歳向けひらがなモードで全ひらがなが取得される', () => {
            const game = new HiraganaLearningGame('5-6', mockContainer, { mode: 'hiragana' });
            
            expect(game.characters.every(char => char.type === 'hiragana')).toBe(true);
            expect(game.characters.length).toBeGreaterThan(25); // 基本文字より多い
        });
        
        test('5-6歳向けカタカナモードでカタカナが取得される', () => {
            const game = new HiraganaLearningGame('5-6', mockContainer, { mode: 'katakana' });
            
            expect(game.characters.every(char => char.type === 'katakana')).toBe(true);
        });
    });
    
    describe('選択肢生成', () => {
        test('3-4歳向けで3つの選択肢が生成される', () => {
            const game = new HiraganaLearningGame('3-4', mockContainer);
            const targetChar = game.characters[0];
            const choices = game.generateChoices(targetChar);
            
            expect(choices.length).toBe(3);
            expect(choices.includes(targetChar)).toBe(true);
        });
        
        test('5-6歳向けで4つの選択肢が生成される', () => {
            const game = new HiraganaLearningGame('5-6', mockContainer);
            const targetChar = game.characters[0];
            const choices = game.generateChoices(targetChar);
            
            expect(choices.length).toBe(4);
            expect(choices.includes(targetChar)).toBe(true);
        });
        
        test('選択肢は同じタイプの文字から生成される', () => {
            const game = new HiraganaLearningGame('5-6', mockContainer, { mode: 'mixed' });
            const hiraganaChar = game.characters.find(char => char.type === 'hiragana');
            const choices = game.generateChoices(hiraganaChar);
            
            expect(choices.every(char => char.type === 'hiragana')).toBe(true);
        });
    });
    
    describe('回答判定', () => {
        test('正解の判定が正しく行われる', () => {
            const game = new HiraganaLearningGame('3-4', mockContainer);
            game.currentCharacter = game.characters[0];
            
            // 正解の場合
            game.handleAnswer(game.currentCharacter);
            expect(game.score).toBe(1);
        });
        
        test('不正解の判定が正しく行われる', () => {
            const game = new HiraganaLearningGame('3-4', mockContainer);
            game.currentCharacter = game.characters[0];
            const wrongChar = game.characters[1];
            
            // 不正解の場合
            game.handleAnswer(wrongChar);
            expect(game.score).toBe(0);
        });
    });
    
    describe('励ましメッセージ', () => {
        test('年齢に応じた励ましメッセージが取得される', () => {
            const game34 = new HiraganaLearningGame('3-4', mockContainer);
            const game56 = new HiraganaLearningGame('5-6', mockContainer);
            
            const message34 = game34.getEncouragementMessages(true);
            const message56 = game56.getEncouragementMessages(true);
            
            expect(message34.message).toBeDefined();
            expect(message34.icon).toBeDefined();
            expect(message56.message).toBeDefined();
            expect(message56.icon).toBeDefined();
        });
    });
    
    describe('進捗情報', () => {
        test('進捗情報が正しく取得される', () => {
            const game = new HiraganaLearningGame('3-4', mockContainer);
            game.score = 5;
            game.totalQuestions = 10;
            
            const progress = game.getProgress();
            
            expect(progress.score).toBe(5);
            expect(progress.totalQuestions).toBe(10);
            expect(progress.accuracy).toBe(50);
            expect(progress.mode).toBe('hiragana');
            expect(progress.ageGroup).toBe('3-4');
        });
    });
    
    describe('モード切り替え', () => {
        test('モードが正しく切り替わる', () => {
            const game = new HiraganaLearningGame('5-6', mockContainer);
            
            game.switchMode('katakana');
            expect(game.mode).toBe('katakana');
            expect(game.characters.every(char => char.type === 'katakana')).toBe(true);
        });
    });
});