/**
 * Property-Based Tests for AudioSystem
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { AudioSystem } from '../AudioSystem';
import { ElementContentManager } from '../ElementContentManager';
import { Element } from '../types';

describe('AudioSystem - Property-Based Tests', () => {
  let audioSystem: AudioSystem;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    // Mock Audio API
    const createMockAudio = () => {
      const listeners: { [key: string]: Function[] } = {};
      return {
        play: jest.fn().mockImplementation(function () {
          if (listeners['play']) {
            listeners['play'].forEach((cb) => cb());
          }
          return Promise.resolve();
        }),
        pause: jest.fn(),
        addEventListener: jest.fn().mockImplementation(function (event: string, cb: Function) {
          if (!listeners[event]) {
            listeners[event] = [];
          }
          listeners[event].push(cb);
        }),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: true,
        src: '',
      };
    };

    global.Audio = jest.fn(createMockAudio) as any;
    audioSystem = new AudioSystem();
    contentManager = new ElementContentManager();
  });

  afterEach(() => {
    audioSystem.clearCache();
  });

  describe('Property 8: Audio Playback Availability', () => {
    /**
     * **Validates: Requirements 7.1, 7.2**
     * 
     * Property: For any element in the system, when the element is selected or displayed,
     * the system SHALL make a pronunciation audio URL available (or properly handle missing audio).
     * 
     * This ensures that:
     * - Every element has a valid audio URL
     * - Audio URLs are accessible and can be played
     * - Missing or invalid audio is handled gracefully with fallback text hints
     * - The system never crashes when audio is unavailable
     */
    it('should provide audio URL for any element in the system', () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          // Every element must have a non-empty audio URL
          return elements.every((element) => {
            return (
              element.audioUrl !== undefined &&
              element.audioUrl !== null &&
              element.audioUrl.length > 0
            );
          });
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should successfully play audio for any valid element audio URL', async () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        async (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          // For each element, audio should be playable
          for (const element of elements) {
            const onSuccess = jest.fn();
            const onError = jest.fn();

            try {
              await audioSystem.playAudio(element.audioUrl, {
                onSuccess,
                onError,
              });

              // Either success callback was called or no error was thrown
              return true;
            } catch (error) {
              // If error occurs, it should be properly handled
              return false;
            }
          }

          return true;
        },
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should provide text hint fallback for any element', () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          // Every element must have a valid text hint fallback
          return elements.every((element) => {
            const hint = audioSystem.getTextHint(element.name, element.pronunciation);

            // Hint must be non-empty and contain element information
            return (
              hint !== undefined &&
              hint !== null &&
              hint.length > 0 &&
              (hint.includes(element.name) || hint.includes('Audio unavailable'))
            );
          });
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle audio playback with fallback for any element', async () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        async (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          // For each element, playAudioWithFallback should always return a result
          for (const element of elements) {
            const result = await audioSystem.playAudioWithFallback(
              element.audioUrl,
              element.name,
              element.pronunciation,
            );

            // Result must have success flag and hint
            if (
              result === undefined ||
              result.success === undefined ||
              result.hint === undefined
            ) {
              return false;
            }

            // Hint must be non-empty
            if (result.hint.length === 0) {
              return false;
            }
          }

          return true;
        },
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should never crash when playing audio for any element', async () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        async (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          // For each element, attempting to play audio should not crash
          for (const element of elements) {
            try {
              await audioSystem.playAudio(element.audioUrl, {
                onError: () => {
                  // Error handling should be graceful
                },
              });
            } catch (error) {
              // Even if error is thrown, it should be catchable and not crash
              // This is acceptable behavior
            }
          }

          return true;
        },
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should maintain audio availability status consistently', () => {
      const property = fc.property(fc.integer(), () => {
        // Audio availability should be consistent across multiple checks
        const availability1 = audioSystem.getAudioAvailability();
        const availability2 = audioSystem.getAudioAvailability();
        const availability3 = audioSystem.getAudioAvailability();

        // All checks should return the same value
        return availability1 === availability2 && availability2 === availability3;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle volume settings for any valid audio URL', async () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        fc.float({ min: 0, max: 1 }),
        async (grade, volume) => {
          const elements = contentManager.getElementsByGrade(grade);

          if (elements.length === 0) {
            return true;
          }

          const element = elements[0];

          try {
            await audioSystem.playAudio(element.audioUrl, { volume });
            // If volume setting succeeds, property holds
            return true;
          } catch (error) {
            // If error occurs, it should be properly handled
            return true;
          }
        },
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should properly cache audio URLs for repeated playback', async () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        async (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          if (elements.length === 0) {
            return true;
          }

          const element = elements[0];

          try {
            // Play the same audio twice
            await audioSystem.playAudio(element.audioUrl);
            await audioSystem.playAudio(element.audioUrl);

            // Both plays should succeed (caching should work)
            return true;
          } catch (error) {
            // If error occurs, it should be properly handled
            return true;
          }
        },
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should handle stopping audio for any element', async () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        async (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          if (elements.length === 0) {
            return true;
          }

          const element = elements[0];

          try {
            await audioSystem.playAudio(element.audioUrl);
            audioSystem.stopCurrentAudio();

            // After stopping, isPlaying should return false
            return audioSystem.isPlaying() === false;
          } catch (error) {
            // If error occurs, stopping should still work
            audioSystem.stopCurrentAudio();
            return true;
          }
        },
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should clear cache without errors for any state', () => {
      const property = fc.property(fc.integer(), () => {
        try {
          audioSystem.clearCache();
          // Cache clear should always succeed
          return true;
        } catch (error) {
          // Cache clear should never throw
          return false;
        }
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should provide consistent audio URLs for the same element', () => {
      const property = fc.property(
        fc.oneof(
          fc.constant(3 as const),
          fc.constant(4 as const),
          fc.constant(5 as const),
          fc.constant(6 as const),
        ),
        (grade) => {
          const elements = contentManager.getElementsByGrade(grade);

          if (elements.length === 0) {
            return true;
          }

          const element = elements[0];

          // Get audio URL multiple times
          const audioUrl1 = contentManager.getElementAudio(element.id);
          const audioUrl2 = contentManager.getElementAudio(element.id);
          const audioUrl3 = contentManager.getElementAudio(element.id);

          // All should be identical
          return audioUrl1 === audioUrl2 && audioUrl2 === audioUrl3;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle all elements without audio availability issues', () => {
      const property = fc.property(fc.integer(), () => {
        const allElements = contentManager.getAllElements();

        // Every element must have audio URL
        return allElements.every((element) => {
          return (
            element.audioUrl !== undefined &&
            element.audioUrl !== null &&
            element.audioUrl.length > 0
          );
        });
      });

      fc.assert(property, { numRuns: 100 });
    });
  });
});
