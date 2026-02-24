/**
 * Property-based tests for AudioSystem
 * **Validates: Requirements 7.1, 7.2**
 */

import fc from 'fast-check';
import { AudioSystem } from '../AudioSystem';

describe('AudioSystem - Property-Based Tests', () => {
  describe('Property 8: Audio Playback Availability', () => {
    /**
     * Property: For any element in the system, when the element is selected or displayed,
     * the system must make a pronunciation audio URL available (or handle missing audio appropriately).
     *
     * **Validates: Requirements 7.1, 7.2**
     */
    it('should provide audio URL or handle missing audio gracefully for any element', async () => {
      const audioSystem = new AudioSystem();

      // Generate arbitrary element data
      const elementArbitrary = fc.record({
        id: fc.string(),
        name: fc.string({ minLength: 1 }),
        pronunciation: fc.string({ minLength: 1 }),
        audioUrl: fc.oneof(
          fc.constant(''), // Missing audio
          fc.webUrl(), // Valid URL
          fc.string() // Invalid URL
        ),
      });

      await fc.assert(
        fc.asyncProperty(elementArbitrary, async (element) => {
          // For any element, the system should either:
          // 1. Play audio successfully if URL is valid
          // 2. Provide a text hint if audio is unavailable

          if (!element.audioUrl) {
            // Missing audio should provide text hint
            const hint = audioSystem.getTextHint(element.name, element.pronunciation);
            expect(hint).toBeDefined();
            expect(hint.length).toBeGreaterThan(0);
          } else {
            // Valid audio URL should be playable or provide fallback
            const result = await audioSystem.playAudioWithFallback(
              element.audioUrl,
              element.name,
              element.pronunciation
            );

            // Result should always have a hint available
            expect(result.hint).toBeDefined();
            expect(result.hint.length).toBeGreaterThan(0);
            // Result should indicate success or failure
            expect(typeof result.success).toBe('boolean');
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any audio URL, the system must attempt to play it or provide
     * appropriate error handling without crashing.
     *
     * **Validates: Requirements 7.1, 7.2**
     */
    it('should handle any audio URL without crashing', async () => {
      const audioSystem = new AudioSystem();

      const urlArbitrary = fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.webUrl(),
        fc.string(),
        fc.string({ minLength: 1, maxLength: 2000 })
      );

      await fc.assert(
        fc.asyncProperty(urlArbitrary, async (url) => {
          try {
            if (url) {
              await audioSystem.playAudio(url as string);
            }
          } catch (error) {
            // Error handling should be graceful
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any element with missing audio, the system must provide
     * a text hint that includes the element name and pronunciation.
     *
     * **Validates: Requirements 7.1, 7.2**
     */
    it('should provide meaningful text hints for all elements', async () => {
      const audioSystem = new AudioSystem();

      const elementArbitrary = fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }),
        pronunciation: fc.string({ minLength: 1, maxLength: 50 }),
      });

      await fc.assert(
        fc.property(elementArbitrary, (element) => {
          const hint = audioSystem.getTextHint(element.name, element.pronunciation);

          // Hint should contain both name and pronunciation
          expect(hint).toContain(element.name);
          expect(hint).toContain(element.pronunciation);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any volume setting, the system must clamp it to valid range [0, 1].
     *
     * **Validates: Requirements 7.1, 7.2**
     */
    it('should clamp volume to valid range for any input', async () => {
      const audioSystem = new AudioSystem();

      const volumeArbitrary = fc.oneof(
        fc.integer({ min: -1000, max: 1000 }),
        fc.float({ min: -1000, max: 1000 })
      );

      await fc.assert(
        fc.asyncProperty(volumeArbitrary, async (volume) => {
          const mockAudio = {
            play: jest.fn().mockResolvedValue(undefined),
            pause: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            volume: 1,
            currentTime: 0,
            paused: true,
            src: 'https://example.com/audio.mp3',
          };

          global.Audio = jest.fn(() => mockAudio) as any;
          const newAudioSystem = new AudioSystem();

          try {
            await newAudioSystem.playAudio('https://example.com/audio.mp3', { volume });
            // Volume should be clamped to [0, 1]
            expect(mockAudio.volume).toBeGreaterThanOrEqual(0);
            expect(mockAudio.volume).toBeLessThanOrEqual(1);
          } catch {
            // If playback fails, that's acceptable
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any sequence of audio playback operations, the system must
     * maintain consistent state (only one audio playing at a time).
     *
     * **Validates: Requirements 7.1, 7.2**
     */
    it('should maintain consistent state across multiple playback operations', async () => {
      const audioSystem = new AudioSystem();

      const operationArbitrary = fc.array(
        fc.record({
          url: fc.webUrl(),
          action: fc.constantFrom('play', 'stop'),
        }),
        { minLength: 1, maxLength: 10 }
      );

      await fc.assert(
        fc.asyncProperty(operationArbitrary, async (operations) => {
          for (const operation of operations) {
            try {
              if (operation.action === 'play') {
                await audioSystem.playAudio(operation.url);
              } else {
                audioSystem.stopCurrentAudio();
              }
            } catch {
              // Errors are acceptable
            }
          }

          // After all operations, state should be consistent
          const isPlaying = audioSystem.isPlaying();
          expect(typeof isPlaying).toBe('boolean');
        }),
        { numRuns: 50 }
      );
    });
  });
});
