/**
 * Tests for character-data.js
 * 文字データのテスト
 */

const {
    Character,
    basicHiraganaData,
    fullHiraganaData,
    katakanaData,
    getCharacterSetForAge,
    getCharactersByDifficulty,
    getRandomCharacters,
    findCharacterById
} = require('./character-data.js');

describe('Character Data Tests', () => {
    describe('Character Class', () => {
        test('should create a character with correct properties', () => {
            const char = new Character('あ', 'hiragana', 'a', 1);
            
            expect(char.id).toBe('あ');
            expect(char.type).toBe('hiragana');
            expect(char.romaji).toBe('a');
            expect(char.difficulty).toBe(1);
            expect(char.audioFile).toBe('sounds/hiragana/a.mp3');
        });

        test('should set default difficulty to 1', () => {
            const char = new Character('い', 'hiragana', 'i');
            expect(char.difficulty).toBe(1);
        });
    });

    describe('Character Data Sets', () => {
        test('basicHiraganaData should contain 25 characters (あ行〜な行)', () => {
            expect(basicHiraganaData).toHaveLength(25);
            expect(basicHiraganaData[0].id).toBe('あ');
            expect(basicHiraganaData[24].id).toBe('の');
        });

        test('fullHiraganaData should contain all hiragana characters', () => {
            expect(fullHiraganaData.length).toBeGreaterThan(basicHiraganaData.length);
            expect(fullHiraganaData).toEqual(expect.arrayContaining(basicHiraganaData));
        });

        test('katakanaData should contain katakana characters', () => {
            expect(katakanaData.length).toBeGreaterThan(0);
            expect(katakanaData[0].type).toBe('katakana');
            expect(katakanaData[0].id).toBe('ア');
        });

        test('all characters should have required properties', () => {
            const allCharacters = [...fullHiraganaData, ...katakanaData];
            
            allCharacters.forEach(char => {
                expect(char).toHaveProperty('id');
                expect(char).toHaveProperty('type');
                expect(char).toHaveProperty('romaji');
                expect(char).toHaveProperty('difficulty');
                expect(char).toHaveProperty('audioFile');
                expect(['hiragana', 'katakana']).toContain(char.type);
                expect(char.difficulty).toBeGreaterThanOrEqual(1);
                expect(char.difficulty).toBeLessThanOrEqual(3);
            });
        });
    });

    describe('Helper Functions', () => {
        test('getCharacterSetForAge should return correct sets', () => {
            const age3to4 = getCharacterSetForAge('3-4');
            expect(age3to4).toEqual(basicHiraganaData);

            const age5to6Hiragana = getCharacterSetForAge('5-6', 'hiragana');
            expect(age5to6Hiragana).toEqual(fullHiraganaData);

            const age5to6Katakana = getCharacterSetForAge('5-6', 'katakana');
            expect(age5to6Katakana).toEqual(katakanaData);

            const age5to6Mixed = getCharacterSetForAge('5-6', 'mixed');
            expect(age5to6Mixed).toEqual([...fullHiraganaData, ...katakanaData]);
        });

        test('getCharactersByDifficulty should filter correctly', () => {
            const difficulty1 = getCharactersByDifficulty(fullHiraganaData, 1);
            const difficulty2 = getCharactersByDifficulty(fullHiraganaData, 2);
            
            expect(difficulty1.length).toBeGreaterThan(0);
            expect(difficulty2.length).toBeGreaterThan(0);
            
            difficulty1.forEach(char => expect(char.difficulty).toBe(1));
            difficulty2.forEach(char => expect(char.difficulty).toBe(2));
        });

        test('getRandomCharacters should return requested count', () => {
            const random3 = getRandomCharacters(basicHiraganaData, 3);
            const random5 = getRandomCharacters(basicHiraganaData, 5);
            
            expect(random3).toHaveLength(3);
            expect(random5).toHaveLength(5);
            
            // Should not modify original array
            expect(basicHiraganaData).toHaveLength(25);
        });

        test('findCharacterById should find correct character', () => {
            const foundChar = findCharacterById(basicHiraganaData, 'あ');
            expect(foundChar).toBeDefined();
            expect(foundChar.id).toBe('あ');
            expect(foundChar.romaji).toBe('a');

            const notFound = findCharacterById(basicHiraganaData, 'ア');
            expect(notFound).toBeUndefined();
        });
    });
});