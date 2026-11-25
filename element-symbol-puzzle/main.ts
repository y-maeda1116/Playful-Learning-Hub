/**
 * Element Symbol Puzzle - 公開ページのエントリポイント (issue #37)
 *
 * 4つのゲームモード（マッチング / クイズ / 化学式 / 周期表ジグソー）を
 * 既存の GameOrchestrator と UIComponents を組み合わせて構成する。
 */

import { GameOrchestrator } from './GameOrchestrator';
import {
  MatchingGameUI,
  QuizGameUI,
  ChemicalFormulaPuzzleUI,
  PeriodicTableJigsawUI,
  UIComponent,
} from './src/ui/UIComponents';
import { ElementContentManager } from './src/managers/ElementContentManager';
import { PeriodicTableManager } from './src/managers/PeriodicTableManager';
import { Element } from './src/data/types';

type Grade = 3 | 4 | 5 | 6;

const contentManager = new ElementContentManager();
const periodicTableManager = new PeriodicTableManager();

const root = document.getElementById('app') as HTMLElement;
let currentView: HTMLElement | null = null;
let timerId: ReturnType<typeof setTimeout> | null = null;

/** 現在の画面を破棄してビュー領域を空にする */
function clearView(): void {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  root.innerHTML = '';
}

/** UI コンポーネントをビュー領域にマウントする */
function mount(component: UIComponent): void {
  clearView();
  currentView = component.render();
  root.appendChild(currentView);
}

/** 戻るボタン付きヘッダとともに UI コンポーネントをマウントする */
function mountWithHeader(component: UIComponent): void {
  clearView();
  const header = document.createElement('div');
  header.className = 'view-header';
  const homeButton = document.createElement('button');
  homeButton.className = 'back-button';
  homeButton.textContent = 'ホームへ戻る';
  homeButton.addEventListener('click', showHome);
  header.appendChild(homeButton);
  currentView = component.render();
  root.appendChild(header);
  root.appendChild(currentView);
}

/** フィードバックメッセージを一時的に表示する */
function showFeedback(message: string, ok: boolean): void {
  const existing = root.querySelector('.feedback');
  if (existing !== null) {
    existing.remove();
  }
  const el = document.createElement('div');
  el.className = ok ? 'feedback feedback-ok' : 'feedback feedback-ng';
  el.textContent = message;
  root.appendChild(el);
  timerId = setTimeout(() => el.remove(), 1500);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 化学式・周期表は 5・6年生向けコンテンツのため、3・4年生は 5年生問題にフォールバックする */
function contentGrade(grade: Grade): 5 | 6 {
  return grade >= 5 ? grade : 5;
}

// ---------------------------------------------------------------------------
// ホーム画面
// ---------------------------------------------------------------------------

function showHome(): void {
  clearView();
  const home = document.createElement('div');
  home.className = 'home';

  const title = document.createElement('h2');
  title.textContent = 'モードをえらんでね！';
  home.appendChild(title);

  const gradeSelect = document.createElement('select');
  gradeSelect.id = 'grade';
  for (const g of [3, 4, 5, 6] as Grade[]) {
    const opt = document.createElement('option');
    opt.value = String(g);
    opt.textContent = `${g}年生`;
    if (g === 5) {
      opt.selected = true;
    }
    gradeSelect.appendChild(opt);
  }
  const gradeLabel = document.createElement('label');
  gradeLabel.textContent = '学年: ';
  gradeLabel.appendChild(gradeSelect);
  home.appendChild(gradeLabel);

  const modes: Array<{ type: GameType; label: string; desc: string }> = [
    { type: 'matching', label: '記号合わせ', desc: '元素記号と名前をマッチさせよう' },
    { type: 'quiz', label: 'クイズ', desc: '元素の種類をあてるクイズ' },
    { type: 'chemicalFormula', label: '化学式パズル', desc: '元素を組み合わせて化学式を作ろう' },
    { type: 'periodicTableJigsaw', label: '周期表ジグソー', desc: '元素を周期表の正しい場所に置こう' },
  ];

  const grid = document.createElement('div');
  grid.className = 'mode-grid';
  for (const mode of modes) {
    const card = document.createElement('button');
    card.className = 'mode-card';
    const label = document.createElement('span');
    label.className = 'mode-label';
    label.textContent = mode.label;
    const desc = document.createElement('span');
    desc.className = 'mode-desc';
    desc.textContent = mode.desc;
    card.appendChild(label);
    card.appendChild(desc);
    card.addEventListener('click', () => {
      const grade = Number(gradeSelect.value) as Grade;
      startGame(mode.type, grade);
    });
    grid.appendChild(card);
  }
  home.appendChild(grid);
  currentView = home;
  root.appendChild(home);
}

type GameType = 'matching' | 'quiz' | 'chemicalFormula' | 'periodicTableJigsaw';

function startGame(gameType: GameType, grade: Grade): void {
  if (gameType === 'matching' || gameType === 'quiz') {
    void startSession(gameType, grade);
  } else if (gameType === 'chemicalFormula') {
    startChemicalFormula(grade);
  } else {
    startPeriodicTableJigsaw(grade);
  }
}

// ---------------------------------------------------------------------------
// マッチング / クイズ（GameOrchestrator のセッションループ）
// ---------------------------------------------------------------------------

/** クイズの選択肢: 表示は日本語、回答は検証値（GameEngine.submitAnswer と比較される値） */
const TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '金属', value: 'metal' },
  { label: '非金属', value: 'nonmetal' },
  { label: '半金属', value: 'metalloid' },
];

