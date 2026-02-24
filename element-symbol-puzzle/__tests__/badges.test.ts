/**
 * Unit tests for badge definitions and criteria
 * Tests badge structure, retrieval, and filtering functionality
 */

import {
  BADGES,
  getBadgesByGrade,
  getBadgeById,
  getBadgesByType,
  getBadgeByTypeAndThreshold,
} from '../badges';
import { Badge } from '../types';

describe('Badge Definitions', () => {
  describe('BADGES object structure', () => {
    it('should have all required badge categories', () => {
      const badgeIds = Object.keys(BADGES);
      expect(badgeIds.length).toBeGreaterThan(0);

      // Check for elements-learned badges
      expect(BADGES.ELEMENTS_15).toBeDefined();
      expect(BADGES.ELEMENTS_25).toBeDefined();
      expect(BADGES.ELEMENTS_30).toBeDefined();

      // Check for accuracy badges
      expect(BADGES.ACCURACY_70).toBeDefined();
      expect(BADGES.ACCURACY_80).toBeDefined();
      expect(BADGES.ACCURACY_90).toBeDefined();

      // Check for streak badges
      expect(BADGES.STREAK_3).toBeDefined();
      expect(BADGES.STREAK_7).toBeDefined();
      expect(BADGES.STREAK_30).toBeDefined();

      // Check for formula mastery badge
      expect(BADGES.FORMULA_MASTERY).toBeDefined();
    });

    it('should have valid badge structure for all badges', () => {
      Object.values(BADGES).forEach((badge: Badge) => {
        expect(badge.id).toBeDefined();
        expect(typeof badge.id).toBe('string');
        expect(badge.name).toBeDefined();
        expect(typeof badge.name).toBe('string');
        expect(badge.description).toBeDefined();
        expect(typeof badge.description).toBe('string');
        expect(badge.icon).toBeDefined();
        expect(typeof badge.icon).toBe('string');
        expect(badge.criteria).toBeDefined();
        expect(badge.criteria.type).toBeDefined();
        expect(badge.criteria.threshold).toBeDefined();
        expect(typeof badge.criteria.threshold).toBe('number');
        expect(badge.gradeLevel).toBeDefined();
        expect([3, 4, 5, 6]).toContain(badge.gradeLevel);
      });
    });

    it('should have unique badge IDs', () => {
      const ids = Object.values(BADGES).map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Elements Learned Badges', () => {
    it('should have correct thresholds for elements-learned badges', () => {
      expect(BADGES.ELEMENTS_15.criteria.threshold).toBe(15);
      expect(BADGES.ELEMENTS_25.criteria.threshold).toBe(25);
      expect(BADGES.ELEMENTS_30.criteria.threshold).toBe(30);
    });

    it('should have correct grade levels for elements-learned badges', () => {
      expect(BADGES.ELEMENTS_15.gradeLevel).toBe(3);
      expect(BADGES.ELEMENTS_25.gradeLevel).toBe(5);
      expect(BADGES.ELEMENTS_30.gradeLevel).toBe(6);
    });

    it('should have correct criteria type for elements-learned badges', () => {
      expect(BADGES.ELEMENTS_15.criteria.type).toBe('elements-learned');
      expect(BADGES.ELEMENTS_25.criteria.type).toBe('elements-learned');
      expect(BADGES.ELEMENTS_30.criteria.type).toBe('elements-learned');
    });
  });

  describe('Accuracy Milestone Badges', () => {
    it('should have correct thresholds for accuracy badges', () => {
      expect(BADGES.ACCURACY_70.criteria.threshold).toBe(70);
      expect(BADGES.ACCURACY_80.criteria.threshold).toBe(80);
      expect(BADGES.ACCURACY_90.criteria.threshold).toBe(90);
    });

    it('should have correct grade levels for accuracy badges', () => {
      expect(BADGES.ACCURACY_70.gradeLevel).toBe(3);
      expect(BADGES.ACCURACY_80.gradeLevel).toBe(4);
      expect(BADGES.ACCURACY_90.gradeLevel).toBe(5);
    });

    it('should have correct criteria type for accuracy badges', () => {
      expect(BADGES.ACCURACY_70.criteria.type).toBe('accuracy');
      expect(BADGES.ACCURACY_80.criteria.type).toBe('accuracy');
      expect(BADGES.ACCURACY_90.criteria.type).toBe('accuracy');
    });
  });

  describe('Consecutive Learning Days Badges', () => {
    it('should have correct thresholds for streak badges', () => {
      expect(BADGES.STREAK_3.criteria.threshold).toBe(3);
      expect(BADGES.STREAK_7.criteria.threshold).toBe(7);
      expect(BADGES.STREAK_30.criteria.threshold).toBe(30);
    });

    it('should have correct grade levels for streak badges', () => {
      expect(BADGES.STREAK_3.gradeLevel).toBe(3);
      expect(BADGES.STREAK_7.gradeLevel).toBe(4);
      expect(BADGES.STREAK_30.gradeLevel).toBe(6);
    });

    it('should have correct criteria type for streak badges', () => {
      expect(BADGES.STREAK_3.criteria.type).toBe('streak');
      expect(BADGES.STREAK_7.criteria.type).toBe('streak');
      expect(BADGES.STREAK_30.criteria.type).toBe('streak');
    });
  });

  describe('Chemical Formula Mastery Badge', () => {
    it('should have correct structure for formula mastery badge', () => {
      expect(BADGES.FORMULA_MASTERY.id).toBe('formula-mastery');
      expect(BADGES.FORMULA_MASTERY.criteria.type).toBe('formula-mastery');
      expect(BADGES.FORMULA_MASTERY.criteria.threshold).toBe(1);
      expect(BADGES.FORMULA_MASTERY.gradeLevel).toBe(6);
    });
  });

  describe('getBadgesByGrade', () => {
    it('should return badges for grade 3', () => {
      const badges = getBadgesByGrade(3);
      expect(badges.length).toBeGreaterThan(0);
      expect(badges.every((b) => b.gradeLevel <= 3)).toBe(true);
    });

    it('should return badges for grade 4', () => {
      const badges = getBadgesByGrade(4);
      expect(badges.length).toBeGreaterThan(0);
      expect(badges.every((b) => b.gradeLevel <= 4)).toBe(true);
    });

    it('should return badges for grade 5', () => {
      const badges = getBadgesByGrade(5);
      expect(badges.length).toBeGreaterThan(0);
      expect(badges.every((b) => b.gradeLevel <= 5)).toBe(true);
    });

    it('should return all badges for grade 6', () => {
      const badges = getBadgesByGrade(6);
      expect(badges.length).toBe(Object.values(BADGES).length);
    });

    it('should return more badges for higher grades', () => {
      const grade3 = getBadgesByGrade(3);
      const grade4 = getBadgesByGrade(4);
      const grade5 = getBadgesByGrade(5);
      const grade6 = getBadgesByGrade(6);

      expect(grade3.length).toBeLessThanOrEqual(grade4.length);
      expect(grade4.length).toBeLessThanOrEqual(grade5.length);
      expect(grade5.length).toBeLessThanOrEqual(grade6.length);
    });
  });

  describe('getBadgeById', () => {
    it('should return badge by ID', () => {
      const badge = getBadgeById('elements-15');
      expect(badge).toBeDefined();
      expect(badge?.id).toBe('elements-15');
    });

    it('should return badge by uppercase key', () => {
      const badge = getBadgeById('ELEMENTS_15');
      expect(badge).toBeDefined();
      expect(badge?.id).toBe('elements-15');
    });

    it('should return undefined for non-existent badge', () => {
      const badge = getBadgeById('non-existent-badge');
      expect(badge).toBeUndefined();
    });

    it('should find all badges by their IDs', () => {
      Object.values(BADGES).forEach((badge) => {
        const found = getBadgeById(badge.id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(badge.id);
      });
    });
  });

  describe('getBadgesByType', () => {
    it('should return all elements-learned badges', () => {
      const badges = getBadgesByType('elements-learned');
      expect(badges.length).toBe(3);
      expect(badges.every((b) => b.criteria.type === 'elements-learned')).toBe(true);
    });

    it('should return all accuracy badges', () => {
      const badges = getBadgesByType('accuracy');
      expect(badges.length).toBe(3);
      expect(badges.every((b) => b.criteria.type === 'accuracy')).toBe(true);
    });

    it('should return all streak badges', () => {
      const badges = getBadgesByType('streak');
      expect(badges.length).toBe(3);
      expect(badges.every((b) => b.criteria.type === 'streak')).toBe(true);
    });

    it('should return formula-mastery badge', () => {
      const badges = getBadgesByType('formula-mastery');
      expect(badges.length).toBe(1);
      expect(badges[0].id).toBe('formula-mastery');
    });

    it('should return empty array for jigsaw-completed type', () => {
      const badges = getBadgesByType('jigsaw-completed');
      expect(badges.length).toBe(0);
    });
  });

  describe('getBadgeByTypeAndThreshold', () => {
    it('should return badge by type and threshold', () => {
      const badge = getBadgeByTypeAndThreshold('elements-learned', 15);
      expect(badge).toBeDefined();
      expect(badge?.id).toBe('elements-15');
    });

    it('should return accuracy badge by threshold', () => {
      const badge = getBadgeByTypeAndThreshold('accuracy', 80);
      expect(badge).toBeDefined();
      expect(badge?.id).toBe('accuracy-80');
    });

    it('should return streak badge by threshold', () => {
      const badge = getBadgeByTypeAndThreshold('streak', 7);
      expect(badge).toBeDefined();
      expect(badge?.id).toBe('streak-7');
    });

    it('should return formula mastery badge', () => {
      const badge = getBadgeByTypeAndThreshold('formula-mastery', 1);
      expect(badge).toBeDefined();
      expect(badge?.id).toBe('formula-mastery');
    });

    it('should return undefined for non-existent threshold', () => {
      const badge = getBadgeByTypeAndThreshold('elements-learned', 999);
      expect(badge).toBeUndefined();
    });

    it('should return undefined for non-existent type', () => {
      const badge = getBadgeByTypeAndThreshold('jigsaw-completed', 1);
      expect(badge).toBeUndefined();
    });
  });

  describe('Badge criteria consistency', () => {
    it('should have increasing thresholds for elements-learned badges', () => {
      const badges = getBadgesByType('elements-learned').sort((a, b) => a.criteria.threshold - b.criteria.threshold);
      expect(badges[0].criteria.threshold).toBe(15);
      expect(badges[1].criteria.threshold).toBe(25);
      expect(badges[2].criteria.threshold).toBe(30);
    });

    it('should have increasing thresholds for accuracy badges', () => {
      const badges = getBadgesByType('accuracy').sort((a, b) => a.criteria.threshold - b.criteria.threshold);
      expect(badges[0].criteria.threshold).toBe(70);
      expect(badges[1].criteria.threshold).toBe(80);
      expect(badges[2].criteria.threshold).toBe(90);
    });

    it('should have increasing thresholds for streak badges', () => {
      const badges = getBadgesByType('streak').sort((a, b) => a.criteria.threshold - b.criteria.threshold);
      expect(badges[0].criteria.threshold).toBe(3);
      expect(badges[1].criteria.threshold).toBe(7);
      expect(badges[2].criteria.threshold).toBe(30);
    });
  });
});
