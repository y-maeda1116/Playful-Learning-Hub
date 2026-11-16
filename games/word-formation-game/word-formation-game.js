/**
 * 単語形成ゲーム
 * Word Formation Game for Hiragana and Katakana
 */

class WordFormationGame {
    constructor(container, options = {}) {
        this.container = container;
        this.ageGroup = options.ageGroup || '5-6';
        this.mode = options.mode || 'hiragana'; // 'hiragana', 'katakana', 'mixed'
        
        // ゲーム状態
        this.currentWord = null;
        this.availableCharacters = [];
        this.selectedCharacters = [];
        this.score = 0;
        this.totalQuestions = 0;
        this.isGameActive = false;
        this.currentLevel = 1;
        
        // 難易度設定
        this.difficultySettings = this.getDifficultySettings();
        this.wordDatabase = this.initializeWordDatabase();
        
        // 音声管理システム
        this.audioManager = options.audioManager || null;
        
        // 進捗追跡システム
        this.progressTracker = options.progressTracker || null;
        
        // UI要素
        this.gameContainer = null;
        this.wordDisplay = null;
        this.charactersContainer = null;
        this.selectedContainer = null;
        this.feedbackContainer = null;
        this.scoreDisplay = null;
        
        this.initializeGame();
    }
    
    /**
     * 難易度設定を取得
     */
    getDifficultySettings() {
        return {
            1: { // レベル1：2文字の単語
                wordLength: 2,
                characterPool: 8,
                hintLevel: 'high', // 画像ヒント付き
                examples: ['あか', 'いぬ', 'うみ', 'えき', 'おか']
            },
            2: { // レベル2：3文字の単語
                wordLength: 3,
                characterPool: 10,
                hintLevel: 'medium', // 部分的ヒント
                examples: ['あかい', 'いぬが', 'うみで', 'えきに', 'おかし']
            },
            3: { // レベル3：4文字以上の単語
                wordLength: 4,
                characterPool: 12,
                hintLevel: 'low', // 最小限のヒント
                examples: ['あかいろ', 'いぬがいる', 'うみでおよぐ']
            }
        };
    }
    
    /**
     * 単語データベースを初期化
     */
    initializeWordDatabase() {
        return {
            level1: [
                { word: 'あか', meaning: '赤', category: 'color', hint: '🔴' },
                { word: 'あお', meaning: '青', category: 'color', hint: '🔵' },
                { word: 'いぬ', meaning: '犬', category: 'animal', hint: '🐕' },
                { word: 'ねこ', meaning: '猫', category: 'animal', hint: '🐱' },
                { word: 'うみ', meaning: '海', category: 'nature', hint: '🌊' },
                { word: 'やま', meaning: '山', category: 'nature', hint: '⛰️' },
                { word: 'はな', meaning: '花', category: 'nature', hint: '🌸' },
                { word: 'つき', meaning: '月', category: 'nature', hint: '🌙' },
                { word: 'ほし', meaning: '星', category: 'nature', hint: '⭐' },
                { word: 'かさ', meaning: '傘', category: 'object', hint: '☂️' }
            ],
            level2: [
                { word: 'あかい', meaning: '赤い', category: 'adjective', hint: '🔴✨' },
                { word: 'おおきい', meaning: '大きい', category: 'adjective', hint: '📏⬆️' },
                { word: 'ちいさい', meaning: '小さい', category: 'adjective', hint: '📏⬇️' },
                { word: 'たのしい', meaning: '楽しい', category: 'emotion', hint: '😊' },
                { word: 'うれしい', meaning: '嬉しい', category: 'emotion', hint: '😄' },
                { word: 'さくら', meaning: '桜', category: 'nature', hint: '🌸🌸' },
                { word: 'りんご', meaning: 'りんご', category: 'food', hint: '🍎' },
                { word: 'みかん', meaning: 'みかん', category: 'food', hint: '🍊' },
                { word: 'おかし', meaning: 'お菓子', category: 'food', hint: '🍭' }
            ],
            level3: [
                { word: 'あかいろ', meaning: '赤色', category: 'color', hint: '🔴🎨' },
                { word: 'おはよう', meaning: 'おはよう', category: 'greeting', hint: '🌅👋' },
                { word: 'ありがとう', meaning: 'ありがとう', category: 'greeting', hint: '🙏😊' },
                { word: 'がっこう', meaning: '学校', category: 'place', hint: '🏫📚' },
                { word: 'ともだち', meaning: '友達', category: 'people', hint: '👫👬' },
                { word: 'かぞく', meaning: '家族', category: 'people', hint: '👨‍👩‍👧‍👦' }
            ]
        };
    }
    
