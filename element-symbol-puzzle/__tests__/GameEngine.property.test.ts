/**
 * Property-Based Tests for GameEngine - Element Matching Accuracy
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { GameEngine } from '../GameEngine';
import { ElementContentManager } from '../ElementContentManager';

describe('GameEngine - Property-Based Tests', () => {
  let engine: GameEngine;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    engine = new GameEngine();
    contentManager = new ElementContentManager();
  });

  describe('Property 1: Element Matching Accuracy', () => {
    /**
     * **Validates: Requirements 1.2, 1.3**
     * 
     * Property: For any element in the game database and any matching game session,
     * if a user correctly matches an element symbol to its name, the system SHALL
     * record the answer as correct and increase the score.
     * 
     * This ensures that:
     * - Correct answers are recorded as correct
     * - Correct answers increase the score
     * - Incorrect answers are recorded as incorrect
     * - Incorrect answers do not increase the score
     * - The score calculation is consistent
     */
    it('should record correct answers as correct and increase score', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        // Start a new session for this grade
        const session = engine.startSession('matching', grade);
        const initialScore = session.score;

        // Get the first element to answer
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true; // Skip if no elements available
        }

        // Submit the correct answer (element name)
        const answer = engine.submitAnswer(session.sessionId, currentElement.name);

        // Verify the answer is recorded as correct
        if (!answer.correct) {
          return false;
        }

        // Verify the score increased
        const updatedSession = engine.getSession(session.sessionId);
        if (updatedSession.score <= initialScore) {
          return false;
        }

        // Verify the correct count increased
        if (updatedSession.correctCount !== 1) {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should record incorrect answers as incorrect and not increase score', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        // Start a new session for this grade
        const session = engine.startSession('matching', grade);
        const initialScore = session.score;

        // Get the first element to answer
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true; // Skip if no elements available
        }

        // Submit an incorrect answer (a different element name)
        const allElements = contentManager.getAllElements();
        const differentElement = allElements.find((e) => e.id !== currentElement.id);
        if (!differentElement) {
          return true; // Skip if no different element available
        }

        const answer = engine.submitAnswer(session.sessionId, differentElement.name);

        // Verify the answer is recorded as incorrect
        if (answer.correct) {
          return false;
        }

        // Verify the score did not increase
        const updatedSession = engine.getSession(session.sessionId);
        if (updatedSession.score !== initialScore) {
          return false;
        }

        // Verify the correct count did not increase
        if (updatedSession.correctCount !== 0) {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should maintain consistent score across multiple answers', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(
        gradeArbitrary,
        fc.integer({ min: 0, max: 3 }), // Number of correct answers to submit
        (grade, numCorrect) => {
          const session = engine.startSession('matching', grade);
          let expectedScore = 0;
          let expectedCorrectCount = 0;

          // Submit answers
          for (let i = 0; i < numCorrect && i < session.elements.length; i++) {
            const currentElement = engine.getNextQuestion(session.sessionId);
            if (!currentElement) break;

            const answer = engine.submitAnswer(session.sessionId, currentElement.name);
            if (answer.correct) {
              expectedScore += 10;
              expectedCorrectCount++;
            }
          }

          const finalSession = engine.getSession(session.sessionId);

          // Verify score matches expected
          if (finalSession.score !== expectedScore) {
            return false;
          }

          // Verify correct count matches expected
          if (finalSession.correctCount !== expectedCorrectCount) {
            return false;
          }

          return true;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle case-insensitive matching', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startSession('matching', grade);
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true;
        }

        // Submit answer with different case
        const answer = engine.submitAnswer(session.sessionId, currentElement.name.toUpperCase());

        // Should still be correct (case-insensitive)
        return answer.correct;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle whitespace-trimmed matching', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startSession('matching', grade);
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true;
        }

        // Submit answer with extra whitespace
        const answer = engine.submitAnswer(session.sessionId, `  ${currentElement.name}  `);

        // Should still be correct (whitespace trimmed)
        return answer.correct;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should track all answers in session history', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(
        gradeArbitrary,
        fc.integer({ min: 1, max: 3 }),
        (grade, numAnswers) => {
          const session = engine.startSession('matching', grade);
          const answersSubmitted = [];

          for (let i = 0; i < numAnswers && i < session.elements.length; i++) {
            const currentElement = engine.getNextQuestion(session.sessionId);
            if (!currentElement) break;

            const answer = engine.submitAnswer(session.sessionId, currentElement.name);
            answersSubmitted.push(answer);
          }

          const finalSession = engine.getSession(session.sessionId);

          // Verify all answers are tracked
          if (finalSession.answers.length !== answersSubmitted.length) {
            return false;
          }

          // Verify each answer matches
          for (let i = 0; i < answersSubmitted.length; i++) {
            if (finalSession.answers[i].elementId !== answersSubmitted[i].elementId) {
              return false;
            }
            if (finalSession.answers[i].correct !== answersSubmitted[i].correct) {
              return false;
            }
          }

          return true;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should only accept answers for valid elements in session', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(3 as const),
        fc.constant(4 as const),
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startSession('matching', grade);
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true;
        }

        // The submitted answer should reference an element in the session
        const answer = engine.submitAnswer(session.sessionId, currentElement.name);

        // Verify the answer references the current element
        if (answer.elementId !== currentElement.id) {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });
  });
});
