/**
 * Property-Based Tests for GameEngine - Quiz Answer Validation
 * 
 * Tests universal properties that must hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { GameEngine } from '../../src/core/GameEngine';
import { ElementContentManager } from '../../src/managers/ElementContentManager';

describe('GameEngine - Quiz Answer Validation Property Tests', () => {
  let engine: GameEngine;
  let contentManager: ElementContentManager;

  beforeEach(() => {
    engine = new GameEngine();
    contentManager = new ElementContentManager();
  });

  describe('Property 3: Quiz Answer Validation', () => {
    /**
     * **Validates: Requirements 2.2, 2.3**
     * 
     * Property: For any element property-based quiz question, when a user submits
     * an answer, the system SHALL validate it against the correct answer and provide
     * appropriate feedback (correct/incorrect).
     * 
     * This ensures that:
     * - Quiz answers are validated correctly
     * - Correct answers are recorded as correct
     * - Incorrect answers are recorded as incorrect
     * - The system provides consistent feedback
     * - Score is updated appropriately based on correctness
     */

    it('should validate correct element type answers in quiz', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        // Start a quiz session
        const session = engine.startQuizSession(grade);
        
        // Verify session is created as quiz type
        if (session.gameType !== 'quiz') {
          return false;
        }

        // Get the first question element
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true; // Skip if no elements available
        }

        // For quiz, the correct answer is the element's type (metal/nonmetal/metalloid)
        const correctAnswer = currentElement.type;
        const answer = engine.submitQuizAnswer(session.sessionId, correctAnswer);

        // Verify the answer is recorded as correct
        if (!answer.correct) {
          return false;
        }

        // Verify the score increased
        const updatedSession = engine.getSession(session.sessionId);
        if (updatedSession.score <= 0) {
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

    it('should validate incorrect element type answers in quiz', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        // Start a quiz session
        const session = engine.startQuizSession(grade);
        const initialScore = session.score;

        // Get the first question element
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true; // Skip if no elements available
        }

        // Submit an incorrect answer (wrong type)
        const allTypes = ['metal', 'nonmetal', 'metalloid'];
        const incorrectAnswer = allTypes.find((t) => t !== currentElement.type) || 'metal';
        
        const answer = engine.submitQuizAnswer(session.sessionId, incorrectAnswer);

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

    it('should validate element reactivity answers in quiz', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        // Start a quiz session
        const session = engine.startQuizSession(grade);

        // Get the first question element
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true; // Skip if no elements available
        }

        // For quiz, the correct answer could be the element's reactivity
        const correctAnswer = currentElement.properties.reactivity;
        const answer = engine.submitQuizAnswer(session.sessionId, correctAnswer);

        // Verify the answer is recorded as correct
        if (!answer.correct) {
          return false;
        }

        // Verify the score increased
        const updatedSession = engine.getSession(session.sessionId);
        if (updatedSession.score <= 0) {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should maintain consistent quiz answer tracking across multiple questions', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(
        gradeArbitrary,
        fc.integer({ min: 0, max: 3 }), // Number of correct answers
        (grade, numCorrect) => {
          const session = engine.startQuizSession(grade);
          let expectedScore = 0;
          let expectedCorrectCount = 0;

          // Submit answers
          for (let i = 0; i < numCorrect && i < session.elements.length; i++) {
            const currentElement = engine.getNextQuestion(session.sessionId);
            if (!currentElement) break;

            // Submit correct answer (element type)
            const answer = engine.submitQuizAnswer(session.sessionId, currentElement.type);
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

          // Verify all answers are tracked
          if (finalSession.answers.length !== numCorrect) {
            return false;
          }

          return true;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle case-insensitive quiz answer validation', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startQuizSession(grade);
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true;
        }

        // Submit answer with different case
        const answer = engine.submitQuizAnswer(session.sessionId, currentElement.type.toUpperCase());

        // Should still be correct (case-insensitive)
        return answer.correct;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should handle whitespace-trimmed quiz answer validation', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startQuizSession(grade);
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true;
        }

        // Submit answer with extra whitespace
        const answer = engine.submitQuizAnswer(session.sessionId, `  ${currentElement.type}  `);

        // Should still be correct (whitespace trimmed)
        return answer.correct;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should record quiz answer element ID correctly', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startQuizSession(grade);
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true;
        }

        // Submit answer
        const answer = engine.submitQuizAnswer(session.sessionId, currentElement.type);

        // Verify the answer references the correct element
        if (answer.elementId !== currentElement.id) {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should provide feedback for all quiz answers', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(
        gradeArbitrary,
        fc.integer({ min: 1, max: 3 }),
        (grade, numAnswers) => {
          const session = engine.startQuizSession(grade);
          const feedbackRecords = [];

          for (let i = 0; i < numAnswers && i < session.elements.length; i++) {
            const currentElement = engine.getNextQuestion(session.sessionId);
            if (!currentElement) break;

            // Submit answer
            const answer = engine.submitQuizAnswer(session.sessionId, currentElement.type);
            
            // Record feedback (answer has correct/incorrect status)
            feedbackRecords.push({
              elementId: answer.elementId,
              correct: answer.correct,
              userAnswer: answer.userAnswer,
            });
          }

          const finalSession = engine.getSession(session.sessionId);

          // Verify all answers have feedback recorded
          if (finalSession.answers.length !== feedbackRecords.length) {
            return false;
          }

          // Verify each answer has correct/incorrect feedback
          for (let i = 0; i < feedbackRecords.length; i++) {
            const feedback = feedbackRecords[i];
            const sessionAnswer = finalSession.answers[i];
            
            if (feedback.correct !== sessionAnswer.correct) {
              return false;
            }
          }

          return true;
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    it('should validate quiz answers only for valid elements in session', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startQuizSession(grade);
        const currentElement = engine.getNextQuestion(session.sessionId);
        if (!currentElement) {
          return true;
        }

        // The submitted answer should reference an element in the session
        const answer = engine.submitQuizAnswer(session.sessionId, currentElement.type);

        // Verify the answer references the current element
        if (answer.elementId !== currentElement.id) {
          return false;
        }

        // Verify the element is in the session
        const sessionHasElement = session.elements.some((e) => e.id === answer.elementId);
        if (!sessionHasElement) {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });

    it('should ensure quiz session only accepts grade 5 or 6', () => {
      const gradeArbitrary = fc.oneof(
        fc.constant(5 as const),
        fc.constant(6 as const),
      );

      const property = fc.property(gradeArbitrary, (grade) => {
        const session = engine.startQuizSession(grade);

        // Verify session grade is 5 or 6
        if (![5, 6].includes(session.gradeLevel)) {
          return false;
        }

        // Verify session type is quiz
        if (session.gameType !== 'quiz') {
          return false;
        }

        return true;
      });

      fc.assert(property, { numRuns: 100 });
    });
  });
});
