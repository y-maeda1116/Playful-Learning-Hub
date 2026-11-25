/**
 * Unit tests for RewardSystem - achievements
 * Split from RewardSystem.test.ts (issue #37). Test code moved unedited.
 */


import { RewardSystem } from '../../src/core/RewardSystem';
import { ProgressTrackingSystem } from '../../src/core/ProgressTrackingSystem';
import { GameSession, Answer } from '../../src/data/types';
import { BADGES } from '../../src/data/badges';
describe('RewardSystem', () => {
  let rewardSystem: RewardSystem;
  let progressTrackingSystem: ProgressTrackingSystem;

  beforeEach(() => {
    progressTrackingSystem = new ProgressTrackingSystem();
    rewardSystem = new RewardSystem(progressTrackingSystem);
  });

  describe('getAchievements', () => {
    it('should return empty array for user with no achievements', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements).toEqual([]);
    });

    it('should return all achievements for a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements.length).toBe(2);
      expect(achievements[0].badgeId).toBe('elements-15');
      expect(achievements[1].badgeId).toBe('accuracy-70');
    });

    it('should record achievement unlock date', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const beforeTime = Date.now();
      rewardSystem.awardBadge(userId, 'elements-15');
      const afterTime = Date.now();

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements[0].unlockedDate).toBeGreaterThanOrEqual(beforeTime);
      expect(achievements[0].unlockedDate).toBeLessThanOrEqual(afterTime);
    });

    it('should throw error for invalid userId', () => {
      expect(() => rewardSystem.getAchievements('')).toThrow('Invalid userId');
      expect(() => rewardSystem.getAchievements('   ')).toThrow('Invalid userId');
    });
  });

});
