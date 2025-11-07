/**
 * ひらがな・カタカナ学習ゲーム
 * Hiragana and Katakana Learning Game
 */

class HiraganaLearningGame {
    constructor(ageGroup, container, options = {}) {
        this.ageGroup = ageGroup; // '3-4' or '5-6'
        this.container = container;
        this.mode = options.mode || 'hiragana'; // 'hiragana', 'katakana', 'mixed'
        
        // ゲーム状態
        this.currentCharacter = null;
        this.choices = [];
        this.score = 0;
        this.totalQuestions = 0;
        this.isGameActive = false;
        this.isFocusedPractice = options.focusedPractice || false;
        this.focusedCharacters = options.focusedCharacters || [];
        
        // 進捗追跡システム
        this.progressTracker = options.progressTracker || null;
        
        // モチベーション維持システム
        this.badgeSystem = null;
        this.gamificationSystem = null;
        this.initializeMotivationSystems(options);
        
        // 年齢別難易度設定
        this.difficultySettings = this.getDifficultySettings();
        this.characters = this.getCharacterSet();
        
        // 音声管理システムの初期化
        this.audioManager = null;
        this.initializeAudioManager(options.audio);
        
        // UI要素
        this.gameContainer = null;
        this.questionDisplay = null;
        this.choicesContainer = null;
        this.feedbackContainer = null;
        this.scoreDisplay = null;
        
        // 書き練習機能
        this.writingPractice = null;
        this.currentMode = 'recognition'; // 'recognition' | 'writing'
        
        this.initializeGame();
    }
    
    /**
     * 年齢別難易度設定を取得
     */
    getDifficultySettings() {
        const settings = {
            '3-4': {
                choiceCount: 3,
                characterTypes: ['hiragana'],
                characterRange: 'basic', // あ行〜な行
                maxDifficulty: 1,
                feedbackDelay: 2000, // より長いフィードバック時間
                encouragementLevel: 'high' // より多くの励まし
            },
            '5-6': {
                choiceCount: 4,
                characterTypes: ['hiragana', 'katakana'],
                characterRange: 'full', // 全文字
                maxDifficulty: 3,
                feedbackDelay: 1500,
                encouragementLevel: 'medium'
            }
        };
        
        return settings[this.ageGroup] || settings['3-4'];
    }
    
    /**
     * 年齢グループに応じた文字セットを取得
     */
    getCharacterSet() {
        let characters = [];
        
        try {
            // グローバル関数を直接使用（より互換性が高い）
            if (typeof getCharacterSetForAge === 'function') {
                characters = getCharacterSetForAge(this.ageGroup, this.mode);
            } else if (typeof window !== 'undefined' && window.CharacterData) {
                characters = window.CharacterData.getCharacterSetForAge(this.ageGroup, this.mode);
            } else if (typeof require !== 'undefined') {
                const CharacterData = require('./character-data.js');
                characters = CharacterData.getCharacterSetForAge(this.ageGroup, this.mode);
            } else {
                console.error('Character data functions not available');
                return [];
            }
            
            // 重点練習モードの場合は指定された文字のみを使用
            if (this.isFocusedPractice && this.focusedCharacters.length > 0) {
                characters = characters.filter(char => 
                    this.focusedCharacters.some(focusChar => focusChar.character === char.id)
                );
            }
            
            // 年齢別難易度フィルタリング
            return this.filterCharactersByDifficulty(characters);
        } catch (error) {
            console.error('Error getting character set:', error);
            return [];
        }
    }
    
    /**
     * 難易度に応じて文字をフィルタリング
     */
    filterCharactersByDifficulty(characters) {
        const settings = this.difficultySettings;
        
        // 3-4歳向け：基本ひらがなのみ（あ行〜な行）
        if (this.ageGroup === '3-4') {
            return characters.filter(char => 
                char.type === 'hiragana' && 
                char.difficulty <= settings.maxDifficulty
            );
        }
        
        // 5-6歳向け：選択されたモードに応じて全文字
        if (this.ageGroup === '5-6') {
            if (this.mode === 'hiragana') {
                return characters.filter(char => char.type === 'hiragana');
            } else if (this.mode === 'katakana') {
                return characters.filter(char => char.type === 'katakana');
            } else if (this.mode === 'mixed') {
                return characters; // 全文字
            }
        }
        
        return characters;
    }
    
    /**
     * 音声管理システムの初期化
     */
    initializeAudioManager(audioOptions = {}) {
        try {
            // AudioManagerクラスが利用可能かチェック
            const AudioManagerClass = (typeof window !== 'undefined' && window.AudioManager) || 
                                    (typeof require !== 'undefined' && require('./audio-manager.js').AudioManager);
            
            if (AudioManagerClass) {
                this.audioManager = new AudioManagerClass({
                    enabled: audioOptions.enabled !== false,
                    volume: audioOptions.volume || 0.7,
                    baseUrl: audioOptions.baseUrl || 'sounds/'
                });
                
                // 文字音声の事前読み込み
                this.preloadAudio();
            } else {
                console.warn('AudioManager not available, audio features will be disabled');
                this.audioManager = null;
            }
        } catch (error) {
            console.warn('Failed to initialize AudioManager:', error);
            this.audioManager = null;
        }
    }
    
    /**
     * モチベーション維持システムの初期化
     */
    initializeMotivationSystems(options = {}) {
        try {
            // BadgeSystemクラスが利用可能かチェック
            const BadgeSystemClass = (typeof window !== 'undefined' && window.BadgeSystem) || 
                                    (typeof require !== 'undefined' && require('./badge-system.js').BadgeSystem);
            
            // GamificationSystemクラスが利用可能かチェック
            const GamificationSystemClass = (typeof window !== 'undefined' && window.GamificationSystem) || 
                                          (typeof require !== 'undefined' && require('./gamification-system.js').GamificationSystem);
            
            if (BadgeSystemClass && this.progressTracker) {
                this.badgeSystem = new BadgeSystemClass(this.progressTracker, {
                    showNotifications: options.showBadgeNotifications !== false,
                    animationDuration: options.badgeAnimationDuration || 2000,
                    soundEnabled: options.badgeSoundEnabled !== false
                });
                
                // バッジシステムの初期化
                this.badgeSystem.initialize();
            }
            
            if (GamificationSystemClass && this.progressTracker && this.badgeSystem) {
                this.gamificationSystem = new GamificationSystemClass(this.progressTracker, this.badgeSystem, {
                    showProgressBars: options.showProgressBars !== false,
                    showStreakCounter: options.showStreakCounter !== false,
                    showLevelSystem: options.showLevelSystem !== false,
                    showDailyGoals: options.showDailyGoals !== false,
                    animationEnabled: options.gamificationAnimations !== false
                });
            }
            
            console.log('Motivation systems initialized:', {
                badgeSystem: !!this.badgeSystem,
                gamificationSystem: !!this.gamificationSystem
            });
        } catch (error) {
            console.warn('Failed to initialize motivation systems:', error);
            this.badgeSystem = null;
            this.gamificationSystem = null;
        }
    }
    
