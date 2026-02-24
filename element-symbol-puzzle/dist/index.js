"use strict";
/**
 * Element Symbol Puzzle - Main module exports
 *
 * This module exports all core types and interfaces for the Element Symbol Puzzle feature.
 * It provides the foundation for game engines, content managers, progress tracking, and UI components.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBadgeByTypeAndThreshold = exports.getBadgesByType = exports.getBadgeById = exports.getBadgesByGrade = exports.BADGES = exports.CHEMICAL_FORMULAS = exports.ELEMENTS = exports.RewardNotificationUI = exports.FeedbackUI = exports.ProgressTrackingUI = exports.PeriodicTableJigsawUI = exports.ChemicalFormulaPuzzleUI = exports.QuizGameUI = exports.MatchingGameUI = exports.GameOrchestrator = exports.PeriodicTableManager = exports.AudioSystem = exports.DifficultyAdjustmentSystem = exports.StorageAdapter = exports.RewardSystem = exports.ProgressTrackingSystem = exports.GameEngine = exports.ElementContentManager = void 0;
var ElementContentManager_1 = require("./ElementContentManager");
Object.defineProperty(exports, "ElementContentManager", { enumerable: true, get: function () { return ElementContentManager_1.ElementContentManager; } });
var GameEngine_1 = require("./GameEngine");
Object.defineProperty(exports, "GameEngine", { enumerable: true, get: function () { return GameEngine_1.GameEngine; } });
var ProgressTrackingSystem_1 = require("./ProgressTrackingSystem");
Object.defineProperty(exports, "ProgressTrackingSystem", { enumerable: true, get: function () { return ProgressTrackingSystem_1.ProgressTrackingSystem; } });
var RewardSystem_1 = require("./RewardSystem");
Object.defineProperty(exports, "RewardSystem", { enumerable: true, get: function () { return RewardSystem_1.RewardSystem; } });
var StorageAdapter_1 = require("./StorageAdapter");
Object.defineProperty(exports, "StorageAdapter", { enumerable: true, get: function () { return StorageAdapter_1.StorageAdapter; } });
var DifficultyAdjustmentSystem_1 = require("./DifficultyAdjustmentSystem");
Object.defineProperty(exports, "DifficultyAdjustmentSystem", { enumerable: true, get: function () { return DifficultyAdjustmentSystem_1.DifficultyAdjustmentSystem; } });
var AudioSystem_1 = require("./AudioSystem");
Object.defineProperty(exports, "AudioSystem", { enumerable: true, get: function () { return AudioSystem_1.AudioSystem; } });
var PeriodicTableManager_1 = require("./PeriodicTableManager");
Object.defineProperty(exports, "PeriodicTableManager", { enumerable: true, get: function () { return PeriodicTableManager_1.PeriodicTableManager; } });
var GameOrchestrator_1 = require("./GameOrchestrator");
Object.defineProperty(exports, "GameOrchestrator", { enumerable: true, get: function () { return GameOrchestrator_1.GameOrchestrator; } });
var UIComponents_1 = require("./UIComponents");
Object.defineProperty(exports, "MatchingGameUI", { enumerable: true, get: function () { return UIComponents_1.MatchingGameUI; } });
Object.defineProperty(exports, "QuizGameUI", { enumerable: true, get: function () { return UIComponents_1.QuizGameUI; } });
Object.defineProperty(exports, "ChemicalFormulaPuzzleUI", { enumerable: true, get: function () { return UIComponents_1.ChemicalFormulaPuzzleUI; } });
Object.defineProperty(exports, "PeriodicTableJigsawUI", { enumerable: true, get: function () { return UIComponents_1.PeriodicTableJigsawUI; } });
Object.defineProperty(exports, "ProgressTrackingUI", { enumerable: true, get: function () { return UIComponents_1.ProgressTrackingUI; } });
Object.defineProperty(exports, "FeedbackUI", { enumerable: true, get: function () { return UIComponents_1.FeedbackUI; } });
Object.defineProperty(exports, "RewardNotificationUI", { enumerable: true, get: function () { return UIComponents_1.RewardNotificationUI; } });
var elements_1 = require("./elements");
Object.defineProperty(exports, "ELEMENTS", { enumerable: true, get: function () { return elements_1.ELEMENTS; } });
Object.defineProperty(exports, "CHEMICAL_FORMULAS", { enumerable: true, get: function () { return elements_1.CHEMICAL_FORMULAS; } });
var badges_1 = require("./badges");
Object.defineProperty(exports, "BADGES", { enumerable: true, get: function () { return badges_1.BADGES; } });
Object.defineProperty(exports, "getBadgesByGrade", { enumerable: true, get: function () { return badges_1.getBadgesByGrade; } });
Object.defineProperty(exports, "getBadgeById", { enumerable: true, get: function () { return badges_1.getBadgeById; } });
Object.defineProperty(exports, "getBadgesByType", { enumerable: true, get: function () { return badges_1.getBadgesByType; } });
Object.defineProperty(exports, "getBadgeByTypeAndThreshold", { enumerable: true, get: function () { return badges_1.getBadgeByTypeAndThreshold; } });
