/**
 * ひらがなとカタカナの文字データ定義
 * Character data definitions for Hiragana and Katakana learning
 */

// 基本的な文字オブジェクト構造
class Character {
    constructor(id, type, romaji, difficulty = 1, strokeOrder = []) {
        this.id = id;
        this.type = type; // 'hiragana' | 'katakana'
        this.romaji = romaji;
        this.difficulty = difficulty; // 1: 基本, 2: 中級, 3: 上級
        this.strokeOrder = strokeOrder;
        this.audioFile = `sounds/${type}/${romaji}.mp3`;
    }
}

// ひらがなデータ（あ行〜な行：3-4歳向け基本文字）
const basicHiraganaData = [
    // あ行
    new Character('あ', 'hiragana', 'a', 1, [
        { path: 'M30,20 Q50,10 70,30 Q80,50 70,70 Q60,80 50,70', order: 1 },
        { path: 'M20,40 Q40,35 60,40 Q80,45 90,60', order: 2 },
        { path: 'M50,60 Q60,80 80,90', order: 3 }
    ]),
    new Character('い', 'hiragana', 'i', 1, [
        { path: 'M30,20 L30,80', order: 1 },
        { path: 'M60,30 Q70,50 60,70 Q50,80 40,70', order: 2 }
    ]),
    new Character('う', 'hiragana', 'u', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 Q60,50 50,70 Q40,80 30,70', order: 2 }
    ]),
    new Character('え', 'hiragana', 'e', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M30,50 Q60,45 90,50', order: 2 },
        { path: 'M50,50 Q60,70 50,85', order: 3 }
    ]),
    new Character('お', 'hiragana', 'o', 1, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M30,40 Q60,35 90,40', order: 2 },
        { path: 'M50,40 Q60,60 50,80 Q40,90 30,80', order: 3 },
        { path: 'M70,60 Q80,80 90,90', order: 4 }
    ]),
    
    // か行
    new Character('か', 'hiragana', 'ka', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M30,50 Q60,45 90,50', order: 2 },
        { path: 'M50,50 Q60,70 50,85', order: 3 }
    ]),
    new Character('き', 'hiragana', 'ki', 1, [
        { path: 'M30,20 L30,80', order: 1 },
        { path: 'M60,30 Q70,50 60,70', order: 2 },
        { path: 'M20,60 Q50,55 80,60', order: 3 }
    ]),
    new Character('く', 'hiragana', 'ku', 1, [
        { path: 'M20,30 Q50,60 80,90', order: 1 }
    ]),
    new Character('け', 'hiragana', 'ke', 1, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M30,40 Q60,35 90,40', order: 2 },
        { path: 'M50,60 Q70,80 90,90', order: 3 }
    ]),
    new Character('こ', 'hiragana', 'ko', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M20,60 Q50,55 80,60', order: 2 }
    ]),
    
    // さ行
    new Character('さ', 'hiragana', 'sa', 1, [
        { path: 'M35,20 Q30,40 25,55 Q22,65 20,75', order: 1 },
        { path: 'M20,45 Q50,40 80,45', order: 2 },
        { path: 'M65,20 Q75,40 70,60 Q65,75 55,85', order: 3 }
    ]),
    new Character('し', 'hiragana', 'shi', 1, [
        { path: 'M40,20 Q50,50 60,80', order: 1 }
    ]),
    new Character('す', 'hiragana', 'su', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 Q52,55 50,80', order: 2 },
        { path: 'M50,60 Q38,68 28,80', order: 3 }
    ]),
    new Character('せ', 'hiragana', 'se', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 L50,85', order: 2 },
        { path: 'M50,55 L80,75', order: 3 }
    ]),
    new Character('そ', 'hiragana', 'so', 1, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M40,45 Q60,70 80,90', order: 2 }
    ]),
    
    // た行
    new Character('た', 'hiragana', 'ta', 1, [
        { path: 'M20,25 Q35,20 50,25', order: 1 },
        { path: 'M20,50 Q50,45 80,50', order: 2 },
        { path: 'M35,50 L35,85', order: 3 },
        { path: 'M35,50 Q45,65 55,80 Q60,88 70,90', order: 4 }
    ]),
    new Character('ち', 'hiragana', 'chi', 1, [
        { path: 'M30,20 Q50,18 70,25', order: 1 },
        { path: 'M30,20 Q35,45 40,60 Q50,75 70,85', order: 2 }
    ]),
    new Character('つ', 'hiragana', 'tsu', 1, [
        { path: 'M15,50 Q35,45 50,50', order: 1 },
        { path: 'M50,50 Q65,45 85,50', order: 2 },
        { path: 'M50,50 Q52,65 50,85', order: 3 }
    ]),
    new Character('て', 'hiragana', 'te', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M30,30 Q35,50 40,65 Q50,80 70,85', order: 2 }
    ]),
    new Character('と', 'hiragana', 'to', 1, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M50,25 Q40,45 35,60 Q40,75 55,85', order: 2 }
    ]),

    // な行
    new Character('な', 'hiragana', 'na', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 L50,80', order: 2 },
        { path: 'M50,55 Q35,65 25,75', order: 3 },
        { path: 'M50,55 Q65,65 75,75 Q80,82 85,90', order: 4 }
    ]),
    new Character('に', 'hiragana', 'ni', 1, [
        { path: 'M30,20 L30,80', order: 1 },
        { path: 'M30,50 Q50,45 70,50', order: 2 },
        { path: 'M55,50 Q60,60 65,70', order: 3 }
    ]),
    new Character('ぬ', 'hiragana', 'nu', 1, [
        { path: 'M20,35 Q40,30 55,40 Q65,50 60,65 Q55,80 40,90', order: 1 },
        { path: 'M60,65 Q70,70 80,80', order: 2 }
    ]),
    new Character('ね', 'hiragana', 'ne', 1, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M30,30 Q35,55 50,70 Q65,80 80,85', order: 2 }
    ]),
    new Character('の', 'hiragana', 'no', 1, [
        { path: 'M25,25 Q35,45 45,55 Q55,65 70,75 Q80,82 85,90', order: 1 }
    ])
];

