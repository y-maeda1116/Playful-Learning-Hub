# Playful-Learning-Hub

「わくわく学びランド」(Waku Waku Learning Land) is a web application designed for children to learn and play. It offers a variety of games and activities tailored to different age groups, from toddlers to pre-teens.

## Features

The website is structured by age group, and each page bundles several games that can be switched between via an in-page navigation.

*   **1-2 years old:** Sensory and early-counting play
    *   Animal Sound Quiz (どうぶつのなきごえクイズ)
    *   Counting Game (かずかぞえゲーム)
    *   Rhythm Game (リズムゲーム)
*   **3-4 years old:** Games that nurture intellectual curiosity and early literacy
    *   Classification Game (なかまさがしゲーム)
    *   Hiragana Learning (ひらがな学習)
    *   Katakana Learning (カタカナ学習)
    *   Counting Game (かずかぞえゲーム)
    *   Tracing Play (なぞりあそび) — trace dotted lines and shapes
*   **5-6 years old:** Activities to prepare for elementary school
    *   Shopping Game (おかいものゲーム) — learn numbers through shopping
    *   Hiragana & Katakana Learning (ひらがな・カタカナ学習)
    *   Word Relay (ことばリレー) — shiritori word chain
    *   Clock Play (とけいあそび)
    *   Shape Puzzle (ずけいパズル)
*   **7-8 years old (1st-2nd Grade):** Games to solidify foundational academic skills
    *   Math Battle (算数バトル)
    *   Multiplication Battle (九九バトル)
    *   Kanji Puzzle (漢字パズル)
    *   Word Relay (ことばリレー)
*   **9-10 years old (3rd-4th Grade):** Games that develop practical skills
    *   Fraction Pizza (分数ピザ)
    *   Multiplication Battle (九九バトル)
    *   Kanji Puzzle (漢字パズル)
*   **11-12 years old (5th-6th Grade):** Activities that encourage inquiry-based learning
    *   Speed Calculation (速さ計算)
    *   Kanji Puzzle (漢字パズル)

## Tech Stack

*   Vanilla JavaScript (CommonJS modules), HTML, and CSS — no build step
*   [Vitest](https://vitest.dev/) with [jsdom](https://github.com/jsdom/jsdom) for unit testing
*   Shared infrastructure for sound (`audio-manager.js`), progress tracking (`progress-tracker.js`), badges (`badge-system.js`), and gamification (`gamification-system.js`)

## Project Structure

*   `index.html` — landing page linking to each age group
*   `ages-*.html` — one page per age group, wiring together the games for that age
*   `*-game.js`, `*-puzzle.js`, etc. — individual game modules (each with a matching `.test.js`)
*   `style.css` — shared styles

## Development

To get started with development, you'll need to have Node.js and npm installed.

1.  Clone the repository:
    ```bash
    git clone https://github.com/y-maeda1116/Playful-Learning-Hub.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the tests:
    ```bash
    npm test
    ```

To preview the app, open `index.html` in a browser, or serve the directory with any static file server.

## Testing

Every game and shared module has a companion `*.test.js` file (25 in total), run with Vitest in a jsdom environment:

```bash
npm test
```

## License

This project is licensed under the ISC License.
