# Design Document: ひらがな・カタカナ学習システム

## Overview

The Hiragana-Katakana Learning System is an interactive educational platform designed for children aged 3-6 to learn Japanese characters through engaging games and activities. The system integrates with the existing "わくわく学びランド" platform and provides age-appropriate, progressive learning experiences with parental oversight capabilities.

The system is built on JavaScript and follows the existing platform architecture, leveraging the badge system and game mechanics already in place.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Learning System                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Game Engine     │  │  Progress        │               │
│  │  - Recognition   │  │  Tracking        │               │
│  │  - Writing       │  │  - Storage       │               │
│  │  - Word Form     │  │  - Analytics     │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Content         │  │  Reward          │               │
│  │  Manager         │  │  System          │               │
│  │  - Characters    │  │  - Badges        │               │
│  │  - Levels        │  │  - Streaks       │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  UI/UX           │  │  Audio           │               │
│  │  - Rendering     │  │  - Pronunciation │               │
│  │  - Feedback      │  │  - Rewards       │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Character Selection** → Audio Playback + Visual Feedback
2. **Game Session** → Answer Submission → Validation → Feedback Display
3. **Progress Update** → Local Storage → Analytics Calculation
4. **Reward Trigger** → Badge/Stamp Award → Display Notification

## Components and Interfaces

### 1. Character Content Manager

**Responsibility**: Manage all hiragana and katakana characters with metadata

```javascript
interface Character {
  id: string;
  type: 'hiragana' | 'katakana';
  character: string;
  romaji: string;
  pronunciation: string;
  strokeOrder: StrokeGuide[];
  difficulty: 'basic' | 'advanced';
  group: string; // 'a-row', 'ka-row', etc.
}

interface StrokeGuide {
  order: number;
  path: string;
  timing: number;
}
```

**Key Methods**:
- `getCharactersByDifficulty(level)`: Returns characters for specified difficulty
- `getCharactersByGroup(group)`: Returns characters in a specific group
- `getStrokeGuide(characterId)`: Returns stroke order guidance
- `getAllCharacters()`: Returns complete character set (100 total)

### 2. Game Engine

**Responsibility**: Manage game sessions and game mechanics

```javascript
interface GameSession {
  sessionId: string;
  gameType: 'recognition' | 'writing' | 'wordForm';
  difficulty: 'basic' | 'advanced';
  startTime: number;
  characters: Character[];
  currentIndex: number;
  score: number;
  answers: Answer[];
}

interface Answer {
  characterId: string;
  userAnswer: string;
  correct: boolean;
  responseTime: number;
  timestamp: number;
}

interface GameOptions {
  maxOptions: number; // Always 3
  timeLimit?: number;
  characterSet: Character[];
}
```

**Key Methods**:
- `startSession(gameType, difficulty)`: Initialize new game session
- `submitAnswer(answer)`: Process user answer and return feedback
- `getNextCharacter()`: Retrieve next character in session
- `endSession()`: Finalize session and calculate statistics
- `generateFeedback(isCorrect)`: Create visual/audio feedback

### 3. Progress Tracking System

**Responsibility**: Store and retrieve learning progress

```javascript
interface CharacterProgress {
  characterId: string;
  attempts: number;
  correct: number;
  proficiency: number; // 0-100
  lastAttempt: number;
  masteredDate?: number;
}

interface UserProfile {
  userId: string;
  childName: string;
  ageGroup: 'young' | 'older'; // 3-4 or 5-6
  createdDate: number;
  totalLearningTime: number;
  characterProgress: Map<string, CharacterProgress>;
  streakDays: number;
  lastSessionDate: number;
}
```

**Key Methods**:
- `saveProgress(userId, characterId, isCorrect)`: Update character progress
- `getProgress(userId)`: Retrieve complete user progress
- `calculateProficiency(characterId)`: Compute proficiency score
- `getWeakCharacters(userId, threshold)`: Identify characters needing practice
- `updateStreak(userId)`: Update consecutive learning days
- `getStatistics(userId)`: Calculate learning time and accuracy

### 4. Reward System

**Responsibility**: Manage badges, stamps, and motivational rewards

```javascript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: RewardCriteria;
  awardedDate?: number;
}

interface RewardCriteria {
  type: 'proficiency' | 'streak' | 'milestone';
  threshold: number;
  characterSet?: string[];
}

interface StreakReward {
  days: number;
  reward: string;
  icon: string;
}
```

**Key Methods**:
- `checkBadgeEligibility(userId)`: Determine earned badges
- `awardBadge(userId, badgeId)`: Award badge to user
- `getStreakReward(streakDays)`: Get reward for streak milestone
- `displayRewardNotification(reward)`: Show reward to user

