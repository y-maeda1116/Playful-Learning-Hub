# AGENTS.md: Guidelines for AI Agents

This document provides instructions and guidelines for AI agents working on this repository. Please adhere to these rules to ensure code quality, consistency, and maintainability.

## 1. General Principles

- **Understand the Goal:** Before writing any code, make sure you fully understand the requirements of the task. If anything is unclear, ask for clarification.
- **Verify Your Changes:** After every modification, run the relevant tests to confirm that your changes were successful and didn't introduce any regressions.

## 2. Coding Conventions

- **Follow Existing Style:** Adhere to the coding style and conventions already present in the codebase.
- **Naming:** Use clear and descriptive names for variables, functions, and classes.

## 3. Testing

- **Run Existing Tests:** Before submitting your work, run all relevant tests to ensure you haven't broken anything.
- **Write New Tests:** For any new feature, you must add corresponding tests. For bug fixes, add a test that reproduces the bug and verifies the fix.
- **Test Command:** To run the tests, use the following command:
  ```bash
  npm test
  ```

## 4. Commit Messages

- **Use Conventional Commits:** Structure your commit messages according to the [Conventional Commits specification](https://www.conventionalcommits.org/).
- **Format:**
  ```
  feat: A brief summary of the feature

  A more detailed explanatory text, if necessary.
  ```
- **Clarity:** The commit message should be clear and concise, explaining the "what" and "why" of the change.

## 5. Submission

- **Code Review:** Before submitting, request a code review of your changes.
- **Final Verification:** Ensure all checks and tests pass before final submission.