async function startSession(gameType: 'matching' | 'quiz', grade: Grade): Promise<void> {
  const orchestrator = new GameOrchestrator();
  orchestrator.startGameSession(gameType, grade, 'default-user');

  const sessionView = document.createElement('div');
  sessionView.className = 'session-view';
  const progressEl = document.createElement('div');
  progressEl.className = 'session-progress';
  const questionHolder = document.createElement('div');
  sessionView.appendChild(progressEl);
  sessionView.appendChild(questionHolder);

  clearView();
  currentView = sessionView;
  root.appendChild(sessionView);

  let questionCount = 0;

  const renderQuestion = async (): Promise<void> => {
    const element = await orchestrator.displayNextQuestion();
    if (!element) {
      await finishSession();
      return;
    }
    questionCount += 1;
    progressEl.textContent = `第${questionCount}問`;

    let component: UIComponent;
    if (gameType === 'matching') {
      // 正解名 + 誤答名3つ（重複なし）
      const wrongNames = shuffle(
        contentManager
          .getRandomElementsByGrade(grade, 6)
          .map((e: Element) => e.name)
          .filter((name: string) => name !== element.name),
      ).slice(0, 3);
      const options = shuffle([...wrongNames, element.name]).map(
        (name: string): Element => ({ ...element, name }),
      );
      component = new MatchingGameUI(element, options, (answer: string) => {
        void advance(answer);
      });
    } else {
      const labels = shuffle(TYPE_OPTIONS.map((o) => o.label));
      component = new QuizGameUI(
        element,
        `「${element.name}（${element.symbol}）」の分類はどれ？`,
        labels,
        (label: string) => {
          const option = TYPE_OPTIONS.find((o) => o.label === label);
          void advance(option ? option.value : label);
        },
      );
    }

    questionHolder.innerHTML = '';
    questionHolder.appendChild(component.render());
  };

  const advance = (answer: string): void => {
    void orchestrator
      .submitAnswer(answer)
      .then(({ isCorrect, feedback }) => {
        showFeedback(feedback, isCorrect);
        timerId = setTimeout(() => {
          void renderQuestion();
        }, 900);
      })
      .catch((error: unknown) => {
        console.error('submitAnswer failed:', error);
      });
  };

  const finishSession = async (): Promise<void> => {
    const { score, accuracy, badges } = await orchestrator.endGameSession();
    const resultView = document.createElement('div');
    resultView.className = 'result-view';
    const title = document.createElement('h2');
    title.textContent = 'おつかれさま！';
    const scoreLine = document.createElement('p');
    scoreLine.textContent = `スコア: ${score}点`;
    const accuracyLine = document.createElement('p');
    accuracyLine.textContent = `正答率: ${accuracy}%`;
    resultView.appendChild(title);
    resultView.appendChild(scoreLine);
    resultView.appendChild(accuracyLine);
    if (badges.length > 0) {
      const badgeLine = document.createElement('p');
      badgeLine.textContent = `バッジ獲得: ${badges.map((b) => b.name).join('、')}`;
      resultView.appendChild(badgeLine);
    }
    const homeButton = document.createElement('button');
    homeButton.className = 'back-button';
    homeButton.textContent = 'ホームへ戻る';
    homeButton.addEventListener('click', showHome);
    resultView.appendChild(homeButton);
    clearView();
    currentView = resultView;
    root.appendChild(resultView);
  };

  await renderQuestion();
}