    /**
     * ゲーム初期化
     */
    initializeGame() {
        this.createGameUI();
        this.bindEvents();
        this.isGameActive = true;
    }
    
    /**
     * ゲームUIの作成
     */
    createGameUI() {
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'word-formation-game';
        this.gameContainer.innerHTML = `
            <div class="game-header">
                <div class="score-display">スコア: <span class="score-value">0</span></div>
                <div class="level-display">レベル: <span class="level-value">1</span></div>
                <div class="mode-display">${this.getModeDisplayName()}</div>
            </div>
            
            <div class="game-instructions">
                <div class="instruction-text">文字を組み合わせて単語を作りましょう！</div>
                <div class="level-description"></div>
            </div>
            
            <div class="word-challenge-section">
                <div class="target-word-hint">
                    <div class="hint-icon"></div>
                    <div class="hint-text"></div>
                </div>
                <div class="word-slots-container">
                    <!-- 単語のスロットがここに動的に生成される -->
                </div>
            </div>
            
            <div class="selected-characters-section">
                <div class="section-title">選択した文字</div>
                <div class="selected-characters-container">
                    <!-- 選択された文字がここに表示される -->
                </div>
                <div class="selected-actions">
                    <button class="clear-selection-btn">クリア</button>
                    <button class="check-word-btn" disabled>単語をチェック</button>
                </div>
            </div>
            
            <div class="available-characters-section">
                <div class="section-title">使える文字</div>
                <div class="available-characters-container">
                    <!-- 利用可能な文字がここに表示される -->
                </div>
            </div>
            
            <div class="feedback-container" style="display: none;">
                <div class="feedback-content">
                    <div class="feedback-icon"></div>
                    <div class="feedback-message"></div>
                    <div class="word-explanation"></div>
                </div>
                <div class="feedback-actions">
                    <button class="next-word-btn">次の単語</button>
                    <button class="level-up-btn" style="display: none;">レベルアップ！</button>
                </div>
            </div>
            
            <div class="game-controls">
                <button class="start-game-btn">ゲーム開始</button>
                <button class="restart-game-btn" style="display: none;">もう一度</button>
                <button class="hint-btn" style="display: none;">ヒント</button>
            </div>
            
            <div class="progress-section">
                <div class="progress-title">今のレベルの進捗</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0 / 5 単語完成</div>
            </div>
        `;
        
        this.container.appendChild(this.gameContainer);
        
        // UI要素の参照を保存
        this.wordDisplay = this.gameContainer.querySelector('.word-slots-container');
        this.charactersContainer = this.gameContainer.querySelector('.available-characters-container');
        this.selectedContainer = this.gameContainer.querySelector('.selected-characters-container');
        this.feedbackContainer = this.gameContainer.querySelector('.feedback-container');
        this.scoreDisplay = this.gameContainer.querySelector('.score-value');
        this.levelDisplay = this.gameContainer.querySelector('.level-value');
        this.progressBar = this.gameContainer.querySelector('.progress-fill');
        this.progressText = this.gameContainer.querySelector('.progress-text');
    }
    
    /**
     * モード表示名を取得
     */
    getModeDisplayName() {
        const modeNames = {
            'hiragana': 'ひらがな単語',
            'katakana': 'カタカナ単語',
            'mixed': 'ひらがな・カタカナ単語'
        };
        return modeNames[this.mode] || 'ひらがな単語';
    }
    
