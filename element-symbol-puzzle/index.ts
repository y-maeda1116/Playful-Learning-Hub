/**
 * Element Symbol Puzzle - Main module exports
 * 
 * This module exports all core types and interfaces for the Element Symbol Puzzle feature.
 * It provides the foundation for game engines, content managers, progress tracking, and UI components.
 */

export type {
  Element,
  ChemicalFormula,
  PeriodicTablePuzzle,
  Answer,
  GameSession,
  JigsawPuzzleSession,
  UserProgress,
  Badge,
  Achievement,
} from './src/data/types';

// Core Systems
export { GameEngine } from './src/core/GameEngine';
export { ProgressTrackingSystem } from './src/core/ProgressTrackingSystem';
export { RewardSystem } from './src/core/RewardSystem';
export { StorageAdapter } from './src/core/StorageAdapter';
export { DifficultyAdjustmentSystem } from './src/core/DifficultyAdjustmentSystem';
export { AudioSystem } from './src/core/AudioSystem';
export type { AudioPlaybackOptions } from './src/core/AudioSystem';

// Managers
export { ElementContentManager } from './src/managers/ElementContentManager';
export { PeriodicTableManager } from './src/managers/PeriodicTableManager';

// UI Components
export {
  MatchingGameUI,
  QuizGameUI,
  ChemicalFormulaPuzzleUI,
  PeriodicTableJigsawUI,
  ProgressTrackingUI,
  FeedbackUI,
  RewardNotificationUI,
} from './src/ui/UIComponents';
export type { UIComponent, SelectionCallback, DragDropCallback } from './src/ui/UIComponents';

// Game Orchestrator
export { GameOrchestrator } from './GameOrchestrator';
export type { GameEvent, GameEventCallback } from './GameOrchestrator';

// Data
export { ELEMENTS, CHEMICAL_FORMULAS } from './src/data/elements';
export {
  BADGES,
  getBadgesByGrade,
  getBadgeById,
  getBadgesByType,
  getBadgeByTypeAndThreshold,
} from './src/data/badges';