    /**
     * 音声の事前読み込み
     */
    async preloadAudio() {
        if (!this.audioManager) return;
        
        try {
            // 文字音声の事前読み込み
            await this.audioManager.preloadCharacterSounds(this.characters);
            
            // フィードバック音声の事前読み込み
            await this.audioManager.preloadFeedbackSounds();
            
            console.log('Audio preloading completed');
        } catch (error) {
            console.warn('Audio preloading failed:', error);
        }
    }
    
    /**
     * ゲーム初期化
     */
    initializeGame() {
        try {
            // 文字データが正しく読み込まれているか確認
            if (!this.characters || this.characters.length === 0) {
                throw new Error('No characters available for this age group and mode');
            }
            
            this.createGameUI();
            this.bindEvents();
            this.isGameActive = true;
            
            console.log('Game initialized successfully:', {
                ageGroup: this.ageGroup,
                mode: this.mode,
                characterCount: this.characters.length
            });
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.showInitializationError(error.message);
            throw error;
        }
    }
    
    /**
     * 初期化エラーを表示
     */
    showInitializationError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 8px; text-align: center;">
                    <h3>⚠️ ゲームの読み込みに失敗しました</h3>
                    <p>${message}</p>
                    <p>以下を確認してください：</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>インターネット接続が正常か</li>
                        <li>ブラウザが最新版か</li>
                        <li>JavaScriptが有効になっているか</li>
                    </ul>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                        ページを再読み込み
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * ゲームUIの作成
     */
    createGameUI() {
        // メインゲームコンテナ
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'hiragana-game';
        this.gameContainer.innerHTML = `
            <div class="game-header">
                <div class="score-display">スコア: <span class="score-value">0</span></div>
                <div class="mode-display">${this.getModeDisplayName()}</div>
                ${this.isFocusedPractice ? '<div class="practice-mode-indicator">🎯 重点練習モード</div>' : ''}
            </div>
            
            ${this.isFocusedPractice ? this.createFocusedPracticeInfo() : ''}
            
            <div class="question-section">
                <div class="question-prompt">この文字の読み方は？</div>
                <div class="character-display"></div>
                <button class="sound-button" title="音声を再生">🔊</button>
            </div>
            
            <div class="choices-container"></div>
            
            <div class="feedback-container" style="display: none;">
                <div class="feedback-message"></div>
                <button class="next-button">次の問題</button>
            </div>
            
            <div class="mode-switcher" style="margin-bottom: 20px;">
                <button class="mode-switch-btn recognition-mode active">文字認識</button>
                ${this.ageGroup === '5-6' ? '<button class="mode-switch-btn writing-mode">書き練習</button>' : ''}
                ${this.ageGroup === '5-6' ? '<button class="mode-switch-btn word-formation-mode">単語作り</button>' : ''}
            </div>
            
            <div class="game-content">
                <div class="recognition-game-content">
                    <!-- 文字認識ゲームのコンテンツがここに入る -->
                </div>
                <div class="writing-practice-content" style="display: none;">
                    <!-- 書き練習のコンテンツがここに入る -->
                </div>
                <div class="word-formation-content" style="display: none;">
                    <!-- 単語形成ゲームのコンテンツがここに入る -->
                </div>
            </div>
            
            <div class="game-controls">
                <button class="start-button">${this.isFocusedPractice ? '重点練習開始' : 'ゲーム開始'}</button>
                <button class="restart-button" style="display: none;">もう一度</button>
                ${this.progressTracker ? '<button class="weak-characters-button">苦手文字を練習</button>' : ''}
                ${this.gamificationSystem ? '<button class="progress-button">📊 進捗を見る</button>' : ''}
                ${this.badgeSystem ? '<button class="badges-button">🏆 バッジ</button>' : ''}
            </div>
        `;
        
        this.container.appendChild(this.gameContainer);
        
        // UI要素の参照を保存
        this.questionDisplay = this.gameContainer.querySelector('.character-display');
        this.choicesContainer = this.gameContainer.querySelector('.choices-container');
        this.feedbackContainer = this.gameContainer.querySelector('.feedback-container');
        this.scoreDisplay = this.gameContainer.querySelector('.score-value');
        
        // 文字認識ゲームのコンテンツを移動
        const recognitionContent = this.gameContainer.querySelector('.recognition-game-content');
        const questionSection = this.gameContainer.querySelector('.question-section');
        const choicesContainer = this.gameContainer.querySelector('.choices-container');
        const feedbackContainer = this.gameContainer.querySelector('.feedback-container');
        
        if (recognitionContent && questionSection) {
            recognitionContent.appendChild(questionSection);
            recognitionContent.appendChild(choicesContainer);
            recognitionContent.appendChild(feedbackContainer);
        }
        
        // 5-6歳向けの場合、書き練習機能と単語形成ゲームを初期化
        if (this.ageGroup === '5-6') {
            this.initializeWritingPractice();
            this.initializeWordFormationGame();
        }
    }
    
    /**
     * モード表示名を取得
     */
    getModeDisplayName() {
        const modeNames = {
            'hiragana': 'ひらがな',
            'katakana': 'カタカナ',
            'mixed': 'ひらがな・カタカナ'
        };
        return modeNames[this.mode] || 'ひらがな';
    }
    
    /**
     * 重点練習情報UIを作成
     */
    createFocusedPracticeInfo() {
        if (!this.focusedCharacters.length) return '';
        
        const characterList = this.focusedCharacters.map(char => 
            `<span class="focus-character">${char.character} (${char.romaji})</span>`
        ).join('');
        
        return `
            <div class="focused-practice-info">
                <div class="practice-title">🎯 今日の重点練習文字</div>
                <div class="practice-characters">${characterList}</div>
                <div class="practice-description">
                    これらの文字を重点的に練習して、苦手を克服しましょう！
                </div>
            </div>
        `;
    }
    