// 全ひらがなデータ（5-6歳向け）
const fullHiraganaData = [
    ...basicHiraganaData,
    
    // は行
    new Character('は', 'hiragana', 'ha', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 Q52,55 50,80', order: 2 },
        { path: 'M50,55 Q65,70 80,80', order: 3 }
    ]),
    new Character('ひ', 'hiragana', 'hi', 2, [
        { path: 'M30,20 Q50,18 70,25', order: 1 },
        { path: 'M30,40 Q50,45 70,40', order: 2 },
        { path: 'M50,40 Q55,60 50,80', order: 3 }
    ]),
    new Character('ふ', 'hiragana', 'fu', 2, [
        { path: 'M25,30 Q40,25 55,30', order: 1 },
        { path: 'M55,30 Q70,25 85,30', order: 2 },
        { path: 'M25,30 Q28,50 35,65', order: 3 },
        { path: 'M55,30 Q58,50 65,65', order: 4 }
    ]),
    new Character('へ', 'hiragana', 'he', 2, [
        { path: 'M20,30 Q40,50 60,70 Q70,80 85,90', order: 1 }
    ]),
    new Character('ほ', 'hiragana', 'ho', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 Q52,55 50,80', order: 2 },
        { path: 'M50,55 Q35,65 25,75', order: 3 },
        { path: 'M50,55 Q65,65 75,75', order: 4 }
    ]),

    // ま行
    new Character('ま', 'hiragana', 'ma', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 L50,80', order: 2 },
        { path: 'M50,55 Q65,65 80,75 Q85,82 90,90', order: 3 }
    ]),
    new Character('み', 'hiragana', 'mi', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 Q52,55 50,80', order: 2 },
        { path: 'M50,80 Q60,72 70,65 Q80,58 90,50', order: 3 }
    ]),
    new Character('む', 'hiragana', 'mu', 2, [
        { path: 'M25,30 Q50,25 75,30', order: 1 },
        { path: 'M50,30 L50,70', order: 2 },
        { path: 'M25,70 Q50,85 75,80 Q85,75 80,65', order: 3 }
    ]),
    new Character('め', 'hiragana', 'me', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M30,30 Q35,50 40,65 Q50,80 70,85', order: 2 }
    ]),
    new Character('も', 'hiragana', 'mo', 2, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M20,50 Q50,45 80,50', order: 2 },
        { path: 'M50,50 Q52,65 50,80', order: 3 }
    ]),

    // や行
    new Character('や', 'hiragana', 'ya', 2, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M35,25 Q38,50 35,75 Q30,85 25,90', order: 2 }
    ]),
    new Character('ゆ', 'hiragana', 'yu', 2, [
        { path: 'M25,30 Q50,25 75,30', order: 1 },
        { path: 'M50,30 Q55,50 50,70 Q40,85 25,90 Q35,75 55,80', order: 2 }
    ]),
    new Character('よ', 'hiragana', 'yo', 2, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M30,25 Q35,50 40,65 Q50,80 70,85', order: 2 }
    ]),

    // ら行
    new Character('ら', 'hiragana', 'ra', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M30,30 Q35,50 40,65 Q50,80 70,85', order: 2 }
    ]),
    new Character('り', 'hiragana', 'ri', 2, [
        { path: 'M30,20 L30,80', order: 1 },
        { path: 'M55,25 Q60,45 55,65 Q50,80 40,90', order: 2 }
    ]),
    new Character('る', 'hiragana', 'ru', 2, [
        { path: 'M25,30 Q50,25 75,30', order: 1 },
        { path: 'M50,30 Q55,50 50,70 Q40,85 25,90', order: 2 }
    ]),
    new Character('れ', 'hiragana', 're', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M30,30 Q35,50 40,65 Q50,80 70,85', order: 2 }
    ]),
    new Character('ろ', 'hiragana', 'ro', 2, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M20,55 Q50,50 80,55', order: 2 }
    ]),

    // わ行
    new Character('わ', 'hiragana', 'wa', 2, [
        { path: 'M20,25 Q50,20 80,25', order: 1 },
        { path: 'M25,25 Q30,50 35,65 Q45,80 65,85', order: 2 }
    ]),
    new Character('を', 'hiragana', 'wo', 3, [
        { path: 'M20,30 Q50,25 80,30', order: 1 },
        { path: 'M50,30 Q52,55 50,80', order: 2 },
        { path: 'M50,55 Q65,65 80,75', order: 3 }
    ]),
    new Character('ん', 'hiragana', 'n', 2, [
        { path: 'M20,30 Q40,50 60,70 Q70,80 85,90', order: 1 }
    ])
];