    /**
     * イベントバインディング
     */
    bindEvents() {
        const startBtn = this.gameContainer.querySelector('.start-game-btn');
        const restartBtn = this.gameContainer.querySelector('.restart-game-btn');
        const nextWordBtn = this.gameContainer.querySelector('.next-word-btn');
        const levelUpBtn = this.gameContainer.querySelector('.level-up-btn');
        const clearBtn = this.gameContainer.querySelector('.clear-selection-btn');
        const checkBtn = this.gameContainer.querySelector('.check-word-btn');
        const hintBtn = this.gameContainer.querySelector('.hint-btn');
        
        startBtn.addEventListener('click', () => this.startNewGame());
        restartBtn.addEventListener('click', () => this.restartGame());
        nextWordBtn.addEventListener('click', () => this.startNewWord());
        levelUpBtn.addEventListener('click', () => this.levelUp());
        clearBtn.addEventListener('click', () => this.clearSelection());
        checkBtn.addEventListener('click', () => this.checkWord());
        hintBtn.addEventListener('click', () => this.showHint());
    }
    
    /**
     * 新しいゲームを開始
     */
    startNewGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.totalQuestions = 0;
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateProgressDisplay();
        
        this.hideGameControls();
        this.startNewWord();
        
        // 進捗追跡開始
        if (this.progressTracker) {
            this.progressTracker.startSession('word_formation', {
                mode: this.mode,
                ageGroup: this.ageGroup,
                startLevel: this.currentLevel
            });
        }
    }
    
    /**
     * 新しい単語を開始
     */
    startNewWord() {
        this.hideFeedback();
        this.clearSelection();
        
        // 現在のレベルから単語を選択
        this.currentWord = this.selectRandomWord(this.currentLevel);
        if (!this.currentWord) {
            console.error('No words available for current level');
            return;
        }
        
        // 利用可能な文字を生成
        this.generateAvailableCharacters();
        
        // UIを更新
        this.displayWordChallenge();
        this.displayAvailableCharacters();
        this.updateInstructions();
        
        // ヒントボタンを表示
        const hintBtn = this.gameContainer.querySelector('.hint-btn');
        hintBtn.style.display = 'inline-block';
        
        this.totalQuestions++;
        
        // 音声でヒントを再生
        if (this.audioManager) {
            setTimeout(() => {
                this.playWordHintAudio();
            }, 1000);
        }
    }
    
    /**
     * レベルに応じた単語を選択
     */
    selectRandomWord(level) {
        const levelKey = `level${level}`;
        const wordsForLevel = this.wordDatabase[levelKey];
        
        if (!wordsForLevel || wordsForLevel.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * wordsForLevel.length);
        return wordsForLevel[randomIndex];
    }
    
    /**
     * 利用可能な文字を生成
     */
    generateAvailableCharacters() {
        const targetChars = this.currentWord.word.split('');
        const settings = this.difficultySettings[this.currentLevel];
        
        // 正解の文字を含める
        this.availableCharacters = [...targetChars];
        
        // ダミー文字を追加
        const dummyCount = settings.characterPool - targetChars.length;
        const dummyChars = this.generateDummyCharacters(targetChars, dummyCount);
        
        this.availableCharacters = [...this.availableCharacters, ...dummyChars];
        
        // シャッフル
        this.availableCharacters = this.availableCharacters.sort(() => Math.random() - 0.5);
    }
    
    /**
     * ダミー文字を生成
     */
    generateDummyCharacters(targetChars, count) {
        let dummyChars = [];
        
        // 文字データから候補を取得
        let characterPool = [];
        if (typeof window !== 'undefined' && window.CharacterData) {
            const allChars = window.CharacterData.getCharacterSetForAge('5-6', this.mode);
            characterPool = allChars.map(char => char.id);
        } else {
            // フォールバック用の基本文字セット
            characterPool = [
                'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ',
                'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と',
                'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ',
                'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り',
                'る', 'れ', 'ろ', 'わ', 'を', 'ん'
            ];
        }
        
        // 正解文字を除外
        const availablePool = characterPool.filter(char => !targetChars.includes(char));
        
        // ランダムに選択
        while (dummyChars.length < count && availablePool.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePool.length);
            const selectedChar = availablePool.splice(randomIndex, 1)[0];
            dummyChars.push(selectedChar);
        }
        
        return dummyChars;
    }
    
    /**
     * 単語チャレンジを表示
     */
    displayWordChallenge() {
        // ヒント表示
        const hintIcon = this.gameContainer.querySelector('.hint-icon');
        const hintText = this.gameContainer.querySelector('.hint-text');
        
        hintIcon.textContent = this.currentWord.hint;
        hintText.textContent = `「${this.currentWord.meaning}」を作ってください`;
        
        // 単語スロットを作成
        this.wordDisplay.innerHTML = '';
        const wordLength = this.currentWord.word.length;
        
        for (let i = 0; i < wordLength; i++) {
            const slot = document.createElement('div');
            slot.className = 'word-slot';
            slot.dataset.position = i;
            
            // レベル1では最初の文字をヒントとして表示
            if (this.currentLevel === 1 && i === 0) {
                slot.textContent = this.currentWord.word[i];
                slot.classList.add('hint-character');
            }
            
            this.wordDisplay.appendChild(slot);
        }
    }
    
    /**
     * 利用可能な文字を表示
     */
    displayAvailableCharacters() {
        this.charactersContainer.innerHTML = '';
        
        this.availableCharacters.forEach((char, index) => {
            const charButton = document.createElement('button');
            charButton.className = 'character-button';
            charButton.textContent = char;
            charButton.dataset.character = char;
            charButton.dataset.index = index;
            
            charButton.addEventListener('click', () => {
                this.selectCharacter(char, charButton);
            });
            
            this.charactersContainer.appendChild(charButton);
        });
    }
    
    /**
     * 文字を選択
     */
    selectCharacter(character, buttonElement) {
        // 既に選択済みの場合は無視
        if (buttonElement.disabled) return;
        
        // 選択可能な最大数をチェック
        if (this.selectedCharacters.length >= this.currentWord.word.length) {
            this.showTemporaryMessage('これ以上選択できません');
            return;
        }
        
        // 文字を選択リストに追加
        this.selectedCharacters.push({
            character: character,
            buttonElement: buttonElement
        });
        
        // ボタンを無効化
        buttonElement.disabled = true;
        buttonElement.classList.add('selected');
        
        // 選択された文字を表示
        this.updateSelectedCharactersDisplay();
        
        // チェックボタンの状態を更新
        this.updateCheckButtonState();
        
        // 音声フィードバック
        if (this.audioManager) {
            this.audioManager.playFeedbackSound('select');
        }
    }
    
    /**
     * 選択された文字の表示を更新
     */
    updateSelectedCharactersDisplay() {
        this.selectedContainer.innerHTML = '';
        
        this.selectedCharacters.forEach((item, index) => {
            const charElement = document.createElement('div');
            charElement.className = 'selected-character';
            charElement.innerHTML = `
                <span class="character">${item.character}</span>
                <button class="remove-character" data-index="${index}">×</button>
            `;
            
            // 削除ボタンのイベント
            const removeBtn = charElement.querySelector('.remove-character');
            removeBtn.addEventListener('click', () => {
                this.removeSelectedCharacter(index);
            });
            
            this.selectedContainer.appendChild(charElement);
        });
    }
    
    /**
     * 選択された文字を削除
     */
    removeSelectedCharacter(index) {
        const removedItem = this.selectedCharacters.splice(index, 1)[0];
        
        // ボタンを再有効化
        removedItem.buttonElement.disabled = false;
        removedItem.buttonElement.classList.remove('selected');
        
        // 表示を更新
        this.updateSelectedCharactersDisplay();
        this.updateCheckButtonState();
        
        // 音声フィードバック
        if (this.audioManager) {
            this.audioManager.playFeedbackSound('deselect');
        }
    }
    
    /**
     * 選択をクリア
     */
    clearSelection() {
        // 全ての選択をクリア
        this.selectedCharacters.forEach(item => {
            item.buttonElement.disabled = false;
            item.buttonElement.classList.remove('selected');
        });
        
        this.selectedCharacters = [];
        this.updateSelectedCharactersDisplay();
        this.updateCheckButtonState();
    }
    
    /**
     * チェックボタンの状態を更新
     */
    updateCheckButtonState() {
        const checkBtn = this.gameContainer.querySelector('.check-word-btn');
        const hasEnoughCharacters = this.selectedCharacters.length === this.currentWord.word.length;
        
        checkBtn.disabled = !hasEnoughCharacters;
        
        if (hasEnoughCharacters) {
            checkBtn.classList.add('ready');
        } else {
            checkBtn.classList.remove('ready');
        }
    }
    
    /**
     * 単語をチェック
     */
    checkWord() {
        const selectedWord = this.selectedCharacters.map(item => item.character).join('');
        const isCorrect = selectedWord === this.currentWord.word;
        
        // 音声フィードバック
        if (this.audioManager) {
            this.audioManager.playFeedbackSound(isCorrect ? 'correct' : 'incorrect');
        }
        
        // 視覚的フィードバック
        this.showWordResult(isCorrect, selectedWord);
        
        // スコア更新
        if (isCorrect) {
            this.score += this.currentLevel * 10; // レベルに応じたスコア
            this.updateScoreDisplay();
        }
        
        // 進捗記録
        if (this.progressTracker) {
            this.progressTracker.recordAttempt(this.currentWord.word, isCorrect, {
                selectedWord: selectedWord,
                level: this.currentLevel,
                category: this.currentWord.category
            });
        }
        
        // フィードバック表示
        setTimeout(() => {
            this.showFeedback(isCorrect, selectedWord);
        }, 1000);
    }
    
    /**
     * 単語結果を表示（アニメーション付き）
     */
    showWordResult(isCorrect, selectedWord) {
        const slots = this.wordDisplay.querySelectorAll('.word-slot');
        
        // 選択された文字をスロットに表示
        this.selectedCharacters.forEach((item, index) => {
            if (slots[index]) {
                slots[index].textContent = item.character;
                slots[index].classList.add('filled');
                
                // 正解/不正解のスタイル
                if (isCorrect) {
                    slots[index].classList.add('correct');
                } else {
                    const correctChar = this.currentWord.word[index];
                    if (item.character === correctChar) {
                        slots[index].classList.add('correct');
                    } else {
                        slots[index].classList.add('incorrect');
                    }
                }
            }
        });
        
        // アニメーション効果
        if (isCorrect) {
            this.playSuccessAnimation();
        } else {
            this.playErrorAnimation();
        }
    }
    
    /**
     * 成功アニメーション
     */
    playSuccessAnimation() {
        const slots = this.wordDisplay.querySelectorAll('.word-slot');
        slots.forEach((slot, index) => {
            setTimeout(() => {
                slot.classList.add('success-bounce');
            }, index * 100);
        });
        
        // 紙吹雪効果
        this.createCelebrationEffect();
    }
    
    /**
     * エラーアニメーション
     */
    playErrorAnimation() {
        const wordDisplay = this.wordDisplay;
        wordDisplay.classList.add('shake-animation');
        
        setTimeout(() => {
            wordDisplay.classList.remove('shake-animation');
        }, 600);
    }
    
    /**
     * お祝い効果を作成
     */
    createCelebrationEffect() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'];
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: 20%;
                animation: celebration-float 2s ease-out forwards;
                z-index: 1000;
            `;
            
            this.gameContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    }
    
    /**
     * フィードバックを表示
     */
    showFeedback(isCorrect, selectedWord) {
        const feedbackIcon = this.feedbackContainer.querySelector('.feedback-icon');
        const feedbackMessage = this.feedbackContainer.querySelector('.feedback-message');
        const wordExplanation = this.feedbackContainer.querySelector('.word-explanation');
        const nextWordBtn = this.feedbackContainer.querySelector('.next-word-btn');
        const levelUpBtn = this.feedbackContainer.querySelector('.level-up-btn');
        
        if (isCorrect) {
            feedbackIcon.textContent = '🎉';
            feedbackMessage.innerHTML = `
                <div class="success-message">正解です！</div>
                <div class="formed-word">「${this.currentWord.word}」ができました</div>
            `;
            wordExplanation.innerHTML = `
                <div class="word-meaning">
                    <span class="meaning-label">意味：</span>
                    <span class="meaning-text">${this.currentWord.meaning}</span>
                </div>
                <div class="word-category">
                    <span class="category-label">カテゴリ：</span>
                    <span class="category-text">${this.getCategoryName(this.currentWord.category)}</span>
                </div>
            `;
            
            this.feedbackContainer.className = 'feedback-container success';
            
            // レベルアップ判定
            if (this.shouldLevelUp()) {
                levelUpBtn.style.display = 'inline-block';
                nextWordBtn.style.display = 'none';
            } else {
                levelUpBtn.style.display = 'none';
                nextWordBtn.style.display = 'inline-block';
            }
            
        } else {
            feedbackIcon.textContent = '💪';
            feedbackMessage.innerHTML = `
                <div class="error-message">もう一度挑戦しましょう！</div>
                <div class="attempted-word">「${selectedWord}」→「${this.currentWord.word}」</div>
            `;
            wordExplanation.innerHTML = `
                <div class="correct-word">
                    正解は「${this.currentWord.word}」（${this.currentWord.meaning}）でした
                </div>
                <div class="encouragement">
                    文字の順番を確認して、もう一度やってみましょう！
                </div>
            `;
            
            this.feedbackContainer.className = 'feedback-container error';
            levelUpBtn.style.display = 'none';
            nextWordBtn.style.display = 'inline-block';
        }
        
        this.feedbackContainer.style.display = 'block';
        this.updateProgressDisplay();
        
        // 音声説明を再生
        if (this.audioManager && isCorrect) {
            setTimeout(() => {
                this.playWordExplanationAudio();
            }, 1000);
        }
    }
    
    /**
     * カテゴリ名を取得
     */
    getCategoryName(category) {
        const categoryNames = {
            'color': '色',
            'animal': '動物',
            'nature': '自然',
            'object': '物',
            'adjective': '形容詞',
            'emotion': '感情',
            'food': '食べ物',
            'greeting': '挨拶',
            'place': '場所',
            'people': '人'
        };
        return categoryNames[category] || category;
    }
    
    /**
     * レベルアップ判定
     */
    shouldLevelUp() {
        // 現在のレベルで5問正解したらレベルアップ
        const correctAnswersInLevel = this.getCorrectAnswersInCurrentLevel();
        return correctAnswersInLevel >= 5 && this.currentLevel < 3;
    }
    
    /**
     * 現在のレベルでの正解数を取得
     */
    getCorrectAnswersInCurrentLevel() {
        // 簡単な実装：スコアベースで判定
        const expectedScorePerLevel = this.currentLevel * 10 * 5; // レベル × 10点 × 5問
        const currentLevelScore = this.score % expectedScorePerLevel;
        return Math.floor(currentLevelScore / (this.currentLevel * 10));
    }
    
    /**
     * レベルアップ
     */
    levelUp() {
        this.currentLevel++;
        this.updateLevelDisplay();
        this.hideFeedback();
        
        // レベルアップ演出
        this.showLevelUpCelebration();
        
        // 新しい単語を開始
        setTimeout(() => {
            this.startNewWord();
        }, 2000);
    }
    
    /**
     * レベルアップお祝い演出
     */
    showLevelUpCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'level-up-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎊</div>
                <div class="celebration-text">
                    <div class="level-up-title">レベルアップ！</div>
                    <div class="new-level">レベル ${this.currentLevel}</div>
                    <div class="level-description">${this.getLevelDescription()}</div>
                </div>
            </div>
        `;
        
        this.gameContainer.appendChild(celebration);
        
        // 音声でお祝い
        if (this.audioManager) {
            this.audioManager.playFeedbackSound('levelup');
        }
        
        // 2秒後に削除
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 2000);
    }
    
    /**
     * レベル説明を取得
     */
    getLevelDescription() {
        const descriptions = {
            1: '2文字の簡単な単語',
            2: '3文字の単語に挑戦！',
            3: '4文字以上の難しい単語'
        };
        return descriptions[this.currentLevel] || '';
    }
    
    /**
     * ヒントを表示
     */
    showHint() {
        const settings = this.difficultySettings[this.currentLevel];
        
        if (settings.hintLevel === 'high') {
            // レベル1：最初の文字を表示（既に表示済み）
            this.showTemporaryMessage('最初の文字がヒントです！');
        } else if (settings.hintLevel === 'medium') {
            // レベル2：文字数のヒント
            this.showTemporaryMessage(`この単語は${this.currentWord.word.length}文字です`);
        } else {
            // レベル3：カテゴリのヒント
            const categoryName = this.getCategoryName(this.currentWord.category);
            this.showTemporaryMessage(`ヒント：${categoryName}に関する言葉です`);
        }
        
        // 音声ヒント
        if (this.audioManager) {
            this.playWordHintAudio();
        }
    }
    
    /**
     * 一時的なメッセージを表示
     */
    showTemporaryMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'temporary-message';
        messageElement.textContent = message;
        
        this.gameContainer.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 2000);
    }
    
    /**
     * 指示を更新
     */
    updateInstructions() {
        const levelDescription = this.gameContainer.querySelector('.level-description');
        const settings = this.difficultySettings[this.currentLevel];
        
        levelDescription.textContent = `レベル${this.currentLevel}: ${this.getLevelDescription()}`;
    }
    
    /**
     * フィードバックを非表示
     */
    hideFeedback() {
        this.feedbackContainer.style.display = 'none';
        
        // スロットのスタイルをリセット
        const slots = this.wordDisplay.querySelectorAll('.word-slot');
        slots.forEach(slot => {
            slot.classList.remove('filled', 'correct', 'incorrect', 'success-bounce');
        });
    }
    
    /**
     * ゲームコントロールを非表示
     */
    hideGameControls() {
        const startBtn = this.gameContainer.querySelector('.start-game-btn');
        const restartBtn = this.gameContainer.querySelector('.restart-game-btn');
        
        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
    }
    
    /**
     * スコア表示を更新
     */
    updateScoreDisplay() {
        this.scoreDisplay.textContent = this.score;
    }
    
    /**
     * レベル表示を更新
     */
    updateLevelDisplay() {
        this.levelDisplay.textContent = this.currentLevel;
    }
    
    /**
     * 進捗表示を更新
     */
    updateProgressDisplay() {
        const correctAnswers = this.getCorrectAnswersInCurrentLevel();
        const totalNeeded = 5;
        const progressPercent = (correctAnswers / totalNeeded) * 100;
        
        this.progressBar.style.width = `${progressPercent}%`;
        this.progressText.textContent = `${correctAnswers} / ${totalNeeded} 単語完成`;
    }
    
    /**
     * ゲームを再開
     */
    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.totalQuestions = 0;
        this.selectedCharacters = [];
        
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateProgressDisplay();
        this.hideFeedback();
        
        const startBtn = this.gameContainer.querySelector('.start-game-btn');
        const restartBtn = this.gameContainer.querySelector('.restart-game-btn');
        const hintBtn = this.gameContainer.querySelector('.hint-btn');
        
        startBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
        hintBtn.style.display = 'none';
        
        // 表示をクリア
        this.wordDisplay.innerHTML = '';
        this.charactersContainer.innerHTML = '';
        this.selectedContainer.innerHTML = '';
    }
    
    /**
     * 単語ヒント音声を再生
     */
    playWordHintAudio() {
        if (!this.audioManager) return;
        
        // 単語の意味を音声で説明
        const message = `${this.currentWord.meaning}を作ってください`;
        this.audioManager.playTextToSpeech(message);
    }
    
    /**
     * 単語説明音声を再生
     */
    playWordExplanationAudio() {
        if (!this.audioManager) return;
        
        const message = `${this.currentWord.word}、${this.currentWord.meaning}です`;
        this.audioManager.playTextToSpeech(message);
    }
    
    /**
     * 進捗情報を取得
     */
    getProgress() {
        return {
            score: this.score,
            level: this.currentLevel,
            totalQuestions: this.totalQuestions,
            correctAnswers: this.getCorrectAnswersInCurrentLevel(),
            mode: this.mode,
            ageGroup: this.ageGroup
        };
    }
    
    /**
     * ゲームを破棄
     */
    destroy() {
        this.isGameActive = false;
        
        if (this.gameContainer && this.gameContainer.parentNode) {
            this.gameContainer.parentNode.removeChild(this.gameContainer);
        }
        
        // 一時的な要素を削除
        const temporaryElements = document.querySelectorAll(
            '.temporary-message, .level-up-celebration, .celebration-particle'
        );
        temporaryElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { WordFormationGame };
} else if (typeof window !== 'undefined') {
    // ブラウザ環境
    window.WordFormationGame = WordFormationGame;
    console.log('✅ WordFormationGame クラスをエクスポートしました');
}