    /**
     * イベントバインディング
     */
    bindEvents() {
        const startButton = this.gameContainer.querySelector('.start-button');
        const restartButton = this.gameContainer.querySelector('.restart-button');
        const nextButton = this.gameContainer.querySelector('.next-button');
        const soundButton = this.gameContainer.querySelector('.sound-button');
        
        startButton.addEventListener('click', () => this.startNewRound());
        restartButton.addEventListener('click', () => this.restartGame());
        nextButton.addEventListener('click', () => this.startNewRound());
        
        // 音声再生ボタン
        if (soundButton) {
            soundButton.addEventListener('click', () => {
                this.playCurrentCharacterSound();
                // ボタンクリック効果音
                if (this.audioManager) {
                    this.audioManager.playFeedbackSound('button');
                }
            });
        }
        
        // 苦手文字練習ボタン
        const weakCharactersButton = this.gameContainer.querySelector('.weak-characters-button');
        if (weakCharactersButton) {
            weakCharactersButton.addEventListener('click', () => {
                this.showWeakCharactersPracticeDialog();
            });
        }
        
        // 進捗表示ボタン
        const progressButton = this.gameContainer.querySelector('.progress-button');
        if (progressButton) {
            progressButton.addEventListener('click', () => {
                this.showProgressVisualization();
            });
        }
        
        // バッジコレクションボタン
        const badgesButton = this.gameContainer.querySelector('.badges-button');
        if (badgesButton) {
            badgesButton.addEventListener('click', () => {
                this.showBadgeCollection();
            });
        }
        
        // モード切り替えボタン（5-6歳向けのみ）
        if (this.ageGroup === '5-6') {
            const recognitionModeBtn = this.gameContainer.querySelector('.recognition-mode');
            const writingModeBtn = this.gameContainer.querySelector('.writing-mode');
            const wordFormationModeBtn = this.gameContainer.querySelector('.word-formation-mode');
            
            if (recognitionModeBtn) {
                recognitionModeBtn.addEventListener('click', () => {
                    this.switchToRecognitionMode();
                });
            }
            
            if (writingModeBtn) {
                writingModeBtn.addEventListener('click', () => {
                    this.switchToWritingMode();
                });
            }
            
            if (wordFormationModeBtn) {
                wordFormationModeBtn.addEventListener('click', () => {
                    this.switchToWordFormationMode();
                });
            }
        }
    }
    
    /**
     * 新しいラウンドを開始
     */
    startNewRound() {
        if (!this.isGameActive || this.characters.length === 0) return;
        
        // UI状態をリセット
        this.hideFeedback();
        this.hideGameControls();
        
        // ランダムな文字を選択
        this.currentCharacter = this.getRandomCharacter();
        
        // 選択肢を生成
        this.choices = this.generateChoices(this.currentCharacter);
        
        // UIを更新
        this.displayQuestion();
        this.displayChoices();
        
        this.totalQuestions++;
    }
    
    /**
     * ランダムな文字を取得
     */
    getRandomCharacter() {
        const randomIndex = Math.floor(Math.random() * this.characters.length);
        return this.characters[randomIndex];
    }
    
    /**
     * 選択肢を生成（年齢別難易度対応）
     */
    generateChoices(targetCharacter) {
        const choices = [targetCharacter];
        const choiceCount = this.difficultySettings.choiceCount;
        
        // 同じタイプの文字から間違った選択肢を選択
        const availableCharacters = this.characters.filter(char => 
            char.id !== targetCharacter.id && char.type === targetCharacter.type
        );
        
        // 3-4歳向け：より簡単な選択肢（見た目が大きく異なる文字を優先）
        if (this.ageGroup === '3-4') {
            // 基本的な文字から選択（あ行、か行、さ行など異なる行から選択）
            const differentRowCharacters = this.selectDifferentRowCharacters(
                targetCharacter, availableCharacters
            );
            
            while (choices.length < choiceCount && differentRowCharacters.length > 0) {
                const randomIndex = Math.floor(Math.random() * differentRowCharacters.length);
                const randomChar = differentRowCharacters.splice(randomIndex, 1)[0];
                choices.push(randomChar);
            }
        } else {
            // 5-6歳向け：より挑戦的な選択肢
            while (choices.length < choiceCount && availableCharacters.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableCharacters.length);
                const randomChar = availableCharacters.splice(randomIndex, 1)[0];
                choices.push(randomChar);
            }
        }
        
