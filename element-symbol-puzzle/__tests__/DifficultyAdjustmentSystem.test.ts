/**
 * Unit tests for DifficultyAdjustmentSystem
 * Tests difficulty adjustment logic, persistence, and edge cases
 */

import { DifficultyAdjustmentSystem } from '../DifficultyAdjustmentSystem';

describe('DifficultyAdjustmentSystem', () => {
  let system: DifficultyAdjustmentSystem;

  beforeEach(() => {
    system = new DifficultyAdjustmentSystem();
  });

  describe('adjustDifficulty', () => {
    it('should initialize user with easy difficulty', () => {
      const difficulty = system.getCurrentDifficulty('user1');
      expect(difficulty).toBe('easy');
    });

    it('should increase difficulty from easy to medium when accuracy >= 80%', () => {
      const newDifficulty = system.adjustDifficulty('user1', 85);
      expect(newDifficulty).toBe('medium');
      expect(system.getCurrentDifficulty('user1')).toBe('medium');
    });

    it('should increase difficulty from medium to hard when accuracy >= 80%', () => {
      system.setDifficulty('user1', 'medium');
      const newDifficulty = system.adjustDifficulty('user1', 90);
      expect(newDifficulty).toBe('hard');
      expect(system.getCurrentDifficulty('user1')).toBe('hard');
    });

    it('should stay at hard difficulty when accuracy >= 80% and already at hard', () => {
      system.setDifficulty('user1', 'hard');
      const newDifficulty = system.adjustDifficulty('user1', 95);
      expect(newDifficulty).toBe('hard');
      expect(system.getCurrentDifficulty('user1')).toBe('hard');
    });

    it('should decrease difficulty from hard to medium when accuracy < 50%', () => {
      system.setDifficulty('user1', 'hard');
      const newDifficulty = system.adjustDifficulty('user1', 40);
      expect(newDifficulty).toBe('medium');
      expect(system.getCurrentDifficulty('user1')).toBe('medium');
    });

    it('should decrease difficulty from medium to easy when accuracy < 50%', () => {
      system.setDifficulty('user1', 'medium');
      const newDifficulty = system.adjustDifficulty('user1', 30);
      expect(newDifficulty).toBe('easy');
      expect(system.getCurrentDifficulty('user1')).toBe('easy');
    });

    it('should stay at easy difficulty when accuracy < 50% and already at easy', () => {
      system.setDifficulty('user1', 'easy');
      const newDifficulty = system.adjustDifficulty('user1', 20);
      expect(newDifficulty).toBe('easy');
      expect(system.getCurrentDifficulty('user1')).toBe('easy');
    });

    it('should maintain difficulty when accuracy is between 50% and 80%', () => {
      system.setDifficulty('user1', 'medium');
      const newDifficulty = system.adjustDifficulty('user1', 65);
      expect(newDifficulty).toBe('medium');
      expect(system.getCurrentDifficulty('user1')).toBe('medium');
    });

    it('should handle accuracy at exactly 80% boundary', () => {
      const newDifficulty = system.adjustDifficulty('user1', 80);
      expect(newDifficulty).toBe('medium');
    });

    it('should handle accuracy at exactly 50% boundary', () => {
      system.setDifficulty('user1', 'medium');
      const newDifficulty = system.adjustDifficulty('user1', 50);
      expect(newDifficulty).toBe('medium');
    });

    it('should throw error for invalid userId', () => {
      expect(() => system.adjustDifficulty('', 75)).toThrow('Invalid userId: must not be empty');
      expect(() => system.adjustDifficulty('   ', 75)).toThrow('Invalid userId: must not be empty');
    });

    it('should throw error for invalid accuracy', () => {
      expect(() => system.adjustDifficulty('user1', -1)).toThrow('Invalid accuracy: must be between 0 and 100');
      expect(() => system.adjustDifficulty('user1', 101)).toThrow('Invalid accuracy: must be between 0 and 100');
    });

    it('should handle accuracy at 0%', () => {
      system.setDifficulty('user1', 'hard');
      const newDifficulty = system.adjustDifficulty('user1', 0);
      expect(newDifficulty).toBe('medium');
    });

    it('should handle accuracy at 100%', () => {
      const newDifficulty = system.adjustDifficulty('user1', 100);
      expect(newDifficulty).toBe('medium');
    });
  });

  describe('getCurrentDifficulty', () => {
    it('should return current difficulty for user', () => {
      system.setDifficulty('user1', 'hard');
      expect(system.getCurrentDifficulty('user1')).toBe('hard');
    });

    it('should throw error for invalid userId', () => {
      expect(() => system.getCurrentDifficulty('')).toThrow('Invalid userId: must not be empty');
    });

    it('should initialize new user with easy difficulty', () => {
      expect(system.getCurrentDifficulty('newUser')).toBe('easy');
    });
  });

  describe('getDifficultyProgression', () => {
    it('should return difficulty progression data', () => {
      system.adjustDifficulty('user1', 85);
      const progression = system.getDifficultyProgression('user1');
      expect(progression.userId).toBe('user1');
      expect(progression.currentDifficulty).toBe('medium');
      expect(progression.adjustmentCount).toBe(1);
    });

    it('should track adjustment count', () => {
      system.adjustDifficulty('user1', 85);
      system.adjustDifficulty('user1', 90);
      const progression = system.getDifficultyProgression('user1');
      expect(progression.adjustmentCount).toBe(2);
    });

    it('should throw error for invalid userId', () => {
      expect(() => system.getDifficultyProgression('')).toThrow('Invalid userId: must not be empty');
    });
  });

  describe('setDifficulty', () => {
    it('should set difficulty to easy', () => {
      system.setDifficulty('user1', 'easy');
      expect(system.getCurrentDifficulty('user1')).toBe('easy');
    });

    it('should set difficulty to medium', () => {
      system.setDifficulty('user1', 'medium');
      expect(system.getCurrentDifficulty('user1')).toBe('medium');
    });

    it('should set difficulty to hard', () => {
      system.setDifficulty('user1', 'hard');
      expect(system.getCurrentDifficulty('user1')).toBe('hard');
    });

    it('should throw error for invalid userId', () => {
      expect(() => system.setDifficulty('', 'easy')).toThrow('Invalid userId: must not be empty');
    });

    it('should throw error for invalid difficulty', () => {
      expect(() => system.setDifficulty('user1', 'invalid' as any)).toThrow('Invalid difficulty');
    });

    it('should reset difficulty score when setting difficulty', () => {
      system.adjustDifficulty('user1', 65);
      system.setDifficulty('user1', 'hard');
      const progression = system.getDifficultyProgression('user1');
      expect(progression.difficultyScore).toBe(0);
    });
  });

  describe('saveToLocalStorage and loadFromLocalStorage', () => {
    it('should throw error for invalid userId on save', () => {
      expect(() => system.saveToLocalStorage('')).toThrow('Invalid userId: must not be empty');
    });

    it('should throw error for invalid userId on load', () => {
      expect(() => system.loadFromLocalStorage('')).toThrow('Invalid userId: must not be empty');
    });

    it('should initialize new user when no saved data exists', () => {
      const newSystem = new DifficultyAdjustmentSystem();
      const loaded = newSystem.loadFromLocalStorage('newUser');
      expect(loaded.currentDifficulty).toBe('easy');
      expect(loaded.adjustmentCount).toBe(0);
    });

    it('should not throw error when saving to localStorage', () => {
      system.adjustDifficulty('user1', 85);
      expect(() => system.saveToLocalStorage('user1')).not.toThrow();
    });

    it('should not throw error when loading from localStorage', () => {
      expect(() => system.loadFromLocalStorage('user1')).not.toThrow();
    });
  });

  describe('clearAllDifficulty', () => {
    it('should clear all difficulty data', () => {
      system.adjustDifficulty('user1', 85);
      system.adjustDifficulty('user2', 90);
      system.clearAllDifficulty();

      const newSystem = new DifficultyAdjustmentSystem();
      expect(newSystem.getCurrentDifficulty('user1')).toBe('easy');
      expect(newSystem.getCurrentDifficulty('user2')).toBe('easy');
    });
  });

  describe('getAllDifficulty', () => {
    it('should return all users difficulty levels', () => {
      system.adjustDifficulty('user1', 85);
      system.adjustDifficulty('user2', 40);

      const allDifficulty = system.getAllDifficulty();
      expect(allDifficulty.size).toBe(2);
      expect(allDifficulty.get('user1')?.currentDifficulty).toBe('medium');
      expect(allDifficulty.get('user2')?.currentDifficulty).toBe('easy');
    });
  });

  describe('difficulty progression scenarios', () => {
    it('should handle progression from easy to hard through medium', () => {
      expect(system.getCurrentDifficulty('user1')).toBe('easy');

      system.adjustDifficulty('user1', 85);
      expect(system.getCurrentDifficulty('user1')).toBe('medium');

      system.adjustDifficulty('user1', 90);
      expect(system.getCurrentDifficulty('user1')).toBe('hard');
    });

    it('should handle regression from hard to easy through medium', () => {
      system.setDifficulty('user1', 'hard');

      system.adjustDifficulty('user1', 40);
      expect(system.getCurrentDifficulty('user1')).toBe('medium');

      system.adjustDifficulty('user1', 30);
      expect(system.getCurrentDifficulty('user1')).toBe('easy');
    });

    it('should handle oscillation between difficulties', () => {
      system.adjustDifficulty('user1', 85); // easy -> medium
      expect(system.getCurrentDifficulty('user1')).toBe('medium');

      system.adjustDifficulty('user1', 40); // medium -> easy
      expect(system.getCurrentDifficulty('user1')).toBe('easy');

      system.adjustDifficulty('user1', 85); // easy -> medium
      expect(system.getCurrentDifficulty('user1')).toBe('medium');
    });

    it('should track multiple users independently', () => {
      system.adjustDifficulty('user1', 85);
      system.adjustDifficulty('user2', 40);

      expect(system.getCurrentDifficulty('user1')).toBe('medium');
      expect(system.getCurrentDifficulty('user2')).toBe('easy');

      system.adjustDifficulty('user1', 90);
      expect(system.getCurrentDifficulty('user1')).toBe('hard');
      expect(system.getCurrentDifficulty('user2')).toBe('easy');
    });
  });

  describe('difficulty score tracking', () => {
    it('should update difficulty score when maintaining difficulty', () => {
      system.setDifficulty('user1', 'medium');
      system.adjustDifficulty('user1', 65);

      const progression = system.getDifficultyProgression('user1');
      expect(progression.difficultyScore).toBe(15); // 65 - 50
    });

    it('should reset difficulty score when changing difficulty', () => {
      system.setDifficulty('user1', 'easy');
      system.adjustDifficulty('user1', 65);
      system.adjustDifficulty('user1', 85); // Change to medium

      const progression = system.getDifficultyProgression('user1');
      expect(progression.difficultyScore).toBe(0);
    });

    it('should track last adjustment date', () => {
      const beforeAdjustment = Date.now();
      system.adjustDifficulty('user1', 85);
      const afterAdjustment = Date.now();

      const progression = system.getDifficultyProgression('user1');
      expect(progression.lastAdjustmentDate).toBeGreaterThanOrEqual(beforeAdjustment);
      expect(progression.lastAdjustmentDate).toBeLessThanOrEqual(afterAdjustment);
    });
  });
});
