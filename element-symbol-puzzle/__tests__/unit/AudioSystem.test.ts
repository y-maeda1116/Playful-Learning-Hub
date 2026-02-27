/**
 * Unit tests for AudioSystem
 * Tests audio playback, error handling, and text hint fallback
 */

import { AudioSystem } from '../../src/core/AudioSystem';

describe('AudioSystem', () => {
  let audioSystem: AudioSystem;

  beforeEach(() => {
    // Mock Audio API BEFORE creating AudioSystem
    const createMockAudio = () => {
      const listeners: { [key: string]: Function[] } = {};
      return {
        play: jest.fn().mockImplementation(function () {
          // Call 'play' event listeners
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
  });

  afterEach(() => {
    audioSystem.clearCache();
  });

  describe('playAudio', () => {
    it('should play audio successfully with valid URL', async () => {
      const audioUrl = 'https://example.com/audio/hydrogen.mp3';
      const onSuccess = jest.fn();

      await audioSystem.playAudio(audioUrl, { onSuccess });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should throw error when audio URL is empty', async () => {
      const onError = jest.fn();

      await expect(audioSystem.playAudio('', { onError })).rejects.toThrow(
        'Audio URL is required'
      );
      expect(onError).toHaveBeenCalled();
    });

    it('should throw error when audio URL is null', async () => {
      const onError = jest.fn();

      await expect(audioSystem.playAudio(null as any, { onError })).rejects.toThrow(
        'Audio URL is required'
      );
      expect(onError).toHaveBeenCalled();
    });

    it('should set volume when specified', async () => {
      const audioUrl = 'https://example.com/audio/oxygen.mp3';
      const mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: true,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await audioSystem.playAudio(audioUrl, { volume: 0.5 });

      expect(mockAudio.volume).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', async () => {
      const audioUrl = 'https://example.com/audio/carbon.mp3';
      const mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: true,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await audioSystem.playAudio(audioUrl, { volume: 1.5 });
      expect(mockAudio.volume).toBe(1);

      await audioSystem.playAudio(audioUrl, { volume: -0.5 });
      expect(mockAudio.volume).toBe(0);
    });

    it('should stop previous audio before playing new audio', async () => {
      const audioUrl1 = 'https://example.com/audio/hydrogen.mp3';
      const audioUrl2 = 'https://example.com/audio/oxygen.mp3';

      const createMockAudio = (url: string, paused: boolean) => {
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
          paused,
          src: url,
        };
      };

      let callCount = 0;
      global.Audio = jest.fn(() => {
        callCount++;
        return callCount === 1 ? createMockAudio(audioUrl1, false) : createMockAudio(audioUrl2, true);
      }) as any;

      const newAudioSystem = new AudioSystem();

      await newAudioSystem.playAudio(audioUrl1);
      const firstAudioElement = (global.Audio as jest.Mock).mock.results[1].value;

      await newAudioSystem.playAudio(audioUrl2);

      expect(firstAudioElement.pause).toHaveBeenCalled();
    });

    it('should cache audio elements for reuse', async () => {
      const audioUrl = 'https://example.com/audio/nitrogen.mp3';
      
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
          src: audioUrl,
        };
      };

      const mockAudio = createMockAudio();
      let audioCreationCount = 0;
      global.Audio = jest.fn(() => {
        audioCreationCount++;
        // Return the same mock for all calls (simulating cache behavior)
        return mockAudio;
      }) as any;

      const newAudioSystem = new AudioSystem();
      // Reset count after constructor (which creates one Audio for availability check)
      audioCreationCount = 0;

      await newAudioSystem.playAudio(audioUrl);
      await newAudioSystem.playAudio(audioUrl);

      // Audio should only be created once due to caching (not counting constructor check)
      expect(audioCreationCount).toBe(1);
    });
  });

  describe('stopCurrentAudio', () => {
    it('should stop currently playing audio', async () => {
      const audioUrl = 'https://example.com/audio/sulfur.mp3';
      const mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: false,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await audioSystem.playAudio(audioUrl);
      audioSystem.stopCurrentAudio();

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
    });

    it('should handle stopping when no audio is playing', () => {
      expect(() => audioSystem.stopCurrentAudio()).not.toThrow();
    });
  });

  describe('getTextHint', () => {
    it('should return formatted text hint with element name and pronunciation', () => {
      const hint = audioSystem.getTextHint('Hydrogen', 'suiso');
      expect(hint).toBe('Hydrogen (suiso)');
    });

    it('should return default message when element name is missing', () => {
      const hint = audioSystem.getTextHint('', 'suiso');
      expect(hint).toBe('Audio unavailable');
    });

    it('should return default message when pronunciation is missing', () => {
      const hint = audioSystem.getTextHint('Hydrogen', '');
      expect(hint).toBe('Audio unavailable');
    });

    it('should return default message when both are missing', () => {
      const hint = audioSystem.getTextHint('', '');
      expect(hint).toBe('Audio unavailable');
    });
  });

  describe('playAudioWithFallback', () => {
    it('should return success and hint when audio plays successfully', async () => {
      const audioUrl = 'https://example.com/audio/phosphorus.mp3';
      const elementName = 'Phosphorus';
      const pronunciation = 'rinsan';

      const result = await audioSystem.playAudioWithFallback(
        audioUrl,
        elementName,
        pronunciation
      );

      expect(result.success).toBe(true);
      expect(result.hint).toBe('Phosphorus (rinsan)');
    });

    it('should return failure and hint when audio playback fails', async () => {
      const audioUrl = 'https://example.com/audio/invalid.mp3';
      const elementName = 'Calcium';
      const pronunciation = 'karushiumu';

      const mockAudio = {
        play: jest.fn().mockRejectedValue(new Error('Network error')),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: true,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      const result = await audioSystem.playAudioWithFallback(
        audioUrl,
        elementName,
        pronunciation
      );

      expect(result.success).toBe(false);
      expect(result.hint).toBe('Calcium (karushiumu)');
    });

    it('should call onError callback when audio fails', async () => {
      const audioUrl = 'https://example.com/audio/invalid.mp3';
      const elementName = 'Iron';
      const pronunciation = 'tetsu';
      const onError = jest.fn();

      const mockAudio = {
        play: jest.fn().mockRejectedValue(new Error('Network error')),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: true,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await audioSystem.playAudioWithFallback(audioUrl, elementName, pronunciation, {
        onError,
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('isPlaying', () => {
    it('should return true when audio is playing', async () => {
      const audioUrl = 'https://example.com/audio/copper.mp3';
      const mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: false,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await audioSystem.playAudio(audioUrl);
      expect(audioSystem.isPlaying()).toBe(true);
    });

    it('should return false when no audio is playing', () => {
      expect(audioSystem.isPlaying()).toBe(false);
    });

    it('should return false after stopping audio', async () => {
      const audioUrl = 'https://example.com/audio/zinc.mp3';
      const mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: false,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await audioSystem.playAudio(audioUrl);
      audioSystem.stopCurrentAudio();

      expect(audioSystem.isPlaying()).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached audio elements', async () => {
      const audioUrl1 = 'https://example.com/audio/chlorine.mp3';
      const audioUrl2 = 'https://example.com/audio/sodium.mp3';

      const createMockAudio = (url: string) => {
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
          src: url,
        };
      };

      const mockAudio1 = createMockAudio(audioUrl1);
      const mockAudio2 = createMockAudio(audioUrl2);
      const availabilityCheckMock = createMockAudio('');
      const mocks = [availabilityCheckMock, mockAudio1, mockAudio2];

      let callCount = 0;
      global.Audio = jest.fn(() => {
        const mock = mocks[callCount];
        callCount++;
        return mock;
      }) as any;

      const newAudioSystem = new AudioSystem();

      await newAudioSystem.playAudio(audioUrl1);
      await newAudioSystem.playAudio(audioUrl2);

      newAudioSystem.clearCache();

      expect(mockAudio1.pause).toHaveBeenCalled();
      expect(mockAudio2.pause).toHaveBeenCalled();
    });

    it('should reset current playing audio after cache clear', async () => {
      const audioUrl = 'https://example.com/audio/potassium.mp3';
      const mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: false,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await audioSystem.playAudio(audioUrl);
      audioSystem.clearCache();

      expect(audioSystem.isPlaying()).toBe(false);
    });
  });

  describe('getAudioAvailability', () => {
    it('should return true when audio is available', () => {
      expect(audioSystem.getAudioAvailability()).toBe(true);
    });

    it('should return false when audio creation fails', () => {
      global.Audio = jest.fn(() => {
        throw new Error('Audio not supported');
      }) as any;

      const newAudioSystem = new AudioSystem();
      expect(newAudioSystem.getAudioAvailability()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle audio playback errors gracefully', async () => {
      const audioUrl = 'https://example.com/audio/invalid.mp3';
      const onError = jest.fn();

      const mockAudio = {
        play: jest.fn().mockRejectedValue(new Error('Playback failed')),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: true,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await expect(audioSystem.playAudio(audioUrl, { onError })).rejects.toThrow();
      expect(onError).toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      const audioUrl = 'https://example.com/audio/invalid.mp3';
      const onError = jest.fn();

      const mockAudio = {
        play: jest.fn().mockRejectedValue('String error'),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        volume: 1,
        currentTime: 0,
        paused: true,
        src: audioUrl,
      };

      global.Audio = jest.fn(() => mockAudio) as any;
      audioSystem = new AudioSystem();

      await expect(audioSystem.playAudio(audioUrl, { onError })).rejects.toThrow();
      expect(onError).toHaveBeenCalled();
    });
  });
});
