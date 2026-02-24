"use strict";
/**
 * AudioSystem - Manages audio playback for element pronunciation and game feedback
 * Implements error handling for missing audio and text hint fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioSystem = void 0;
class AudioSystem {
    constructor() {
        this.audioCache = new Map();
        this.currentlyPlaying = null;
        this.isAudioAvailable = true;
        // Check if audio is available in the environment
        this.checkAudioAvailability();
    }
    /**
     * Check if audio playback is available in the current environment
     */
    checkAudioAvailability() {
        try {
            const audio = new Audio();
            this.isAudioAvailable = !!audio;
        }
        catch {
            this.isAudioAvailable = false;
        }
    }
    /**
     * Play audio from the given URL
     * @param audioUrl - The URL of the audio file to play
     * @param options - Optional configuration for playback
     * @returns A promise that resolves when audio starts playing or rejects on error
     */
    async playAudio(audioUrl, options = {}) {
        if (!audioUrl) {
            const error = new Error('Audio URL is required');
            options.onError?.(error);
            throw error;
        }
        if (!this.isAudioAvailable) {
            const error = new Error('Audio playback is not available in this environment');
            options.onError?.(error);
            throw error;
        }
        try {
            // Stop any currently playing audio
            this.stopCurrentAudio();
            // Get or create audio element
            let audio = this.audioCache.get(audioUrl);
            if (!audio) {
                audio = new Audio(audioUrl);
                this.audioCache.set(audioUrl, audio);
            }
            // Set volume if specified
            if (options.volume !== undefined) {
                audio.volume = Math.max(0, Math.min(1, options.volume));
            }
            // Set up event listeners
            const onPlaySuccess = () => {
                options.onSuccess?.();
                audio?.removeEventListener('play', onPlaySuccess);
            };
            const onPlayError = () => {
                const error = new Error(`Failed to play audio: ${audioUrl}`);
                options.onError?.(error);
                audio?.removeEventListener('error', onPlayError);
            };
            audio.addEventListener('play', onPlaySuccess, { once: true });
            audio.addEventListener('error', onPlayError, { once: true });
            // Play the audio
            this.currentlyPlaying = audio;
            await audio.play();
        }
        catch (error) {
            const playError = error instanceof Error ? error : new Error(String(error));
            options.onError?.(playError);
            throw playError;
        }
    }
    /**
     * Stop the currently playing audio
     */
    stopCurrentAudio() {
        if (this.currentlyPlaying) {
            this.currentlyPlaying.pause();
            this.currentlyPlaying.currentTime = 0;
            this.currentlyPlaying = null;
        }
    }
    /**
     * Get a text hint for an element when audio is unavailable
     * @param elementName - The name of the element
     * @param pronunciation - The pronunciation of the element
     * @returns A text hint string
     */
    getTextHint(elementName, pronunciation) {
        if (!elementName || !pronunciation) {
            return 'Audio unavailable';
        }
        return `${elementName} (${pronunciation})`;
    }
    /**
     * Play audio with fallback to text hint
     * @param audioUrl - The URL of the audio file
     * @param elementName - The name of the element (for fallback)
     * @param pronunciation - The pronunciation (for fallback)
     * @param options - Optional configuration
     * @returns An object with audio result and fallback text hint
     */
    async playAudioWithFallback(audioUrl, elementName, pronunciation, options = {}) {
        const hint = this.getTextHint(elementName, pronunciation);
        try {
            await this.playAudio(audioUrl, options);
            return { success: true, hint };
        }
        catch (error) {
            // Audio playback failed, return hint for fallback
            return { success: false, hint };
        }
    }
    /**
     * Check if audio is currently playing
     */
    isPlaying() {
        return this.currentlyPlaying !== null && !this.currentlyPlaying.paused;
    }
    /**
     * Clear the audio cache to free up memory
     */
    clearCache() {
        this.audioCache.forEach((audio) => {
            audio.pause();
            audio.src = '';
        });
        this.audioCache.clear();
        this.currentlyPlaying = null;
    }
    /**
     * Get the current audio availability status
     */
    getAudioAvailability() {
        return this.isAudioAvailable;
    }
}
exports.AudioSystem = AudioSystem;