        // 選択肢をシャッフル
        return choices.sort(() => Math.random() - 0.5);
    }
    
    /**
     * 異なる行の文字を選択（3-4歳向けの簡単な選択肢生成）
     */
    selectDifferentRowCharacters(targetCharacter, availableCharacters) {
        const targetRomaji = targetCharacter.romaji;
        const targetRow = targetRomaji.charAt(0); // 'a', 'k', 's', 't', 'n' など
        
        // 異なる行の文字を優先的に選択
        const differentRowChars = availableCharacters.filter(char => {
            const charRow = char.romaji.charAt(0);
            return charRow !== targetRow;
        });
        
        // 異なる行の文字が不足している場合は、同じ行の文字も含める
        if (differentRowChars.length < 2) {
            return availableCharacters;
        }
        
        return differentRowChars;
    }
    
    /**
     * 問題を表示
     */
    displayQuestion() {
        this.questionDisplay.textContent = this.currentCharacter.id;
        this.questionDisplay.className = 'character-display active';
        
        // 文字音声を自動再生（オプション）
        if (this.audioManager && this.difficultySettings.autoPlayCharacterSound !== false) {
            setTimeout(() => {
                this.audioManager.playCharacterSound(this.currentCharacter);
            }, 500); // 少し遅れて再生
        }
    }
    
    /**
     * 選択肢を表示
     */
    displayChoices() {
        this.choicesContainer.innerHTML = '';
        
        this.choices.forEach((character, index) => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice-button';
            choiceButton.textContent = character.romaji;
            choiceButton.dataset.characterId = character.id;
            
            choiceButton.addEventListener('click', () => {
                this.handleAnswer(character);
            });
            
            this.choicesContainer.appendChild(choiceButton);
        });
    }
    
    /**
     * 回答を処理
     */
    handleAnswer(selectedCharacter) {
        const isCorrect = selectedCharacter.id === this.currentCharacter.id;
        
        // 選択肢ボタンを無効化
        this.disableChoices();
        
        // 音声フィードバックを再生
        this.playAudioFeedback(isCorrect);
        
        // 視覚的フィードバックを表示（アニメーション付き）
        this.showVisualFeedback(selectedCharacter, isCorrect);
        
        // スコアを更新
        if (isCorrect) {
            this.score++;
            this.updateScoreDisplay();
            this.playCorrectAnimation();
            
            // 正解時のモチベーション機能
            this.handleCorrectAnswer();
        } else {
            this.playIncorrectAnimation();
        }
        
        // 進捗を記録（モチベーションシステム用）
        this.recordAnswerForMotivation(selectedCharacter, isCorrect);
        
        // 年齢に応じたフィードバックメッセージを表示
        setTimeout(() => {
            this.showFeedback(isCorrect);
        }, 500); // アニメーション後にフィードバック表示
    }
    
    /**
     * 選択肢ボタンを無効化
     */
    disableChoices() {
        const choiceButtons = this.choicesContainer.querySelectorAll('.choice-button');
        choiceButtons.forEach(button => {
            button.disabled = true;
        });
    }
    
    /**
     * 視覚的フィードバックを表示（アニメーション付き）
     */
    showVisualFeedback(selectedCharacter, isCorrect) {
        const choiceButtons = this.choicesContainer.querySelectorAll('.choice-button');
        
        choiceButtons.forEach(button => {
            const characterId = button.dataset.characterId;
            
            if (characterId === this.currentCharacter.id) {
                // 正解の選択肢を緑色でハイライト（アニメーション付き）
                button.classList.add('correct', 'pulse-animation');
            } else if (characterId === selectedCharacter.id && !isCorrect) {
                // 間違った選択肢を赤色でハイライト（シェイクアニメーション付き）
                button.classList.add('incorrect', 'shake-animation');
            } else {
                // その他の選択肢を薄くする
                button.classList.add('dimmed');
            }
        });
    }
    
    /**
     * 正解時のアニメーション
     */
    playCorrectAnimation() {
        // 文字表示部分にお祝いアニメーション
        this.questionDisplay.classList.add('celebration-animation');
        
        // 年齢に応じた効果
        if (this.ageGroup === '3-4') {
            // 3-4歳向け：より派手なアニメーション
            this.createConfettiEffect();
        }
        
        // アニメーションクリーンアップ
        setTimeout(() => {
            this.questionDisplay.classList.remove('celebration-animation');
        }, 1000);
    }
    
    /**
     * 不正解時のアニメーション
     */
    playIncorrectAnimation() {
        // 文字表示部分に励ましのアニメーション
        this.questionDisplay.classList.add('encouragement-animation');
        
        // アニメーションクリーンアップ
        setTimeout(() => {
            this.questionDisplay.classList.remove('encouragement-animation');
        }, 800);
    }
    
    /**
     * 紙吹雪効果を作成（3-4歳向け）
     */
    createConfettiEffect() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: 50%;
                animation: confetti-fall 2s ease-out forwards;
                z-index: 1000;
            `;
            
            this.gameContainer.appendChild(confetti);
            
            // 紙吹雪を削除
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 2000);
        }
    }
    
    /**
     * 音声フィードバックを再生
     */
    async playAudioFeedback(isCorrect) {
        if (!this.audioManager) return;
        
        try {
            // 効果音を即座に再生
            const effectType = isCorrect ? 'correct' : 'incorrect';
            await this.audioManager.playFeedbackSound(effectType);
            
            // 正解の場合は文字音声も再生
            if (isCorrect) {
                setTimeout(async () => {
                    await this.audioManager.playCharacterSound(this.currentCharacter);
                }, 300);
            }
            
            // 励ましメッセージ音声を再生（少し遅れて）
            setTimeout(async () => {
                await this.audioManager.playEncouragementSound(this.ageGroup, isCorrect);
            }, isCorrect ? 800 : 600);
            
        } catch (error) {
            console.warn('Audio feedback error:', error);
        }
    }
    
    /**
     * 年齢に応じたフィードバックメッセージを表示
     */
    showFeedback(isCorrect) {
        const feedbackMessage = this.feedbackContainer.querySelector('.feedback-message');
        const encouragementMessages = this.getEncouragementMessages(isCorrect);
        
        if (isCorrect) {
            feedbackMessage.innerHTML = `
                <div class="feedback-correct">
                    <span class="feedback-icon">${encouragementMessages.icon}</span>
                    <span class="feedback-text">${encouragementMessages.message}</span>
                </div>
                <div class="feedback-character">
                    「${this.currentCharacter.id}」は「${this.currentCharacter.romaji}」です
                </div>
                ${this.ageGroup === '3-4' ? '<div class="extra-praise">すごいね！</div>' : ''}
            `;
            this.feedbackContainer.className = 'feedback-container correct slide-in';
        } else {
            feedbackMessage.innerHTML = `
                <div class="feedback-incorrect">
                    <span class="feedback-icon">${encouragementMessages.icon}</span>
                    <span class="feedback-text">${encouragementMessages.message}</span>
                </div>
                <div class="feedback-character">
                    「${this.currentCharacter.id}」は「${this.currentCharacter.romaji}」です
                </div>
                ${this.ageGroup === '3-4' ? '<div class="extra-encouragement">つぎはできるよ！</div>' : ''}
            `;
            this.feedbackContainer.className = 'feedback-container incorrect slide-in';
        }
        
        this.feedbackContainer.style.display = 'block';
        
        // 年齢に応じたフィードバック表示時間
        const displayTime = this.difficultySettings.feedbackDelay;
        setTimeout(() => {
            this.enableNextButton();
        }, displayTime);
    }
    
    /**
     * 年齢に応じた励ましメッセージを取得
     */
    getEncouragementMessages(isCorrect) {
        const messages = {
            '3-4': {
                correct: {
                    messages: ['やったね！', 'すごい！', 'せいかい！', 'えらいね！'],
                    icons: ['🎉', '⭐', '🌟', '👏', '🎊']
                },
                incorrect: {
                    messages: ['だいじょうぶ！', 'がんばって！', 'つぎはできるよ！', 'もういちど！'],
                    icons: ['💪', '🌈', '🐻', '🌸', '🎈']
                }
            },
            '5-6': {
                correct: {
                    messages: ['正解！', 'よくできました！', 'すばらしい！', 'その調子！'],
                    icons: ['🎉', '✨', '🏆', '👍', '⭐']
                },
                incorrect: {
                    messages: ['がんばって！', 'もう一度挑戦！', 'あと少し！', '練習すれば上手になるよ！'],
                    icons: ['💪', '🌟', '📚', '🎯', '🌱']
                }
            }
        };
        
        const ageMessages = messages[this.ageGroup] || messages['3-4'];
        const categoryMessages = isCorrect ? ageMessages.correct : ageMessages.incorrect;
        
        const randomMessage = categoryMessages.messages[
            Math.floor(Math.random() * categoryMessages.messages.length)
        ];
        const randomIcon = categoryMessages.icons[
            Math.floor(Math.random() * categoryMessages.icons.length)
        ];
        
        return {
            message: randomMessage,
            icon: randomIcon
        };
    }
    
    /**
     * 次へボタンを有効化
     */
    enableNextButton() {
        const nextButton = this.feedbackContainer.querySelector('.next-button');
        nextButton.disabled = false;
        nextButton.classList.add('pulse-button');
    }
    
    /**
     * フィードバックを非表示
     */
    hideFeedback() {
        this.feedbackContainer.style.display = 'none';
        this.feedbackContainer.classList.remove('slide-in');
        
        // 選択肢のスタイルをリセット
        const choiceButtons = this.choicesContainer.querySelectorAll('.choice-button');
        choiceButtons.forEach(button => {
            button.classList.remove(
                'correct', 'incorrect', 'dimmed', 
                'pulse-animation', 'shake-animation'
            );
            button.disabled = false;
        });
        
        // 次へボタンのスタイルをリセット
        const nextButton = this.feedbackContainer.querySelector('.next-button');
        nextButton.disabled = true;
        nextButton.classList.remove('pulse-button');
    }
    
    /**
     * 正解時のモチベーション機能を処理
     */
    handleCorrectAnswer() {
        // スタンプを付与
        if (this.badgeSystem) {
            this.badgeSystem.awardStamp('correct-answer', {
                character: this.currentCharacter.id,
                mode: this.mode,
                ageGroup: this.ageGroup
            });
        }
    }
    
    /**
     * 回答をモチベーションシステム用に記録
     */
    recordAnswerForMotivation(selectedCharacter, isCorrect) {
        if (!this.progressTracker) return;
        
        // 進捗追跡システムに記録
        this.progressTracker.recordAttempt(this.currentCharacter.id, isCorrect, {
            selectedAnswer: selectedCharacter.id,
            mode: this.mode,
            ageGroup: this.ageGroup,
            timestamp: new Date().toISOString()
        });
        
        // バッジチェックと付与
        if (this.badgeSystem) {
            const progress = this.progressTracker.loadProgress();
            if (progress) {
                this.badgeSystem.checkAndAwardBadges(progress);
            }
        }
    }
    
    /**
     * セッション完了時のモチベーション機能を処理
     */
    handleSessionComplete() {
        if (!this.progressTracker) return;
        
        const progress = this.progressTracker.loadProgress();
        if (!progress) return;
        
        // セッション完了スタンプを付与
        if (this.badgeSystem) {
            this.badgeSystem.awardStamp('session-complete', {
                score: this.score,
                totalQuestions: this.totalQuestions,
                accuracy: (this.score / this.totalQuestions) * 100,
                mode: this.mode,
                ageGroup: this.ageGroup
            });
        }
        
        // 連続正解チェック
        this.checkStreakAchievements();
        
        // 新しい文字習得チェック
        this.checkNewCharacterMastery();
    }
    
    /**
     * 連続正解の成果をチェック
     */
    checkStreakAchievements() {
        if (!this.badgeSystem) return;
        
        // 現在のセッションでの連続正解数を計算
        let currentStreak = 0;
        let maxStreak = 0;
        
        // 簡単な連続正解カウント（実際の実装では詳細な追跡が必要）
        if (this.score >= 5) {
            this.badgeSystem.awardStamp('streak-5', {
                streak: 5,
                mode: this.mode
            });
        }
        
        if (this.score >= 10) {
            this.badgeSystem.awardStamp('streak-10', {
                streak: 10,
                mode: this.mode
            });
        }
    }
    
    /**
     * 新しい文字習得をチェック
     */
    checkNewCharacterMastery() {
        if (!this.progressTracker || !this.badgeSystem) return;
        
        const progress = this.progressTracker.loadProgress();
        if (!progress) return;
        
        // 今回のセッションで新しく習得した文字があるかチェック
        const recentlyMastered = progress.masteredCharacters.filter(charId => {
            const stats = progress.characterStats[charId];
            if (!stats) return false;
            
            // 最近習得した文字（今日習得した文字）
            const today = new Date().toDateString();
            const masteredToday = new Date(stats.lastAttemptDate).toDateString() === today;
            
            return masteredToday && stats.masteryLevel >= 80;
        });
        
        if (recentlyMastered.length > 0) {
            recentlyMastered.forEach(charId => {
                this.badgeSystem.awardStamp('character-mastered', {
                    character: charId,
                    mode: this.mode
                });
            });
        }
    }
    
    /**
     * 進捗可視化を表示
     */
    showProgressVisualization() {
        if (!this.gamificationSystem) return;
        
        // 進捗表示用のコンテナを作成
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-visualization-container';
        
        // ゲームコンテナに追加
        this.container.appendChild(progressContainer);
        
        // ゲーミフィケーションシステムで進捗を表示
        this.gamificationSystem.createProgressVisualization(progressContainer);
    }
    
    /**
     * バッジコレクションを表示
     */
    showBadgeCollection() {
        if (!this.badgeSystem) return;
        
        // バッジコレクション用のコンテナを作成
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'badge-collection-container';
        
        // モーダルとして表示
        const modal = document.createElement('div');
        modal.className = 'badge-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🏆 バッジコレクション</h3>
                    <button class="close-button">×</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        
        const modalBody = modal.querySelector('.modal-body');
        modalBody.appendChild(badgeContainer);
        
        document.body.appendChild(modal);
        
        // バッジコレクションを表示
        this.badgeSystem.createBadgeCollection(badgeContainer);
        
        // モーダルを閉じる
        modal.querySelector('.close-button').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    }
    
    /**
     * ゲームコントロールを非表示
     */
    hideGameControls() {
        const startButton = this.gameContainer.querySelector('.start-button');
        const restartButton = this.gameContainer.querySelector('.restart-button');
        
        startButton.style.display = 'none';
        restartButton.style.display = 'none';
    }
    
    /**
     * スコア表示を更新
     */
    updateScoreDisplay() {
        this.scoreDisplay.textContent = this.score;
    }
    
    /**
     * ゲームを再開
     */
    restartGame() {
        // セッション完了処理（再開前に前のセッションを完了扱い）
        if (this.totalQuestions > 0) {
            this.handleSessionComplete();
        }
        
        this.score = 0;
        this.totalQuestions = 0;
        this.updateScoreDisplay();
        this.hideFeedback();
        
        const startButton = this.gameContainer.querySelector('.start-button');
        const restartButton = this.gameContainer.querySelector('.restart-button');
        
        startButton.style.display = 'inline-block';
        restartButton.style.display = 'none';
        
        // 問題表示をクリア
        this.questionDisplay.textContent = '';
        this.questionDisplay.className = 'character-display';
        this.choicesContainer.innerHTML = '';
    }
    
    /**
     * モードを切り替え
     */
    switchMode(newMode) {
        this.mode = newMode;
        this.characters = this.getCharacterSet();
        
        // モード表示を更新
        const modeDisplay = this.gameContainer.querySelector('.mode-display');
        modeDisplay.textContent = this.getModeDisplayName();
        
        // ゲームをリセット
        this.restartGame();
    }
    
    /**
     * 進捗情報を取得
     */
    getProgress() {
        return {
            score: this.score,
            totalQuestions: this.totalQuestions,
            accuracy: this.totalQuestions > 0 ? (this.score / this.totalQuestions) * 100 : 0,
            mode: this.mode,
            ageGroup: this.ageGroup
        };
    }
    
    /**
     * 音声設定を変更
     * @param {Object} audioSettings - 音声設定
     */
    updateAudioSettings(audioSettings) {
        if (!this.audioManager) return;
        
        if (audioSettings.enabled !== undefined) {
            this.audioManager.setEnabled(audioSettings.enabled);
        }
        
        if (audioSettings.volume !== undefined) {
            this.audioManager.setVolume(audioSettings.volume);
        }
    }
    
    /**
     * 文字音声を手動再生（ボタンクリック等）
     */
    playCurrentCharacterSound() {
        if (this.audioManager && this.currentCharacter) {
            this.audioManager.playCharacterSound(this.currentCharacter);
        }
    }
    
    /**
     * 音声統計情報を取得
     */
    getAudioStats() {
        if (this.audioManager) {
            return this.audioManager.getLoadingStats();
        }
        return null;
    }
    
    /**
     * 苦手文字練習ダイアログを表示
     */
    showWeakCharactersPracticeDialog() {
        if (!this.progressTracker) {
            alert('進捗追跡機能が利用できません');
            return;
        }
        
        const weakCharacters = this.progressTracker.identifyWeakCharacters({
            characterType: this.mode === 'mixed' ? null : this.mode,
            minAttempts: 2
        });
        
        if (weakCharacters.length === 0) {
            this.showNoWeakCharactersDialog();
            return;
        }
        
        this.createWeakCharactersPracticeDialog(weakCharacters);
    }
    
    /**
     * 苦手文字がない場合のダイアログを表示
     */
    showNoWeakCharactersDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'weak-characters-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>🎉 素晴らしいです！</h3>
                        <button class="dialog-close">×</button>
                    </div>
                    <div class="dialog-body">
                        <div class="success-message">
                            <div class="success-icon">🌟</div>
                            <p>現在、特に苦手な文字はありません！</p>
                            <p>とても良い調子で学習が進んでいます。</p>
                        </div>
                        <div class="suggestions">
                            <h4>次のステップ：</h4>
                            <ul>
                                <li>新しい文字の学習に挑戦しましょう</li>
                                <li>学習した文字の復習を続けましょう</li>
                                <li>文字書き練習にも挑戦してみましょう</li>
                            </ul>
                        </div>
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-button primary">続ける</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.bindDialogEvents(dialog);
    }
    
    /**
     * 苦手文字練習ダイアログを作成
     */
    createWeakCharactersPracticeDialog(weakCharacters) {
        const dialog = document.createElement('div');
        dialog.className = 'weak-characters-dialog';
        
        const charactersList = weakCharacters.slice(0, 5).map(char => `
            <div class="weak-character-item" data-character="${char.character}">
                <div class="character-info">
                    <span class="character">${char.character}</span>
                    <span class="romaji">${char.romaji}</span>
                </div>
                <div class="character-stats">
                    <div class="accuracy">正答率: ${Math.round(char.accuracy)}%</div>
                    <div class="attempts">試行回数: ${char.totalAttempts}回</div>
                </div>
                <div class="recommendations">
                    ${char.recommendedPractice.slice(0, 2).map(rec => 
                        `<span class="recommendation-tag">${rec.title}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
        
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>🎯 苦手文字の重点練習</h3>
                        <button class="dialog-close">×</button>
                    </div>
                    <div class="dialog-body">
                        <div class="practice-explanation">
                            <p>以下の文字が苦手と判定されました。重点的に練習しましょう！</p>
                        </div>
                        <div class="weak-characters-list">
                            ${charactersList}
                        </div>
                        ${weakCharacters.length > 5 ? `<div class="more-characters">他 ${weakCharacters.length - 5} 文字</div>` : ''}
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-button secondary">キャンセル</button>
                        <button class="dialog-button primary" data-action="start-practice">重点練習を開始</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.bindDialogEvents(dialog, weakCharacters);
    }
    
    /**
     * ダイアログイベントをバインド
     */
    bindDialogEvents(dialog, weakCharacters = null) {
        const closeButton = dialog.querySelector('.dialog-close');
        const overlay = dialog.querySelector('.dialog-overlay');
        const cancelButton = dialog.querySelector('.dialog-button.secondary');
        const primaryButton = dialog.querySelector('.dialog-button.primary');
        
        const closeDialog = () => {
            document.body.removeChild(dialog);
        };
        
        closeButton.addEventListener('click', closeDialog);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeDialog();
        });
        
        if (cancelButton) {
            cancelButton.addEventListener('click', closeDialog);
        }
        
        if (primaryButton && weakCharacters) {
            primaryButton.addEventListener('click', () => {
                closeDialog();
                this.startFocusedPractice(weakCharacters.slice(0, 5));
            });
        } else if (primaryButton) {
            primaryButton.addEventListener('click', closeDialog);
        }
    }
    
    /**
     * 重点練習を開始
     */
    startFocusedPractice(weakCharacters) {
        // 現在のゲームを重点練習モードに切り替え
        this.isFocusedPractice = true;
        this.focusedCharacters = weakCharacters;
        this.characters = this.getCharacterSet();
        
        // UIを更新
        this.updateUIForFocusedPractice();
        
        // ゲームをリセットして開始
        this.restartGame();
        
        // 励ましメッセージを表示
        this.showFocusedPracticeStartMessage(weakCharacters);
    }
    
    /**
     * 重点練習用にUIを更新
     */
    updateUIForFocusedPractice() {
        // ヘッダーに重点練習インジケーターを追加
        const gameHeader = this.gameContainer.querySelector('.game-header');
        if (!gameHeader.querySelector('.practice-mode-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'practice-mode-indicator';
            indicator.innerHTML = '🎯 重点練習モード';
            gameHeader.appendChild(indicator);
        }
        
        // 重点練習情報を追加
        const existingInfo = this.gameContainer.querySelector('.focused-practice-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        const practiceInfo = document.createElement('div');
        practiceInfo.innerHTML = this.createFocusedPracticeInfo();
        gameHeader.insertAdjacentElement('afterend', practiceInfo.firstElementChild);
        
        // ボタンテキストを更新
        const startButton = this.gameContainer.querySelector('.start-button');
        if (startButton) {
            startButton.textContent = '重点練習開始';
        }
    }
    
    /**
     * 重点練習開始メッセージを表示
     */
    showFocusedPracticeStartMessage(weakCharacters) {
        const characterNames = weakCharacters.map(char => char.character).join('、');
        
        const message = document.createElement('div');
        message.className = 'practice-start-message';
        message.innerHTML = `
            <div class="message-content">
                <div class="message-icon">🎯</div>
                <div class="message-text">
                    「${characterNames}」の重点練習を開始します！<br>
                    苦手を克服して、さらに上達しましょう！
                </div>
            </div>
        `;
        
        this.gameContainer.appendChild(message);
        
        // 3秒後にメッセージを削除
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    /**
     * 重点練習モードを終了
     */
    exitFocusedPractice() {
        this.isFocusedPractice = false;
        this.focusedCharacters = [];
        this.characters = this.getCharacterSet();
        
        // UIを通常モードに戻す
        const indicator = this.gameContainer.querySelector('.practice-mode-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        const practiceInfo = this.gameContainer.querySelector('.focused-practice-info');
        if (practiceInfo) {
            practiceInfo.remove();
        }
        
        const startButton = this.gameContainer.querySelector('.start-button');
        if (startButton) {
            startButton.textContent = 'ゲーム開始';
        }
        
        this.restartGame();
    }
    
    /**
     * 重点練習の結果を評価
     */
    evaluateFocusedPracticeResults() {
        if (!this.isFocusedPractice || !this.progressTracker) return;
        
        // 練習結果を分析
        const practiceResults = {};
        this.focusedCharacters.forEach(char => {
            const stats = this.progressTracker.getCharacterMastery(char.character);
            if (stats) {
                practiceResults[char.character] = {
                    accuracy: stats.accuracy,
                    averageResponseTime: stats.averageResponseTime,
                    improvement: stats.accuracy - (char.accuracy || 0)
                };
            }
        });
        
        // 結果を評価
        const evaluation = this.progressTracker.evaluatePracticeSession(
            'focused_practice_' + Date.now(),
            practiceResults
        );
        
        return evaluation;
    }
    
    /**
     * 書き練習機能を初期化
     */
    initializeWritingPractice() {
        try {
            // WritingPracticeGameクラスが利用可能かチェック
            const WritingPracticeGameClass = (typeof window !== 'undefined' && window.WritingPracticeGame) || 
                                           (typeof require !== 'undefined' && require('./writing-practice.js').WritingPracticeGame);
            
            if (WritingPracticeGameClass) {
                const writingContainer = this.gameContainer.querySelector('.writing-practice-content');
                this.writingPractice = new WritingPracticeGameClass(writingContainer, {
                    canvasSize: 300,
                    strokeWidth: 8,
                    showStrokeOrder: true
                });
                
                // 書き練習完了時のコールバック
                this.writingPractice.onPracticeComplete = (result) => {
                    this.handleWritingPracticeComplete(result);
                };
                
                console.log('Writing practice initialized');
            } else {
                console.warn('WritingPracticeGame not available');
            }
        } catch (error) {
            console.warn('Failed to initialize writing practice:', error);
        }
    }
    
    /**
     * 文字認識モードに切り替え
     */
    switchToRecognitionMode() {
        this.currentMode = 'recognition';
        
        // UI表示を切り替え
        const recognitionContent = this.gameContainer.querySelector('.recognition-game-content');
        const writingContent = this.gameContainer.querySelector('.writing-practice-content');
        const wordFormationContent = this.gameContainer.querySelector('.word-formation-content');
        const recognitionBtn = this.gameContainer.querySelector('.recognition-mode');
        const writingBtn = this.gameContainer.querySelector('.writing-mode');
        const wordFormationBtn = this.gameContainer.querySelector('.word-formation-mode');
        
        if (recognitionContent) recognitionContent.style.display = 'block';
        if (writingContent) writingContent.style.display = 'none';
        if (wordFormationContent) wordFormationContent.style.display = 'none';
        
        // ボタンの状態を更新
        if (recognitionBtn) recognitionBtn.classList.add('active');
        if (writingBtn) writingBtn.classList.remove('active');
        if (wordFormationBtn) wordFormationBtn.classList.remove('active');
        
        // ゲームをリセット
        this.restartGame();
    }
    
    /**
     * 書き練習モードに切り替え
     */
    switchToWritingMode() {
        this.currentMode = 'writing';
        
        // UI表示を切り替え
        const recognitionContent = this.gameContainer.querySelector('.recognition-game-content');
        const writingContent = this.gameContainer.querySelector('.writing-practice-content');
        const wordFormationContent = this.gameContainer.querySelector('.word-formation-content');
        const recognitionBtn = this.gameContainer.querySelector('.recognition-mode');
        const writingBtn = this.gameContainer.querySelector('.writing-mode');
        const wordFormationBtn = this.gameContainer.querySelector('.word-formation-mode');
        
        if (recognitionContent) recognitionContent.style.display = 'none';
        if (writingContent) writingContent.style.display = 'block';
        if (wordFormationContent) wordFormationContent.style.display = 'none';
        
        // ボタンの状態を更新
        if (recognitionBtn) recognitionBtn.classList.remove('active');
        if (writingBtn) writingBtn.classList.add('active');
        if (wordFormationBtn) wordFormationBtn.classList.remove('active');
        
        // 書き練習を開始
        this.startWritingPractice();
    }
    
    /**
     * 書き練習を開始
     */
    startWritingPractice() {
        if (!this.writingPractice || this.characters.length === 0) return;
        
        // ランダムな文字を選択（書き順データがある文字のみ）
        const charactersWithStrokes = this.characters.filter(char => 
            char.strokeOrder && char.strokeOrder.length > 0
        );
        
        if (charactersWithStrokes.length === 0) {
            console.warn('No characters with stroke order data available');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * charactersWithStrokes.length);
        const selectedCharacter = charactersWithStrokes[randomIndex];
        
        this.currentCharacter = selectedCharacter;
        this.writingPractice.startPractice(selectedCharacter);
        
        // 進捗追跡
        if (this.progressTracker) {
            this.progressTracker.startSession('writing_practice', {
                character: selectedCharacter.id,
                mode: this.mode,
                ageGroup: this.ageGroup
            });
        }
    }
    
    /**
     * 書き練習完了時の処理
     */
    handleWritingPracticeComplete(result) {
        // 進捗を記録
        if (this.progressTracker) {
            const isCompleted = result.completedStrokes >= result.totalStrokes;
            this.progressTracker.recordAttempt(result.character.id, isCompleted, {
                practiceType: 'writing',
                completedStrokes: result.completedStrokes,
                totalStrokes: result.totalStrokes,
                strokePaths: result.strokePaths
            });
        }
        
        // スコアを更新
        if (result.isCompleted) {
            this.score++;
            this.updateScoreDisplay();
        }
        
        this.totalQuestions++;
        
        // 音声フィードバック
        if (this.audioManager) {
            this.audioManager.playFeedbackSound(result.isCompleted ? 'correct' : 'incorrect');
            
            if (result.isCompleted) {
                setTimeout(() => {
                    this.audioManager.playCharacterSound(result.character);
                }, 500);
            }
        }
        
        // 次の練習を提案
        setTimeout(() => {
            this.showWritingPracticeNextDialog();
        }, 2000);
    }
    
    /**
     * 書き練習の次の問題ダイアログを表示
     */
    showWritingPracticeNextDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'writing-practice-next-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>書き練習完了！</h3>
                    </div>
                    <div class="dialog-body">
                        <p>「${this.currentCharacter.id}」の書き練習が完了しました。</p>
                        <p>次はどうしますか？</p>
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-button secondary" data-action="recognition">文字認識に戻る</button>
                        <button class="dialog-button primary" data-action="continue">次の文字を練習</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // イベントリスナーを追加
        const overlay = dialog.querySelector('.dialog-overlay');
        const recognitionBtn = dialog.querySelector('[data-action="recognition"]');
        const continueBtn = dialog.querySelector('[data-action="continue"]');
        
        const closeDialog = () => {
            document.body.removeChild(dialog);
        };
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeDialog();
        });
        
        recognitionBtn.addEventListener('click', () => {
            closeDialog();
            this.switchToRecognitionMode();
        });
        
        continueBtn.addEventListener('click', () => {
            closeDialog();
            this.startWritingPractice();
        });
    }
    
    /**
     * 単語形成ゲーム機能を初期化
     */
    initializeWordFormationGame() {
        try {
            // WordFormationGameクラスが利用可能かチェック
            const WordFormationGameClass = (typeof window !== 'undefined' && window.WordFormationGame) || 
                                         (typeof require !== 'undefined' && require('./word-formation-game.js').WordFormationGame);
            
            if (WordFormationGameClass) {
                const wordFormationContainer = this.gameContainer.querySelector('.word-formation-content');
                this.wordFormationGame = new WordFormationGameClass(wordFormationContainer, {
                    ageGroup: this.ageGroup,
                    mode: this.mode,
                    audioManager: this.audioManager,
                    progressTracker: this.progressTracker
                });
                
                console.log('Word formation game initialized');
            } else {
                console.warn('WordFormationGame not available');
            }
        } catch (error) {
            console.warn('Failed to initialize word formation game:', error);
        }
    }
    
    /**
     * 単語形成モードに切り替え
     */
    switchToWordFormationMode() {
        this.currentMode = 'word-formation';
        
        // UI表示を切り替え
        const recognitionContent = this.gameContainer.querySelector('.recognition-game-content');
        const writingContent = this.gameContainer.querySelector('.writing-practice-content');
        const wordFormationContent = this.gameContainer.querySelector('.word-formation-content');
        const recognitionBtn = this.gameContainer.querySelector('.recognition-mode');
        const writingBtn = this.gameContainer.querySelector('.writing-mode');
        const wordFormationBtn = this.gameContainer.querySelector('.word-formation-mode');
        
        if (recognitionContent) recognitionContent.style.display = 'none';
        if (writingContent) writingContent.style.display = 'none';
        if (wordFormationContent) wordFormationContent.style.display = 'block';
        
        // ボタンの状態を更新
        if (recognitionBtn) recognitionBtn.classList.remove('active');
        if (writingBtn) writingBtn.classList.remove('active');
        if (wordFormationBtn) wordFormationBtn.classList.add('active');
        
        // 単語形成ゲームを開始
        this.startWordFormationGame();
    }
    
    /**
     * 単語形成ゲームを開始
     */
    startWordFormationGame() {
        if (!this.wordFormationGame) return;
        
        // 進捗追跡
        if (this.progressTracker) {
            this.progressTracker.startSession('word_formation', {
                mode: this.mode,
                ageGroup: this.ageGroup
            });
        }
        
        // ゲームを開始
        this.wordFormationGame.startNewGame();
    }
    
    /**
     * ゲームを破棄
     */
    destroy() {
        this.isGameActive = false;
        
        // 音声管理システムを破棄
        if (this.audioManager) {
            this.audioManager.destroy();
            this.audioManager = null;
        }
        
        // 書き練習システムを破棄
        if (this.writingPractice) {
            this.writingPractice.destroy();
            this.writingPractice = null;
        }
        
        // 単語形成ゲームシステムを破棄
        if (this.wordFormationGame) {
            this.wordFormationGame.destroy();
            this.wordFormationGame = null;
        }
        
        if (this.gameContainer && this.gameContainer.parentNode) {
            this.gameContainer.parentNode.removeChild(this.gameContainer);
        }
        
        // ダイアログが残っている場合は削除
        const dialogs = document.querySelectorAll('.weak-characters-dialog, .writing-practice-next-dialog');
        dialogs.forEach(dialog => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        });
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { HiraganaLearningGame };
} else {
    // ブラウザ環境
    window.HiraganaLearningGame = HiraganaLearningGame;
}