### 5. UI/Feedback System

**Responsibility**: Render game interface and provide feedback

```javascript
interface FeedbackConfig {
  type: 'correct' | 'incorrect' | 'encouragement';
  message: string;
  animation: string;
  soundEffect: string;
  duration: number;
}

interface GameDisplay {
  character: Character;
  options: Character[];
  progressBar: number;
  currentScore: number;
  timeRemaining?: number;
}
```

**Key Methods**:
- `renderGameScreen(gameDisplay)`: Display game interface
- `displayFeedback(feedbackConfig)`: Show feedback with animation/sound
- `renderProgressScreen(userProfile)`: Display parent progress view
- `renderCharacterWithStrokeGuide(character)`: Show writing practice interface
- `playAudio(audioFile)`: Play pronunciation or reward sound

## Data Models

### Character Database

- **Total Characters**: 100 (50 hiragana + 50 katakana)
- **Basic Level** (Ages 3-4): Hiragana a-row through na-row (25 characters)
- **Advanced Level** (Ages 5-6): All hiragana + all katakana (100 characters)
- **Storage**: JSON format in local storage with character metadata

### Progress Storage Schema

```javascript
{
  "profiles": {
    "user_id": {
      "childName": "Taro",
      "ageGroup": "young",
      "createdDate": 1234567890,
      "totalLearningTime": 3600,
      "streakDays": 5,
      "lastSessionDate": 1234567890,
      "characterProgress": {
        "char_a": {
          "attempts": 10,
          "correct": 8,
          "proficiency": 80,
          "lastAttempt": 1234567890
        }
      }
    }
  }
}
```

### Game Session Flow

1. **Initialization**: Select difficulty level and game type
2. **Character Presentation**: Display character with 3 options
3. **User Input**: Accept answer (selection, writing, or word formation)
4. **Validation**: Check correctness and calculate response time
5. **Feedback**: Display immediate visual/audio feedback
6. **Progress Update**: Save answer to progress tracking
7. **Reward Check**: Evaluate badge/streak eligibility
8. **Next Character**: Present next character or end session

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Difficulty Level Availability
*For any* instance of the learning system, exactly 2 difficulty levels must be available and correctly labeled for their respective age groups (3-4 and 5-6).

**Validates: Requirements 1.1**

### Property 2: Audio Playback on Character Selection
*For any* character in the system, when selected, the system must trigger audio playback with the correct pronunciation.

**Validates: Requirements 1.2**

### Property 3: Immediate Visual Feedback During Session
*For any* answer submitted during a learning session, visual feedback must be displayed within 500ms of submission.

**Validates: Requirements 1.3**

### Property 4: Error Handling with Encouragement
*For any* incorrect answer, the system must display both an encouragement message and the correct answer.

**Validates: Requirements 1.4**

### Property 5: Parent Mode Progress Display
*For any* user profile, when parent mode is enabled, progress information must be accessible; when disabled, progress display must be unavailable.

**Validates: Requirements 1.5**

### Property 6: Basic Level Character Set
*For any* basic difficulty level, the system must contain exactly the specified hiragana characters (a-row through na-row, 25 total) and present them in stages.

**Validates: Requirements 2.1**

### Property 7: Game Options Constraint
*For any* game session in progress, exactly 3 character options must be presented, with exactly 1 correct answer.

**Validates: Requirements 2.3**

### Property 8: Correct Answer Rewards
*For any* correct answer, the system must trigger both a celebration animation and reward sound effect.

**Validates: Requirements 2.5**

### Property 9: Complete Character Set
*For any* advanced difficulty level, the system must provide exactly 50 hiragana and 50 katakana characters (100 total).

**Validates: Requirements 3.1**

### Property 10: Advanced Mode Writing Practice
*For any* user in advanced mode, the writing practice feature must be enabled; in basic mode, it must be disabled.

**Validates: Requirements 3.2**

### Property 11: Stroke Order Guidance
*For any* character during writing practice, stroke order guides must be displayed for all characters.

**Validates: Requirements 3.3**

### Property 12: Proficiency-Based Level Advancement
*For any* user reaching the proficiency threshold (80%), the system must propose advancement to the next level.

**Validates: Requirements 3.5**

### Property 13: Progress Persistence Round Trip
*For any* progress data saved to local storage, retrieving and deserializing must produce equivalent data.

**Validates: Requirements 4.1**

### Property 14: Progress Display Accuracy
*For any* parent progress view, displayed mastered characters must match the stored progress data.

**Validates: Requirements 4.2**