// カタカナデータ（5-6歳向け）
const katakanaData = [
    // ア行
    new Character('ア', 'katakana', 'a', 2),
    new Character('イ', 'katakana', 'i', 2),
    new Character('ウ', 'katakana', 'u', 2),
    new Character('エ', 'katakana', 'e', 2),
    new Character('オ', 'katakana', 'o', 2),
    
    // カ行
    new Character('カ', 'katakana', 'ka', 2),
    new Character('キ', 'katakana', 'ki', 2),
    new Character('ク', 'katakana', 'ku', 2),
    new Character('ケ', 'katakana', 'ke', 2),
    new Character('コ', 'katakana', 'ko', 2),
    
    // サ行
    new Character('サ', 'katakana', 'sa', 2),
    new Character('シ', 'katakana', 'shi', 2),
    new Character('ス', 'katakana', 'su', 2),
    new Character('セ', 'katakana', 'se', 2),
    new Character('ソ', 'katakana', 'so', 2),
    
    // タ行
    new Character('タ', 'katakana', 'ta', 2),
    new Character('チ', 'katakana', 'chi', 2),
    new Character('ツ', 'katakana', 'tsu', 2),
    new Character('テ', 'katakana', 'te', 2),
    new Character('ト', 'katakana', 'to', 2),
    
    // ナ行
    new Character('ナ', 'katakana', 'na', 2),
    new Character('ニ', 'katakana', 'ni', 2),
    new Character('ヌ', 'katakana', 'nu', 2),
    new Character('ネ', 'katakana', 'ne', 2),
    new Character('ノ', 'katakana', 'no', 2),
    
    // ハ行
    new Character('ハ', 'katakana', 'ha', 2),
    new Character('ヒ', 'katakana', 'hi', 2),
    new Character('フ', 'katakana', 'fu', 2),
    new Character('ヘ', 'katakana', 'he', 2),
    new Character('ホ', 'katakana', 'ho', 2),
    
    // マ行
    new Character('マ', 'katakana', 'ma', 2),
    new Character('ミ', 'katakana', 'mi', 2),
    new Character('ム', 'katakana', 'mu', 2),
    new Character('メ', 'katakana', 'me', 2),
    new Character('モ', 'katakana', 'mo', 2),
    
    // ヤ行
    new Character('ヤ', 'katakana', 'ya', 2),
    new Character('ユ', 'katakana', 'yu', 2),
    new Character('ヨ', 'katakana', 'yo', 2),
    
    // ラ行
    new Character('ラ', 'katakana', 'ra', 2),
    new Character('リ', 'katakana', 'ri', 2),
    new Character('ル', 'katakana', 'ru', 2),
    new Character('レ', 'katakana', 're', 2),
    new Character('ロ', 'katakana', 'ro', 2),
    
    // ワ行
    new Character('ワ', 'katakana', 'wa', 2),
    new Character('ヲ', 'katakana', 'wo', 3),
    new Character('ン', 'katakana', 'n', 2)
];