// ---------------------------------------------------------------------------
// 化学式パズル（構成元素をすべて選びきるとクリア）
// ---------------------------------------------------------------------------

function startChemicalFormula(grade: Grade): void {
  const formulas = contentManager.getFormulasByGrade(contentGrade(grade));
  const formula = formulas[Math.floor(Math.random() * formulas.length)];

  const collected = new Set<string>();
  // 構成元素 + 誤答記号2つを選択肢にする
  const distractorSymbols = shuffle(
    contentManager
      .getElementsByGrade(grade)
      .filter((e: Element) => !formula.elements.includes(e.symbol)),
  )
    .slice(0, 2)
    .map((e: Element) => e.symbol);
  const availableElements = shuffle(
    contentManager.getElementsByGrade(grade).filter((e: Element) => {
      return formula.elements.includes(e.symbol) || distractorSymbols.includes(e.symbol);
    }),
  );

  const component = new ChemicalFormulaPuzzleUI(formula, availableElements, (symbol: string) => {
    if (formula.elements.includes(symbol)) {
      collected.add(symbol);
      showFeedback(`「${symbol}」は ${formula.name} に使われている元素！`, true);
      if (collected.size === formula.elements.length) {
        timerId = setTimeout(() => {
          showFeedback(`クリア! ${formula.formula} = ${formula.name}`, true);
          timerId = setTimeout(showHome, 2000);
        }, 1500);
      }
    } else {
      showFeedback(`「${symbol}」は ${formula.name} には使われていないよ`, false);
    }
  });

  mountWithHeader(component);
}

// ---------------------------------------------------------------------------
// 周期表ジグソー（正しい場所に置けたらピースが固定される）
// ---------------------------------------------------------------------------

function startPeriodicTableJigsaw(grade: Grade): void {
  const puzzle = periodicTableManager.getPuzzleForGrade(contentGrade(grade));
  const placedPieces = new Map<string, { period: number; group: number }>();

  const component = new PeriodicTableJigsawUI(
    puzzle,
    placedPieces,
    (elementId: string, position: { period: number; group: number }) => {
      const element = puzzle.elements.find((e: Element) => e.id === elementId);
      if (!element || placedPieces.has(elementId)) {
        return;
      }
      if (periodicTableManager.validateElementPlacement(element, position.period, position.group)) {
        placedPieces.set(elementId, position);
        showFeedback(`「${element.name}」を置けた！ (${placedPieces.size}/${puzzle.totalPieces})`, true);
        if (periodicTableManager.isPuzzleComplete(puzzle, placedPieces)) {
          timerId = setTimeout(() => {
            showFeedback('周期表コンプリート！', true);
            timerId = setTimeout(showHome, 2000);
          }, 1500);
        }
      } else {
        showFeedback(`「${element.name}」の場所がちがうよ`, false);
      }
    },
  );

  mountWithHeader(component);
}

showHome();