### Property 15: Statistics Calculation Accuracy
*For any* user profile, displayed learning time and accuracy statistics must be correctly calculated from stored session data.

**Validates: Requirements 4.3**

### Property 16: Weak Character Identification
*For any* user profile, characters with proficiency below 60% must be correctly identified and recommended for practice.

**Validates: Requirements 4.4**

### Property 17: Multi-User Profile Isolation
*For any* system with multiple user profiles, progress data must be isolated and not interfere with other profiles.

**Validates: Requirements 4.5**

### Property 18: Badge Award Logic
*For any* user meeting badge criteria, the system must award the corresponding badge.

**Validates: Requirements 5.1**

### Property 19: Streak-Based Rewards
*For any* user reaching a streak milestone (e.g., 7 days), the system must display the corresponding special reward.

**Validates: Requirements 5.2**

### Property 20: Progress Bar Accuracy
*For any* learning session, the progress bar must accurately reflect the current achievement level (current score / total possible).

**Validates: Requirements 5.3**

### Property 21: Session Completion Messaging
*For any* completed learning session, the system must display an encouragement message prompting next session.

**Validates: Requirements 5.5**

## Error Handling

### Invalid Input Handling
- **Empty or null answers**: Reject and display "Please try again" message
- **Out-of-range proficiency values**: Clamp to 0-100 range
- **Missing character data**: Log error and skip character
- **Corrupted local storage**: Reinitialize with default values

### Session Error Recovery
- **Network interruption**: Save session state and allow resume
- **Audio playback failure**: Display text alternative and continue
- **Storage quota exceeded**: Archive old progress and notify user

### User Profile Errors
- **Duplicate profile creation**: Merge data or prompt for unique name
- **Missing profile data**: Create default profile with current date
- **Streak calculation errors**: Recalculate from session history

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and error conditions:

1. **Character Content Tests**
   - Verify all 100 characters are present and correctly formatted
   - Test character retrieval by difficulty and group
   - Verify stroke order data completeness

2. **Game Mechanics Tests**
   - Test game session initialization with various parameters
   - Verify answer validation logic for correct/incorrect answers
   - Test option generation (always 3 options, 1 correct)
   - Test feedback generation for different answer types

3. **Progress Tracking Tests**
   - Test progress save and retrieval
   - Verify proficiency calculation accuracy
   - Test streak day calculation
   - Test weak character identification

4. **Reward System Tests**
   - Test badge eligibility checking
   - Test streak reward thresholds
   - Test reward notification display

5. **Error Handling Tests**
   - Test invalid input rejection
   - Test storage quota handling
   - Test profile data recovery

### Property-Based Testing Approach

Property-based tests verify universal properties across all inputs using randomization:

1. **Property 1: Difficulty Level Availability** (Property 1)
   - Generate random system instances
   - Verify exactly 2 levels exist with correct labels

2. **Property 2: Audio Playback** (Property 2)
   - Generate random characters
   - Verify audio trigger on selection

3. **Property 3: Immediate Feedback** (Property 3)
   - Generate random answers during sessions
   - Verify feedback appears within 500ms

4. **Property 4: Error Encouragement** (Property 4)
   - Generate random incorrect answers
   - Verify both message and correct answer displayed

5. **Property 7: Game Options** (Property 7)
   - Generate random game sessions
   - Verify exactly 3 options with 1 correct

6. **Property 9: Complete Character Set** (Property 9)
   - Verify system contains exactly 100 characters
   - Verify 50 hiragana and 50 katakana

7. **Property 13: Progress Persistence** (Property 13)
   - Generate random progress data
   - Save and retrieve, verify equivalence

8. **Property 17: Profile Isolation** (Property 17)
   - Generate multiple user profiles
   - Verify data isolation between profiles

9. **Property 18: Badge Award Logic** (Property 18)
   - Generate users with various proficiency levels
   - Verify badges awarded correctly

10. **Property 20: Progress Bar Accuracy** (Property 20)
    - Generate random session scores
    - Verify progress bar calculation

### Test Configuration

- **Minimum iterations per property test**: 100
- **Test framework**: Jest with fast-check for property-based testing
- **Coverage target**: >85% code coverage
- **Tag format**: `Feature: hiragana-katakana-learning, Property {number}: {property_text}`

### Testing Priorities

1. **High Priority**: Properties 1, 7, 9, 13, 17 (core functionality and data integrity)
2. **Medium Priority**: Properties 2, 3, 4, 18, 20 (user experience and rewards)
3. **Low Priority**: Properties 5, 6, 10, 11, 12, 14, 15, 16, 19, 21 (edge cases and advanced features)
