/**
 * Unit tests for RewardSystem - badge awarding and unlocking
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

  describe('awardBadge', () => {
    it('should award a badge to a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');

      const unlockedBadges = rewardSystem.getUnlockedBadges(userId);
      expect(unlockedBadges.some((b) => b.id === 'elements-15')).toBe(true);
    });

    it('should not award the same badge twice', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'elements-15');

      const unlockedBadges = rewardSystem.getUnlockedBadges(userId);
      const count = unlockedBadges.filter((b) => b.id === 'elements-15').length;
      expect(count).toBe(1);
    });

    it('should throw error for invalid userId', () => {
      expect(() => rewardSystem.awardBadge('', 'elements-15')).toThrow('Invalid userId');
      expect(() => rewardSystem.awardBadge('   ', 'elements-15')).toThrow('Invalid userId');
    });

    it('should throw error for invalid badgeId', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      expect(() => rewardSystem.awardBadge(userId, '')).toThrow('Invalid badgeId');
      expect(() => rewardSystem.awardBadge(userId, '   ')).toThrow('Invalid badgeId');
    });

    it('should throw error for non-existent badge', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      expect(() => rewardSystem.awardBadge(userId, 'non-existent-badge')).toThrow('Badge non-existent-badge not found');
    });
  });

  describe('getUnlockedBadges', () => {
    it('should return empty array for user with no badges', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges).toEqual([]);
    });

    it('should return all unlocked badges for a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(3);
      expect(badges.some((b) => b.id === 'elements-15')).toBe(true);
      expect(badges.some((b) => b.id === 'accuracy-70')).toBe(true);
      expect(badges.some((b) => b.id === 'streak-3')).toBe(true);
    });

    it('should throw error for invalid userId', () => {
      expect(() => rewardSystem.getUnlockedBadges('')).toThrow('Invalid userId');
      expect(() => rewardSystem.getUnlockedBadges('   ')).toThrow('Invalid userId');
    });

    it('should throw error for non-existent user', () => {
      expect(() => rewardSystem.getUnlockedBadges('non-existent-user')).toThrow('User non-existent-user not found');
    });
  });

  describe('Badge Awarding and Tracking', () => {
    it('should track multiple badges awarded to a user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(3);
      expect(badges.map((b) => b.id)).toEqual(
        expect.arrayContaining(['elements-15', 'accuracy-70', 'streak-3'])
      );
    });

    it('should maintain badge order when awarding multiple badges', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements.length).toBe(3);
      expect(achievements[0].badgeId).toBe('elements-15');
      expect(achievements[1].badgeId).toBe('accuracy-70');
      expect(achievements[2].badgeId).toBe('streak-3');
    });

    it('should record achievement metadata correctly', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      const beforeTime = Date.now();
      rewardSystem.awardBadge(userId, 'elements-15');
      const afterTime = Date.now();

      const achievements = rewardSystem.getAchievements(userId);
      expect(achievements[0].userId).toBe(userId);
      expect(achievements[0].badgeId).toBe('elements-15');
      expect(achievements[0].unlockedDate).toBeGreaterThanOrEqual(beforeTime);
      expect(achievements[0].unlockedDate).toBeLessThanOrEqual(afterTime);
      expect(achievements[0].displayNotification).toBe(true);
    });

    it('should prevent duplicate badge awards', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'elements-15');

      const badges = rewardSystem.getUnlockedBadges(userId);
      const count = badges.filter((b) => b.id === 'elements-15').length;
      expect(count).toBe(1);
    });

    it('should track all badge types independently', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award one badge of each type
      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');
      rewardSystem.awardBadge(userId, 'formula-mastery');

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(4);

      const badgeIds = badges.map((b) => b.id);
      expect(badgeIds).toContain('elements-15');
      expect(badgeIds).toContain('accuracy-70');
      expect(badgeIds).toContain('streak-3');
      expect(badgeIds).toContain('formula-mastery');
    });
  });

  describe('Multiple Badge Scenarios', () => {
    it('should handle user earning multiple badges in single session', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 3);

      // Create session with high accuracy and many correct answers
      const answers: Answer[] = [];
      for (let i = 0; i < 15; i++) {
        answers.push({
          elementId: `element${i}`,
          userAnswer: `answer${i}`,
          correct: true,
          responseTime: 1000,
          timestamp: Date.now(),
        });
      }

      const session: GameSession = {
        sessionId: 'session1',
        gameType: 'matching',
        gradeLevel: 3,
        difficulty: 'easy',
        startTime: Date.now() - 5000,
        elements: [],
        currentIndex: 0,
        score: 100,
        answers,
        correctCount: 15,
        totalCount: 15,
      };

      progressTrackingSystem.updateProgress(userId, session);
      progressTrackingSystem.updateProgress(userId, session);

      const newBadges = rewardSystem.checkBadgeCriteria(userId, session);

      // Should have earned multiple badges
      expect(newBadges.length).toBeGreaterThan(0);
    });

    it('should handle progressive badge unlocking', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award elements badges progressively
      rewardSystem.awardBadge(userId, 'elements-15');
      let badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(1);

      rewardSystem.awardBadge(userId, 'elements-25');
      badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(2);

      rewardSystem.awardBadge(userId, 'elements-30');
      badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(3);
    });

    it('should handle mixed badge types for same user', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award badges of different types
      rewardSystem.awardBadge(userId, 'elements-15');
      rewardSystem.awardBadge(userId, 'accuracy-70');
      rewardSystem.awardBadge(userId, 'streak-3');
      rewardSystem.awardBadge(userId, 'formula-mastery');

      const badges = rewardSystem.getUnlockedBadges(userId);
      const badgeTypes = new Set(badges.map((b) => b.criteria.type));

      expect(badgeTypes.has('elements-learned')).toBe(true);
      expect(badgeTypes.has('accuracy')).toBe(true);
      expect(badgeTypes.has('streak')).toBe(true);
      expect(badgeTypes.has('formula-mastery')).toBe(true);
    });

    it('should handle multiple users with different badge sets', () => {
      const user1 = 'user1';
      const user2 = 'user2';
      const user3 = 'user3';

      progressTrackingSystem.loadFromLocalStorage(user1, 3);
      progressTrackingSystem.loadFromLocalStorage(user2, 4);
      progressTrackingSystem.loadFromLocalStorage(user3, 6);

      // Award different badges to each user
      rewardSystem.awardBadge(user1, 'elements-15');
      rewardSystem.awardBadge(user1, 'accuracy-70');

      rewardSystem.awardBadge(user2, 'accuracy-80');
      rewardSystem.awardBadge(user2, 'streak-3');

      rewardSystem.awardBadge(user3, 'elements-30');
      rewardSystem.awardBadge(user3, 'accuracy-90');
      rewardSystem.awardBadge(user3, 'formula-mastery');

      const user1Badges = rewardSystem.getUnlockedBadges(user1);
      const user2Badges = rewardSystem.getUnlockedBadges(user2);
      const user3Badges = rewardSystem.getUnlockedBadges(user3);

      expect(user1Badges.length).toBe(2);
      expect(user2Badges.length).toBe(2);
      expect(user3Badges.length).toBe(3);
    });

    it('should handle all badge types in single scenario', () => {
      const userId = 'user1';
      progressTrackingSystem.loadFromLocalStorage(userId, 6);

      // Award all available badge types
      const allBadgeIds = [
        'elements-15',
        'elements-25',
        'elements-30',
        'accuracy-70',
        'accuracy-80',
        'accuracy-90',
        'streak-3',
        'streak-7',
        'streak-30',
        'formula-mastery',
      ];

      for (const badgeId of allBadgeIds) {
        rewardSystem.awardBadge(userId, badgeId);
      }

      const badges = rewardSystem.getUnlockedBadges(userId);
      expect(badges.length).toBe(allBadgeIds.length);

      const awardedIds = badges.map((b) => b.id);
      for (const badgeId of allBadgeIds) {
        expect(awardedIds).toContain(badgeId);
      }
    });
  });

});
