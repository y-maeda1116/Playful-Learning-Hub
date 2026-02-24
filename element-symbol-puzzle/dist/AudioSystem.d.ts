/**
 * AudioSystem - Manages audio playback for element pronunciation and game feedback
 * Implements error handling for missing audio and text hint fallback
 */
export interface AudioPlaybackOptions {
    volume?: number;
    onError?: (error: Error) => void;
    onSuccess?: () => void;
}
export declare class AudioSystem {
    private audioCache;
    private currentlyPlaying;
    private isAudioAvailable;
    constructor();
    /**
     * Check if audio playback is available in the current environment
     */
    private checkAudioAvailability;
    /**
     * Play audio from the given URL
     * @param audioUrl - The URL of the audio file to play
     * @param options - Optional configuration for playback
     * @returns A promise that resolves when audio starts playing or rejects on error
     */
    playAudio(audioUrl: string, options?: AudioPlaybackOptions): Promise<void>;
    /**
     * Stop the currently playing audio
     */
    stopCurrentAudio(): void;
    /**
     * Get a text hint for an element when audio is unavailable
     * @param elementName - The name of the element
     * @param pronunciation - The pronunciation of the element
     * @returns A text hint string
     */
    getTextHint(elementName: string, pronunciation: string): string;
    /**
     * Play audio with fallback to text hint
     * @param audioUrl - The URL of the audio file
     * @param elementName - The name of the element (for fallback)
     * @param pronunciation - The pronunciation (for fallback)
     * @param options - Optional configuration
     * @returns An object with audio result and fallback text hint
     */
    playAudioWithFallback(audioUrl: string, elementName: string, pronunciation: string, options?: AudioPlaybackOptions): Promise<{
        success: boolean;
        hint: string;
    }>;
    /**
     * Check if audio is currently playing
     */
    isPlaying(): boolean;
    /**
     * Clear the audio cache to free up memory
     */
    clearCache(): void;
    /**
     * Get the current audio availability status
     */
    getAudioAvailability(): boolean;
}
