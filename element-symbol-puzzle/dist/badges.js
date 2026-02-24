"use strict";
/**
 * Badge definitions and criteria for the Element Symbol Puzzle reward system
 * Defines badges for elements learned, accuracy milestones, consecutive learning days, and formula mastery
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BADGES = void 0;
exports.getBadgesByGrade = getBadgesByGrade;
exports.getBadgeById = getBadgeById;
exports.getBadgesByType = getBadgesByType;
exports.getBadgeByTypeAndThreshold = getBadgeByTypeAndThreshold;
/**
 * Badge definitions for the Element Symbol Puzzle system
 * Organized by category: elements-learned, accuracy, streak, and formula-mastery
 */
exports.BADGES = {
    // Elements Learned Badges
    ELEMENTS_15: {
        id: 'elements-15',
        name: '元素マスター15',
        description: '15個の元素を習得しました',
        icon: '🧪',
        criteria: {
            type: 'elements-learned',
            threshold: 15,
        },
        gradeLevel: 3,
    },
    ELEMENTS_25: {
        id: 'elements-25',
        name: '元素マスター25',
        description: '25個の元素を習得しました',
        icon: '🔬',
        criteria: {
            type: 'elements-learned',
            threshold: 25,
        },
        gradeLevel: 5,
    },
    ELEMENTS_30: {
        id: 'elements-30',
        name: '元素マスター30',
        description: '全30個の元素を習得しました',
        icon: '⭐',
        criteria: {
            type: 'elements-learned',
            threshold: 30,
        },
        gradeLevel: 6,
    },
    // Accuracy Milestone Badges
    ACCURACY_70: {
        id: 'accuracy-70',
        name: '正答率70%達成',
        description: '正答率が70%に達しました',
        icon: '📈',
        criteria: {
            type: 'accuracy',
            threshold: 70,
        },
        gradeLevel: 3,
    },
    ACCURACY_80: {
        id: 'accuracy-80',
        name: '正答率80%達成',
        description: '正答率が80%に達しました',
        icon: '📊',
        criteria: {
            type: 'accuracy',
            threshold: 80,
        },
        gradeLevel: 4,
    },
    ACCURACY_90: {
        id: 'accuracy-90',
        name: '正答率90%達成',
        description: '正答率が90%に達しました',
        icon: '🏆',
        criteria: {
            type: 'accuracy',
            threshold: 90,
        },
        gradeLevel: 5,
    },
    // Consecutive Learning Days Badges
    STREAK_3: {
        id: 'streak-3',
        name: '3日連続学習',
        description: '3日間連続で学習しました',
        icon: '🔥',
        criteria: {
            type: 'streak',
            threshold: 3,
        },
        gradeLevel: 3,
    },
    STREAK_7: {
        id: 'streak-7',
        name: '1週間連続学習',
        description: '7日間連続で学習しました',
        icon: '💪',
        criteria: {
            type: 'streak',
            threshold: 7,
        },
        gradeLevel: 4,
    },
    STREAK_30: {
        id: 'streak-30',
        name: '1ヶ月連続学習',
        description: '30日間連続で学習しました',
        icon: '👑',
        criteria: {
            type: 'streak',
            threshold: 30,
        },
        gradeLevel: 6,
    },
    // Chemical Formula Mastery Badge
    FORMULA_MASTERY: {
        id: 'formula-mastery',
        name: '化学式マスター',
        description: '化学式パズルをすべて完成させました',
        icon: '⚗️',
        criteria: {
            type: 'formula-mastery',
            threshold: 1,
        },
        gradeLevel: 6,
    },
};
/**
 * Get all badges for a specific grade level
 * @param gradeLevel - The grade level (3, 4, 5, or 6)
 * @returns Array of badges available for that grade level
 */
function getBadgesByGrade(gradeLevel) {
    return Object.values(exports.BADGES).filter((badge) => badge.gradeLevel <= gradeLevel);
}
/**
 * Get a badge by its ID
 * @param badgeId - The badge ID
 * @returns The badge object or undefined if not found
 */
function getBadgeById(badgeId) {
    return exports.BADGES[badgeId.toUpperCase().replace(/-/g, '_')] || Object.values(exports.BADGES).find((b) => b.id === badgeId);
}
/**
 * Get all badges of a specific type
 * @param type - The badge criteria type
 * @returns Array of badges matching the type
 */
function getBadgesByType(type) {
    return Object.values(exports.BADGES).filter((badge) => badge.criteria.type === type);
}
/**
 * Get the threshold value for a specific badge type
 * @param type - The badge criteria type
 * @param threshold - The threshold value to match
 * @returns The badge object or undefined if not found
 */
function getBadgeByTypeAndThreshold(type, threshold) {
    return Object.values(exports.BADGES).find((badge) => badge.criteria.type === type && badge.criteria.threshold === threshold);
}
