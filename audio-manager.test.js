/**
 * 音声管理システムのテスト
 * Tests for AudioManager
 */

const { AudioManager } = require('./audio-manager.js');

describe('AudioManager', () => {
    let audioManager;

    afterEach(() => {
        if (audioManager) {
            audioManager.destroy();
        }
    });

    describe('初期化', () => {
        test('デフォルト設定でインスタンスが作成される', () => {
            audioManager = new AudioManager();

            expect(audioManager.isEnabled).toBe(true);
            expect(audioManager.volume).toBe(0.7);
            expect(audioManager.baseUrl).toBe('sounds/');
            expect(audioManager.audioBuffers).toBeDefined();
            expect(audioManager.loadedSounds).toBeDefined();
        });

        test('カスタム設定でインスタンスが作成される', () => {
            audioManager = new AudioManager({
                enabled: false,
                volume: 0.5,
                baseUrl: 'custom-audio/',
            });

            expect(audioManager.isEnabled).toBe(false);
            expect(audioManager.volume).toBe(0.5);
            expect(audioManager.baseUrl).toBe('custom-audio/');
        });

        test('enabled: false で無効化される', () => {
            audioManager = new AudioManager({ enabled: false });

            expect(audioManager.isEnabled).toBe(false);
        });
    });

    describe('音量設定', () => {
        beforeEach(() => {
            audioManager = new AudioManager();
        });

        test('音量が正しく設定される', () => {
            audioManager.setVolume(0.3);
            expect(audioManager.volume).toBe(0.3);
        });

        test('音量の上限は1.0', () => {
            audioManager.setVolume(2.0);
            expect(audioManager.volume).toBe(1);
        });

        test('音量の下限は0.0', () => {
            audioManager.setVolume(-0.5);
            expect(audioManager.volume).toBe(0);
        });

        test('境界値1.0が正しく設定される', () => {
            audioManager.setVolume(1.0);
            expect(audioManager.volume).toBe(1);
        });

        test('境界値0.0が正しく設定される', () => {
            audioManager.setVolume(0.0);
            expect(audioManager.volume).toBe(0);
        });
    });

    describe('有効/無効切り替え', () => {
        beforeEach(() => {
            audioManager = new AudioManager();
        });

        test('setEnabled(false) で無効化される', () => {
            audioManager.setEnabled(false);
            expect(audioManager.isEnabled).toBe(false);
        });

        test('setEnabled(true) で有効化される', () => {
            audioManager.setEnabled(false);
            audioManager.setEnabled(true);
            expect(audioManager.isEnabled).toBe(true);
        });
    });

    describe('音声URL取得', () => {
        beforeEach(() => {
            audioManager = new AudioManager();
        });

        test('文字データのaudioFileが優先される', () => {
            const character = {
                id: 'あ',
                type: 'hiragana',
                romaji: 'a',
                audioFile: 'custom/path/a.mp3',
            };

            expect(audioManager.getAudioUrl(character)).toBe('custom/path/a.mp3');
        });

        test('audioFile未定義時はデフォルトパスが使用される', () => {
            const character = {
                id: 'あ',
                type: 'hiragana',
                romaji: 'a',
            };

            expect(audioManager.getAudioUrl(character)).toBe('sounds/hiragana/a.mp3');
        });

        test('カタカナのURLが正しく生成される', () => {
            const character = {
                id: 'ア',
                type: 'katakana',
                romaji: 'a',
            };

            expect(audioManager.getAudioUrl(character)).toBe('sounds/katakana/a.mp3');
        });

        test('カスタムbaseUrlが反映される', () => {
            const customManager = new AudioManager({ baseUrl: 'audio/' });
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };

            expect(customManager.getAudioUrl(character)).toBe('audio/hiragana/a.mp3');
            customManager.destroy();
        });
    });

    describe('フィードバック音声設定', () => {
        beforeEach(() => {
            audioManager = new AudioManager();
        });

        test('効果音が正しく定義されている', () => {
            expect(audioManager.soundEffects).toBeDefined();
            expect(audioManager.soundEffects.correct).toBeDefined();
            expect(audioManager.soundEffects.incorrect).toBeDefined();
            expect(audioManager.soundEffects.celebration).toBeDefined();
            expect(audioManager.soundEffects.button).toBeDefined();
        });

        test('励ましメッセージが正しく定義されている', () => {
            expect(audioManager.encouragementMessages).toBeDefined();
            expect(audioManager.encouragementMessages['3-4']).toBeDefined();
            expect(audioManager.encouragementMessages['5-6']).toBeDefined();
            expect(audioManager.encouragementMessages['3-4'].correct.length).toBeGreaterThan(0);
            expect(audioManager.encouragementMessages['3-4'].incorrect.length).toBeGreaterThan(0);
        });

        test('励まし音声のURLが正しく生成される', () => {
            expect(audioManager.encouragementAudio).toBeDefined();
            expect(audioManager.encouragementAudio['3-4'].correct.length).toBeGreaterThan(0);
            expect(audioManager.encouragementAudio['5-6'].incorrect.length).toBeGreaterThan(0);
        });
    });

    describe('読み込み統計', () => {
        beforeEach(() => {
            audioManager = new AudioManager();
        });

        test('初期状態の統計が正しい', () => {
            const stats = audioManager.getLoadingStats();

            expect(stats.total).toBe(0);
            expect(stats.webaudio).toBe(0);
            expect(stats.html5).toBe(0);
            expect(stats.fallback).toBe(0);
            expect(stats.pending).toBe(0);
        });

        test('読み込み後の統計が反映される', () => {
            audioManager.loadedSounds.set('あ', { type: 'webaudio', buffer: {}, url: 'test.mp3' });
            audioManager.loadedSounds.set('い', { type: 'fallback', error: 'test', url: 'test2.mp3' });

            const stats = audioManager.getLoadingStats();

            expect(stats.total).toBe(2);
            expect(stats.webaudio).toBe(1);
            expect(stats.fallback).toBe(1);
        });
    });

    describe('キャッシュクリア', () => {
        beforeEach(() => {
            audioManager = new AudioManager();
        });

        test('キャッシュクリアで全データが削除される', () => {
            audioManager.loadedSounds.set('あ', { type: 'webaudio', buffer: {} });
            audioManager.loadedSounds.set('い', { type: 'html5', audio: { src: '', load: vi.fn() } });
            audioManager.preloadQueue.push({ id: 'test' });

            audioManager.clearCache();

            expect(audioManager.loadedSounds.size).toBe(0);
            expect(audioManager.audioBuffers.size).toBe(0);
            expect(audioManager.preloadQueue.length).toBe(0);
        });
    });

    describe('音声無効時の動作', () => {
        beforeEach(() => {
            audioManager = new AudioManager({ enabled: false });
        });

        test('preloadCharacterSounds は何もしない', async () => {
            const characters = [{ id: 'あ', type: 'hiragana', romaji: 'a' }];

            await audioManager.preloadCharacterSounds(characters);

            expect(audioManager.loadedSounds.size).toBe(0);
        });

        test('playCharacterSound は即座に解決される', async () => {
            const character = { id: 'あ', type: 'hiragana', romaji: 'a' };

            const result = await audioManager.playCharacterSound(character);

            expect(result).toBeUndefined();
        });

        test('playFeedbackSound は即座に解決される', async () => {
            const result = await audioManager.playFeedbackSound('correct');

            expect(result).toBeUndefined();
        });

        test('playEncouragementSound は即座に解決される', async () => {
            const result = await audioManager.playEncouragementSound('3-4', true);

            expect(result).toBeUndefined();
        });
    });

    describe('preloadCharacterSounds', () => {
        beforeEach(() => {
            audioManager = new AudioManager();
        });

        test('既に読み込み済みの文字はスキップされる', async () => {
            audioManager.loadedSounds.set('あ', { type: 'webaudio', buffer: {} });

            await audioManager.preloadCharacterSounds([
                { id: 'あ', type: 'hiragana', romaji: 'a' },
            ]);

            // 読み込みキューに追加されない
            expect(audioManager.preloadQueue.length).toBe(0);
        });
    });

    describe('破棄', () => {
        test('destroy が正常に完了する', () => {
            audioManager = new AudioManager();
            audioManager.loadedSounds.set('あ', { type: 'webaudio', buffer: {} });

            audioManager.destroy();

            expect(audioManager.loadedSounds.size).toBe(0);
            // audioContext は jsdom では null の場合がある
        });
    });
});