// 年齢別文字セット取得関数
function getCharacterSetForAge(ageGroup, characterType = 'hiragana') {
    if (ageGroup === '3-4') {
        return basicHiraganaData;
    } else if (ageGroup === '5-6') {
        if (characterType === 'hiragana') {
            return fullHiraganaData;
        } else if (characterType === 'katakana') {
            return katakanaData;
        } else if (characterType === 'mixed') {
            return [...fullHiraganaData, ...katakanaData];
        }
    }
    return basicHiraganaData;
}

// 難易度別文字取得関数
function getCharactersByDifficulty(characters, difficulty) {
    return characters.filter(char => char.difficulty === difficulty);
}

// ランダム文字選択関数
function getRandomCharacters(characters, count) {
    const shuffled = [...characters].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 文字検索関数
function findCharacterById(characters, id) {
    return characters.find(char => char.id === id);
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = {
        Character,
        basicHiraganaData,
        fullHiraganaData,
        katakanaData,
        getCharacterSetForAge,
        getCharactersByDifficulty,
        getRandomCharacters,
        findCharacterById
    };
} else if (typeof window !== 'undefined') {
    // ブラウザ環境 - グローバルスコープに直接エクスポート（iOS Safari互換性のため）
    window.Character = Character;
    window.basicHiraganaData = basicHiraganaData;
    window.fullHiraganaData = fullHiraganaData;
    window.katakanaData = katakanaData;
    window.getCharacterSetForAge = getCharacterSetForAge;
    window.getCharactersByDifficulty = getCharactersByDifficulty;
    window.getRandomCharacters = getRandomCharacters;
    window.findCharacterById = findCharacterById;
    
    // 後方互換性のためにCharacterDataオブジェクトも保持
    window.CharacterData = {
        Character,
        basicHiraganaData,
        fullHiraganaData,
        katakanaData,
        getCharacterSetForAge,
        getCharactersByDifficulty,
        getRandomCharacters,
        findCharacterById
    };
}