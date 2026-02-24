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
} from './types';

export { ElementContentManager } from './ElementContentManager';
export { GameEngine } from './GameEngine';
export { ProgressTrackingSystem } from './ProgressTrackingSystem';
export { RewardSystem } from './RewardSystem';
export { StorageAdapter } from './StorageAdapter';
export { DifficultyAdjustmentSystem } from './DifficultyAdjustmentSystem';
export { AudioSystem } from './AudioSystem';
export type { AudioPlaybackOptions } from './AudioSystem';
export { PeriodicTableManager } from './PeriodicTableManager';
export { GameOrchestrator } from './GameOrchestrator';
export type { GameEvent, GameEventCallback } from './GameOrchestrator';
export {
  MatchingGameUI,
  QuizGameUI,
  ChemicalFormulaPuzzleUI,
  PeriodicTableJigsawUI,
  ProgressTrackingUI,
  FeedbackUI,
  RewardNotificationUI,
} from './UIComponents';
export type { UIComponent, SelectionCallback, DragDropCallback } from './UIComponents';
export { ELEMENTS, CHEMICAL_FORMULAS } from './elements';
export {
  BADGES,
  getBadgesByGrade,
  getBadgeById,
  getBadgesByType,
  getBadgeByTypeAndThreshold,
} from './badges';
