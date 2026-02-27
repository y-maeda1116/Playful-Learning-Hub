# Element Symbol Puzzle

An interactive educational game for learning chemical elements and symbols, designed for children ages 7-12 (grades 3-6).

## Project Structure

```
element-symbol-puzzle/
├── __tests__/                 # Test files
│   └── setup.test.ts         # Framework verification tests
├── types.ts                   # Core TypeScript interfaces
├── index.ts                   # Main module exports
├── jest.config.js            # Jest configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Project dependencies and scripts
└── README.md                 # This file
```

## Core Interfaces

### Element
Represents a chemical element with metadata including:
- Symbol, name, atomic number, atomic weight
- Type (metal, nonmetal, metalloid)
- Grade level (3-6)
- Pronunciation and audio URL
- Properties (state, color, reactivity)
- Periodic table position

### ChemicalFormula
Represents a chemical formula with:
- Formula notation
- Constituent elements
- Grade level (5-6)
- Common uses

### GameSession
Represents an active game session with:
- Game type (matching, quiz, chemical formula, periodic table jigsaw)
- Grade level and difficulty
- Current progress and score
- User answers and timing

### UserProgress
Tracks learning progress including:
- Elements learned status
- Session statistics
- Badges earned
- Streak days
- Jigsaw puzzles completed

### PeriodicTablePuzzle
Represents a jigsaw puzzle version of the periodic table with:
- Difficulty level
- Element pieces
- Grade level

## Setup and Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd element-symbol-puzzle
npm install
```

### Build

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## Testing Framework

The project uses:
- **Jest** for unit testing
- **fast-check** for property-based testing

All tests are located in the `__tests__` directory and follow the naming convention `*.test.ts`.

## Development

### Adding New Tests

1. Create a test file in `__tests__/` with the `.test.ts` extension
2. Import necessary types from `types.ts`
3. Write unit tests and property-based tests
4. Run `npm test` to verify

### Adding New Interfaces

1. Add the interface to `types.ts`
2. Export it from `index.ts`
3. Update this README if needed

## Requirements Coverage

This setup satisfies the following requirements:
- **1.1**: Element database structure
- **2.1**: Content management interfaces
- **3.1**: Chemical formula interfaces
- **4.1**: User progress tracking structure
- **5.1**: Badge and achievement system structure

## Next Steps

1. Implement ElementContentManager (Task 2)
2. Implement ChemicalFormulaManager (Task 3)
3. Implement GameEngine (Task 4)
4. Implement ProgressTrackingSystem (Task 6)
5. Implement RewardSystem (Task 8)
