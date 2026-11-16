/**
 * 音声管理システム
 * Audio Management System for Hiragana/Katakana Learning
 */

class AudioManager {
    constructor(options = {}) {
        this.audioContext = null;
        this.audioBuffers = new Map(); // 音声バッファのキャッシュ
        this.loadedSounds = new Map(); // 読み込み済み音声ファイル
        this.isEnabled = options.enabled !== false; // デフォルトで有効
        this.volume = options.volume || 0.7; // デフォルト音量
        this.baseUrl = options.baseUrl || 'sounds/'; // 音声ファイルのベースURL
        
        // 音声ファイルの遅延読み込み設定
        this.preloadQueue = [];
        this.isPreloading = false;
        this.maxConcurrentLoads = 3; // 同時読み込み数制限
        
        // 効果音とフィードバック音声の設定
        this.feedbackSounds = new Map(); // フィードバック音声のキャッシュ
        this.encouragementMessages = this.getEncouragementMessages();
        
        this.initializeAudioContext();
        this.initializeFeedbackSounds();
    }
    
    /**
     * AudioContextの初期化
     */
    initializeAudioContext() {
        try {
            // Web Audio APIをサポートしているかチェック
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
            } else {
                console.warn('Web Audio API is not supported. Falling back to HTML5 Audio.');
                this.audioContext = null;
            }
        } catch (error) {
            console.warn('Failed to initialize AudioContext:', error);
            this.audioContext = null;
        }
    }
    
    /**
     * 文字音声の事前読み込み
     * @param {Array} characters - 文字データの配列
     */
    async preloadCharacterSounds(characters) {
        if (!this.isEnabled) return;
        
        // 読み込み対象の音声ファイルリストを作成
        const soundsToLoad = characters
            .filter(char => !this.loadedSounds.has(char.id))
            .map(char => ({
                id: char.id,
                url: this.getAudioUrl(char),
                type: char.type
            }));
        
        if (soundsToLoad.length === 0) return;
        
        console.log(`Preloading ${soundsToLoad.length} character sounds...`);
        
        // 遅延読み込みキューに追加
        this.preloadQueue.push(...soundsToLoad);
        
        // 読み込み開始
        if (!this.isPreloading) {
            await this.processPreloadQueue();
        }
    }
    
    /**
     * 事前読み込みキューの処理
     */
    async processPreloadQueue() {
        this.isPreloading = true;
        
        const loadPromises = [];
        
        // 同時読み込み数を制限して処理
        while (this.preloadQueue.length > 0 && loadPromises.length < this.maxConcurrentLoads) {
            const soundData = this.preloadQueue.shift();
            loadPromises.push(this.loadSingleSound(soundData));
        }
        
        if (loadPromises.length > 0) {
            try {
                await Promise.allSettled(loadPromises);
            } catch (error) {
                console.warn('Some sounds failed to load:', error);
            }
            
            // 残りがあれば再帰的に処理
            if (this.preloadQueue.length > 0) {
                await this.processPreloadQueue();
            }
        }
        
        this.isPreloading = false;
        console.log(`Audio preloading completed. Loaded ${this.loadedSounds.size} sounds.`);
    }
    
    /**
     * 単一音声ファイルの読み込み
     * @param {Object} soundData - 音声データ情報
     */
    async loadSingleSound(soundData) {
        try {
            if (this.audioContext) {
                // Web Audio API使用
                const response = await fetch(soundData.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch audio: ${response.status}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                this.audioBuffers.set(soundData.id, audioBuffer);
                this.loadedSounds.set(soundData.id, {
                    type: 'webaudio',
                    buffer: audioBuffer,
                    url: soundData.url
                });
            } else {
                // HTML5 Audio使用（フォールバック）
                const audio = new Audio();
                audio.preload = 'auto';
                audio.volume = this.volume;
                
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('error', reject, { once: true });
                    audio.src = soundData.url;
                });
                
                this.loadedSounds.set(soundData.id, {
                    type: 'html5',
                    audio: audio,
                    url: soundData.url
                });
            }
            
            console.log(`Loaded sound for character: ${soundData.id}`);
        } catch (error) {
            console.warn(`Failed to load sound for character ${soundData.id}:`, error);
            
            // 読み込み失敗時は代替手段を記録
            this.loadedSounds.set(soundData.id, {
                type: 'fallback',
                error: error.message,
                url: soundData.url
            });
        }
    }
    
    /**
     * 文字音声の再生
     * @param {Object} character - 文字データ
     * @returns {Promise} 再生完了のPromise
     */
    async playCharacterSound(character) {
        if (!this.isEnabled) {
            console.log('Audio is disabled');
            return Promise.resolve();
        }
        
        const characterId = character.id;
        const soundData = this.loadedSounds.get(characterId);
        
        if (!soundData) {
            // 音声が読み込まれていない場合は即座に読み込んで再生
            console.log(`Sound not preloaded for ${characterId}, loading now...`);
            await this.loadSingleSound({
                id: characterId,
                url: this.getAudioUrl(character),
                type: character.type
            });
            return this.playCharacterSound(character);
        }
        
        try {
            if (soundData.type === 'webaudio' && this.audioContext) {
                return this.playWebAudioSound(soundData.buffer);
            } else if (soundData.type === 'html5' && soundData.audio) {
                return this.playHtml5Sound(soundData.audio);
            } else {
                // フォールバック：音声なしで視覚的フィードバックのみ
                console.warn(`Cannot play sound for ${characterId}, using fallback`);
                return this.playFallbackSound(character);
            }
        } catch (error) {
            console.warn(`Error playing sound for ${characterId}:`, error);
            return this.playFallbackSound(character);
        }
    }
    
    /**
     * Web Audio APIでの音声再生
     * @param {AudioBuffer} buffer - 音声バッファ
     */
    playWebAudioSound(buffer) {
        return new Promise((resolve) => {
            try {
                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();
                
                source.buffer = buffer;
                gainNode.gain.value = this.volume;
                
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                source.addEventListener('ended', resolve, { once: true });
                source.start(0);
            } catch (error) {
                console.warn('Web Audio playback error:', error);
                resolve();
            }
        });
    }
    
    /**
     * HTML5 Audioでの音声再生
     * @param {HTMLAudioElement} audio - 音声要素
     */
    playHtml5Sound(audio) {
        return new Promise((resolve) => {
            try {
                // 音声を最初から再生
                audio.currentTime = 0;
                audio.volume = this.volume;
                
                const handleEnded = () => {
                    audio.removeEventListener('ended', handleEnded);
                    audio.removeEventListener('error', handleError);
                    resolve();
                };
                
                const handleError = (error) => {
                    audio.removeEventListener('ended', handleEnded);
                    audio.removeEventListener('error', handleError);
                    console.warn('HTML5 Audio playback error:', error);
                    resolve();
                };
                
                audio.addEventListener('ended', handleEnded, { once: true });
                audio.addEventListener('error', handleError, { once: true });
                
                const playPromise = audio.play();
                if (playPromise) {
                    playPromise.catch(handleError);
                }
            } catch (error) {
                console.warn('HTML5 Audio playback error:', error);
                resolve();
            }
        });
    }
    
    /**
     * フォールバック音声再生（視覚的フィードバックのみ）
     * @param {Object} character - 文字データ
     */
    playFallbackSound(character) {
        // 音声が再生できない場合の代替手段
        console.log(`Playing fallback for character: ${character.id} (${character.romaji})`);
        
        // 視覚的な読み方表示を実装
        this.showVisualPronunciation(character);
        
        return Promise.resolve();
    }
    
    /**
     * 視覚的な読み方表示
     * @param {Object} character - 文字データ
     */
    showVisualPronunciation(character) {
        // 画面上に読み方を一時的に表示
        const pronunciationElement = document.createElement('div');
        pronunciationElement.className = 'pronunciation-fallback';
        pronunciationElement.textContent = character.romaji;
        pronunciationElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 10000;
            animation: pronunciation-fade 2s ease-out forwards;
        `;
        
        // CSSアニメーションを追加
        if (!document.querySelector('#pronunciation-styles')) {
            const style = document.createElement('style');
            style.id = 'pronunciation-styles';
            style.textContent = `
                @keyframes pronunciation-fade {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(pronunciationElement);
        
        // 2秒後に削除
        setTimeout(() => {
            if (pronunciationElement.parentNode) {
                pronunciationElement.parentNode.removeChild(pronunciationElement);
            }
        }, 2000);
    }
    
    /**
     * 音声ファイルのURLを取得
     * @param {Object} character - 文字データ
     */
    getAudioUrl(character) {
        // 文字データにaudioFileが定義されている場合はそれを使用
        if (character.audioFile) {
            return character.audioFile;
        }
        
        // デフォルトのパス構成
        return `${this.baseUrl}${character.type}/${character.romaji}.mp3`;
    }
    
    /**
     * 音量設定
     * @param {number} volume - 音量（0.0 - 1.0）
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 音声の有効/無効切り替え
     * @param {boolean} enabled - 有効フラグ
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    /**
     * 読み込み済み音声の統計情報を取得
     */
    getLoadingStats() {
        const stats = {
            total: this.loadedSounds.size,
            webaudio: 0,
            html5: 0,
            fallback: 0,
            pending: this.preloadQueue.length
        };
        
        for (const soundData of this.loadedSounds.values()) {
            stats[soundData.type]++;
        }
        
        return stats;
    }
    
    /**
     * 音声キャッシュをクリア
     */
    clearCache() {
        // Web Audio APIのバッファをクリア
        this.audioBuffers.clear();
        
        // HTML5 Audioオブジェクトを解放
        for (const soundData of this.loadedSounds.values()) {
            if (soundData.type === 'html5' && soundData.audio) {
                soundData.audio.src = '';
                soundData.audio.load();
            }
        }
        
        this.loadedSounds.clear();
        this.preloadQueue.length = 0;
        
        console.log('Audio cache cleared');
    }
    
    /**
     * フィードバック音声システムの初期化
     */
    initializeFeedbackSounds() {
        // 効果音の定義
        this.soundEffects = {
            correct: {
                url: `${this.baseUrl}effects/correct.mp3`,
                fallback: 'ding' // Web Audio API合成音のタイプ
            },
            incorrect: {
                url: `${this.baseUrl}effects/incorrect.mp3`,
                fallback: 'buzz'
            },
            celebration: {
                url: `${this.baseUrl}effects/celebration.mp3`,
                fallback: 'chime'
            },
            button: {
                url: `${this.baseUrl}effects/button.mp3`,
                fallback: 'click'
            }
        };
        
        // 励ましメッセージ音声の定義
        this.encouragementAudio = {
            '3-4': {
                correct: [
                    `${this.baseUrl}encouragement/3-4/yattane.mp3`,
                    `${this.baseUrl}encouragement/3-4/sugoi.mp3`,
                    `${this.baseUrl}encouragement/3-4/seikai.mp3`,
                    `${this.baseUrl}encouragement/3-4/eraine.mp3`
                ],
                incorrect: [
                    `${this.baseUrl}encouragement/3-4/daijoubu.mp3`,
                    `${this.baseUrl}encouragement/3-4/ganbatte.mp3`,
                    `${this.baseUrl}encouragement/3-4/tsugi-dekiru.mp3`,
                    `${this.baseUrl}encouragement/3-4/mou-ichido.mp3`
                ]
            },
            '5-6': {
                correct: [
                    `${this.baseUrl}encouragement/5-6/seikai.mp3`,
                    `${this.baseUrl}encouragement/5-6/yoku-dekimashita.mp3`,
                    `${this.baseUrl}encouragement/5-6/subarashii.mp3`,
                    `${this.baseUrl}encouragement/5-6/sono-choushi.mp3`
                ],
                incorrect: [
                    `${this.baseUrl}encouragement/5-6/ganbatte.mp3`,
                    `${this.baseUrl}encouragement/5-6/mou-ichido-chousen.mp3`,
                    `${this.baseUrl}encouragement/5-6/ato-sukoshi.mp3`,
                    `${this.baseUrl}encouragement/5-6/renshuu-sureba.mp3`
                ]
            }
        };
    }
    
    /**
     * 効果音の事前読み込み
     */
    async preloadFeedbackSounds() {
        if (!this.isEnabled) return;
        
        console.log('Preloading feedback sounds...');
        
        const soundsToLoad = [];
        
        // 効果音を読み込みリストに追加
        for (const [type, soundData] of Object.entries(this.soundEffects)) {
            soundsToLoad.push({
                id: `effect_${type}`,
                url: soundData.url,
                type: 'effect',
                fallback: soundData.fallback
            });
        }
        
        // 励ましメッセージ音声を読み込みリストに追加（基本的なもののみ）
        for (const ageGroup of ['3-4', '5-6']) {
            for (const category of ['correct', 'incorrect']) {
                const messages = this.encouragementAudio[ageGroup][category];
                if (messages && messages.length > 0) {
                    // 最初の2つのメッセージのみ事前読み込み
                    for (let i = 0; i < Math.min(2, messages.length); i++) {
                        soundsToLoad.push({
                            id: `encouragement_${ageGroup}_${category}_${i}`,
                            url: messages[i],
                            type: 'encouragement'
                        });
                    }
                }
            }
        }
        
        // 読み込み実行
        for (const soundData of soundsToLoad) {
            try {
                await this.loadSingleSound(soundData);
            } catch (error) {
                console.warn(`Failed to preload feedback sound: ${soundData.id}`, error);
            }
        }
        
        console.log('Feedback sounds preloading completed');
    }
    
    /**
     * フィードバック効果音の再生
     * @param {string} type - 効果音タイプ ('correct', 'incorrect', 'celebration', 'button')
     * @returns {Promise} 再生完了のPromise
     */
    async playFeedbackSound(type) {
        if (!this.isEnabled) return Promise.resolve();
        
        const soundId = `effect_${type}`;
        const soundData = this.loadedSounds.get(soundId);
        
        if (soundData) {
            try {
                if (soundData.type === 'webaudio' && this.audioContext) {
                    return this.playWebAudioSound(soundData.buffer);
                } else if (soundData.type === 'html5' && soundData.audio) {
                    return this.playHtml5Sound(soundData.audio);
                }
            } catch (error) {
                console.warn(`Error playing feedback sound ${type}:`, error);
            }
        }
        
        // フォールバック：Web Audio API合成音
        return this.playSynthesizedSound(type);
    }
    
    /**
     * 励ましメッセージ音声の再生
     * @param {string} ageGroup - 年齢グループ ('3-4' or '5-6')
     * @param {boolean} isCorrect - 正解かどうか
     * @returns {Promise} 再生完了のPromise
     */
    async playEncouragementSound(ageGroup, isCorrect) {
        if (!this.isEnabled) return Promise.resolve();
        
        const category = isCorrect ? 'correct' : 'incorrect';
        const messages = this.encouragementAudio[ageGroup]?.[category];
        
        if (!messages || messages.length === 0) {
            console.warn(`No encouragement messages found for ${ageGroup} ${category}`);
            return Promise.resolve();
        }
        
        // ランダムなメッセージを選択
        const randomIndex = Math.floor(Math.random() * messages.length);
        const messageUrl = messages[randomIndex];
        const soundId = `encouragement_${ageGroup}_${category}_${randomIndex}`;
        
        let soundData = this.loadedSounds.get(soundId);
        
        // 音声が読み込まれていない場合は即座に読み込み
        if (!soundData) {
            try {
                await this.loadSingleSound({
                    id: soundId,
                    url: messageUrl,
                    type: 'encouragement'
                });
                soundData = this.loadedSounds.get(soundId);
            } catch (error) {
                console.warn(`Failed to load encouragement sound: ${soundId}`, error);
                return Promise.resolve();
            }
        }
        
        try {
            if (soundData.type === 'webaudio' && this.audioContext) {
                return this.playWebAudioSound(soundData.buffer);
            } else if (soundData.type === 'html5' && soundData.audio) {
                return this.playHtml5Sound(soundData.audio);
            }
        } catch (error) {
            console.warn(`Error playing encouragement sound: ${soundId}`, error);
        }
        
        return Promise.resolve();
    }
    
    /**
     * Web Audio APIによる合成音の再生（フォールバック）
     * @param {string} type - 音のタイプ
     */
    playSynthesizedSound(type) {
        if (!this.audioContext) return Promise.resolve();
        
        return new Promise((resolve) => {
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                // 音のタイプに応じた周波数とパターンを設定
                let frequency, duration, pattern;
                
                switch (type) {
                    case 'correct':
                        frequency = 523.25; // C5
                        duration = 0.3;
                        pattern = 'ding';
                        break;
                    case 'incorrect':
                        frequency = 220; // A3
                        duration = 0.5;
                        pattern = 'buzz';
                        break;
                    case 'celebration':
                        frequency = 659.25; // E5
                        duration = 0.6;
                        pattern = 'chime';
                        break;
                    case 'button':
                        frequency = 440; // A4
                        duration = 0.1;
                        pattern = 'click';
                        break;
                    default:
                        frequency = 440;
                        duration = 0.2;
                        pattern = 'click';
                }
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                // 音のパターンに応じた波形設定
                if (pattern === 'buzz') {
                    oscillator.type = 'sawtooth';
                } else if (pattern === 'chime') {
                    oscillator.type = 'sine';
                    // チャイム効果：周波数を変化させる
                    oscillator.frequency.exponentialRampToValueAtTime(
                        frequency * 1.5, 
                        this.audioContext.currentTime + duration * 0.5
                    );
                } else {
                    oscillator.type = 'sine';
                }
                
                // 音量エンベロープ
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
                
                oscillator.addEventListener('ended', resolve, { once: true });
            } catch (error) {
                console.warn('Synthesized sound error:', error);
                resolve();
            }
        });
    }
    
    /**
     * 複合フィードバック音声の再生（効果音 + 励ましメッセージ）
     * @param {string} ageGroup - 年齢グループ
     * @param {boolean} isCorrect - 正解かどうか
     * @param {Object} options - 再生オプション
     */
    async playCompleteFeedback(ageGroup, isCorrect, options = {}) {
        const { playEffectSound = true, playEncouragement = true, delay = 300 } = options;
        
        const promises = [];
        
        // 効果音を再生
        if (playEffectSound) {
            const effectType = isCorrect ? 'correct' : 'incorrect';
            promises.push(this.playFeedbackSound(effectType));
        }
        
        // 少し遅れて励ましメッセージを再生
        if (playEncouragement) {
            const encouragementPromise = new Promise(async (resolve) => {
                setTimeout(async () => {
                    await this.playEncouragementSound(ageGroup, isCorrect);
                    resolve();
                }, delay);
            });
            promises.push(encouragementPromise);
        }
        
        return Promise.all(promises);
    }
    
    /**
     * 励ましメッセージのテキストデータを取得
     */
    getEncouragementMessages() {
        return {
            '3-4': {
                correct: ['やったね！', 'すごい！', 'せいかい！', 'えらいね！'],
                incorrect: ['だいじょうぶ！', 'がんばって！', 'つぎはできるよ！', 'もういちど！']
            },
            '5-6': {
                correct: ['正解！', 'よくできました！', 'すばらしい！', 'その調子！'],
                incorrect: ['がんばって！', 'もう一度挑戦！', 'あと少し！', '練習すれば上手になるよ！']
            }
        };
    }
    
    /**
     * AudioManagerを破棄
     */
    destroy() {
        this.clearCache();
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        this.audioContext = null;
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { AudioManager };
} else {
    // ブラウザ環境
    window.AudioManager = AudioManager;
}