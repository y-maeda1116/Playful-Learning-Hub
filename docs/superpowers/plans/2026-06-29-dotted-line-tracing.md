# 点線をなぞるゲーム Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3-4歳向け「点線をなぞる」運筆ゲームを新規作成し、`ages-3-4.html` に統合する。

**Architecture:** 新規 `tracing-game.js`（関数ベース・CommonJS）。SVGの2層polyline（点線ガイド＋ユーザー軌跡）で描画し、純粋関数 `calculateAccuracy` が精度を判定。イミュータブルな状態管理。既存ファイルは `ages-3-4.html` と `style.css` のみ編集、`writing-practice.js` 等は非改修。DOM構築は `createElement` + `textContent` のみ（`innerHTML` 不使用、XSS安全）。

**Tech Stack:** バニラJavaScript (ES2017+)、SVG、PointerEvent、vitest + jsdom、CommonJS

---

## File Structure

| ファイル | 操作 | 責務 |
|---|---|---|
| `tracing-game.js` | 新規 | ゲーム全体。純粋関数（ガイド点群生成・精度判定）+ `initTracingGame()` |
| `tracing-game.test.js` | 新規 | vitest + jsdom テスト |
| `ages-3-4.html` | 編集 | ナビボタン・セクション・`<script>`・`switchToGame('tracing')` 追加 |
| `style.css` | 編集 | `tracing-*` クラス追加 |

### 設計メモ
- ガイド描画も `<polyline>`（`points` 属性 + `stroke-dasharray`）で行う。スペックの `<path>` から polyline に変更（機能＝点線ガイドは同じ）。理由: `guidePoints` を描画にそのまま流用でき、`getPointAtLength`（jsdom 非サポート）に依存しない。
- 各図形は `guidePoints`（判定用サンプリング済み点群）を持ち、純粋関数で生成。
- 状態（現在index・軌跡点・成功数・試行数）は新しい配列/オブジェクト生成で更新（イミュータブル）。
- 成功基準: `accuracy >= 70`。
- 座標系: SVG `viewBox="0 0 300 300"`。

---

## Task 1: コア純粋関数（ガイド点群生成 + 精度判定）

**Files:**
- Create: `tracing-game.js`
- Create: `tracing-game.test.js`

- [ ] **Step 1: 失敗テストを書く**

`tracing-game.test.js` を作成:
```js
const {
  calculateAccuracy, generateCircleGuide, generateLineGuide,
  generatePolylineGuide, generateWaveGuide, pointsToString,
} = require('./tracing-game.js');

describe('generateCircleGuide', () => {
  test('指定した点数の円周上の点を生成する', () => {
    const points = generateCircleGuide(150, 150, 100, 60);
    expect(points).toHaveLength(60);
    expect(points[0].x).toBeCloseTo(250, 1);
    expect(points[0].y).toBeCloseTo(150, 1);
  });
});

describe('generateLineGuide', () => {
  test('両端を含む直線上の点を生成する', () => {
    const points = generateLineGuide(0, 0, 100, 0, 5);
    expect(points).toHaveLength(6);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[5]).toEqual({ x: 100, y: 0 });
  });
});

describe('generatePolylineGuide', () => {
  test('折れ線の頂点列を等分した点を生成し両端を含む', () => {
    const points = generatePolylineGuide([{ x: 0, y: 0 }, { x: 100, y: 0 }], 4);
    expect(points.length).toBeGreaterThanOrEqual(2);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 100, y: 0 });
  });
});

describe('generateWaveGuide', () => {
  test('正弦波の点を指定数生成する', () => {
    const points = generateWaveGuide(150, 50, 110, 30, 270, 80);
    expect(points).toHaveLength(81);
    expect(points[0].x).toBeCloseTo(30, 1);
  });
});

describe('calculateAccuracy', () => {
  const guide = generateCircleGuide(150, 150, 100, 60);
  test('ユーザー点が完全にガイド上なら100', () => {
    expect(calculateAccuracy(guide, guide, 25)).toBe(100);
  });
  test('ユーザー点が完全に遠ければ低い値', () => {
    const far = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
    expect(calculateAccuracy(far, guide, 25)).toBeLessThan(20);
  });
  test('空入力は0', () => {
    expect(calculateAccuracy([], guide, 25)).toBe(0);
    expect(calculateAccuracy(guide, [], 25)).toBe(0);
  });
});

describe('pointsToString', () => {
  test('点群をSVG points文字列に変換する', () => {
    const s = pointsToString([{ x: 1.234, y: 2 }, { x: 3, y: 4 }]);
    expect(s).toBe('1.2,2.0 3.0,4.0');
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認**

Run: `npm test -- tracing-game.test.js`
Expected: FAIL（モジュール/関数が未定義）

- [ ] **Step 3: 最小実装を書く**

`tracing-game.js` を作成:
```js
'use strict';

function generateCircleGuide(cx, cy, r, count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return points;
}

function generateLineGuide(x1, y1, x2, y2, count) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
  }
  return points;
}

function generatePolylineGuide(vertices, total) {
  if (vertices.length < 2) return vertices.slice();
  const segs = [];
  let totalLen = 0;
  for (let i = 0; i < vertices.length - 1; i++) {
    const a = vertices[i];
    const b = vertices[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len });
    totalLen += len;
  }
  const points = [];
  for (const seg of segs) {
    const segCount = Math.max(1, Math.round((seg.len / totalLen) * (total - 1)));
    for (let i = 0; i < segCount; i++) {
      const t = i / segCount;
      points.push({ x: seg.a.x + (seg.b.x - seg.a.x) * t, y: seg.a.y + (seg.b.y - seg.a.y) * t });
    }
  }
  points.push(vertices[vertices.length - 1]);
  return points;
}

function generateWaveGuide(yMid, amplitude, wavelength, xStart, xEnd, count) {
  const points = [];
  const span = xEnd - xStart;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = xStart + span * t;
    const y = yMid + amplitude * Math.sin((span / wavelength) * t * 2 * Math.PI);
    points.push({ x, y });
  }
  return points;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function calculateAccuracy(userPoints, guidePoints, tolerance) {
  if (!userPoints.length || !guidePoints.length) return 0;
  let userNear = 0;
  for (const up of userPoints) {
    let minD = Infinity;
    for (const gp of guidePoints) {
      const d = distance(up, gp);
      if (d < minD) minD = d;
    }
    if (minD <= tolerance) userNear++;
  }
  const A = userNear / userPoints.length;
  let guideCovered = 0;
  for (const gp of guidePoints) {
    let minD = Infinity;
    for (const up of userPoints) {
      const d = distance(gp, up);
      if (d < minD) minD = d;
    }
    if (minD <= tolerance) guideCovered++;
  }
  const B = guideCovered / guidePoints.length;
  return Math.round(((A + B) / 2) * 100);
}

function pointsToString(points) {
  return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

if (typeof module !== 'undefined') {
  module.exports = {
    calculateAccuracy, generateCircleGuide, generateLineGuide,
    generatePolylineGuide, generateWaveGuide, pointsToString, distance,
  };
}
```

- [ ] **Step 4: テストを実行し成功を確認**

Run: `npm test -- tracing-game.test.js`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add tracing-game.js tracing-game.test.js
git commit -m "feat(tracing): ガイド点群生成と精度判定の純粋関数を追加 (#18)"
```

---

## Task 2: SHAPES データ定義

**Files:**
- Modify: `tracing-game.js`
- Modify: `tracing-game.test.js`

- [ ] **Step 1: 失敗テストを書く**

`tracing-game.test.js` の import 行を更新し、テストを追加:
```js
const { SHAPES } = require('./tracing-game.js');

describe('SHAPES', () => {
  test('6種の図形が定義されている', () => {
    expect(SHAPES).toHaveLength(6);
  });
  test('各図形に id/name/difficulty/guidePoints がある', () => {
    for (const s of SHAPES) {
      expect(typeof s.id).toBe('string');
      expect(typeof s.name).toBe('string');
      expect(typeof s.difficulty).toBe('number');
      expect(Array.isArray(s.guidePoints)).toBe(true);
      expect(s.guidePoints.length).toBeGreaterThan(10);
    }
  });
  test('難易度順（昇順）に並んでいる', () => {
    const diffs = SHAPES.map(s => s.difficulty);
    const sorted = [...diffs].sort((a, b) => a - b);
    expect(diffs).toEqual(sorted);
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認**

Run: `npm test -- tracing-game.test.js`
Expected: FAIL（SHAPES 未定義）

- [ ] **Step 3: SHAPES を実装**

`tracing-game.js` の純粋関数群の直後、export の前に追加:
```js
const SHAPES = Object.freeze([
  {
    id: 'circle', name: 'まる', difficulty: 1,
    guidePoints: generateCircleGuide(150, 150, 100, 60),
  },
  {
    id: 'line', name: 'まっすぐ', difficulty: 1,
    guidePoints: generateLineGuide(40, 150, 260, 40),
  },
  {
    id: 'triangle', name: 'さんかく', difficulty: 2,
    guidePoints: generatePolylineGuide(
      [{ x: 150, y: 40 }, { x: 260, y: 240 }, { x: 40, y: 240 }, { x: 150, y: 40 }], 60),
  },
  {
    id: 'square', name: 'しかく', difficulty: 2,
    guidePoints: generatePolylineGuide(
      [{ x: 50, y: 60 }, { x: 250, y: 60 }, { x: 250, y: 240 }, { x: 50, y: 240 }, { x: 50, y: 60 }], 60),
  },
  {
    id: 'wave', name: 'なみ', difficulty: 3,
    guidePoints: generateWaveGuide(150, 45, 110, 30, 270, 80),
  },
  {
    id: 'zigzag', name: 'ぎざぎざ', difficulty: 3,
    guidePoints: generatePolylineGuide(
      [{ x: 30, y: 210 }, { x: 75, y: 90 }, { x: 120, y: 210 }, { x: 165, y: 90 }, { x: 210, y: 210 }, { x: 255, y: 90 }], 60),
  },
]);
```

export オブジェクトに `SHAPES` を追加:
```js
if (typeof module !== 'undefined') {
  module.exports = {
    calculateAccuracy, generateCircleGuide, generateLineGuide,
    generatePolylineGuide, generateWaveGuide, pointsToString, distance,
    SHAPES,
  };
}
```

- [ ] **Step 4: テストを実行し成功を確認**

Run: `npm test -- tracing-game.test.js`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add tracing-game.js tracing-game.test.js
git commit -m "feat(tracing): 6種の図形データ(SHAPES)を追加 (#18)"
```

---

## Task 3: buildUI + loadShape（DOM構築と図形ロード）

**Files:**
- Modify: `tracing-game.js`
- Modify: `tracing-game.test.js`

- [ ] **Step 1: 失敗テストを書く**

`tracing-game.test.js` の import に `initTracingGame` を追加し、テストを追加:
```js
const { initTracingGame, SHAPES } = require('./tracing-game.js');

describe('initTracingGame - UI生成', () => {
  let container;
  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'tracing-game';
    document.body.appendChild(container);
  });
  afterEach(() => {
    if (container.parentNode) document.body.removeChild(container);
  });

  test('コンテナにゲームUIが生成される', () => {
    initTracingGame();
    expect(container.querySelector('.tracing-header')).not.toBeNull();
    expect(container.querySelector('.tracing-canvas')).not.toBeNull();
    expect(container.querySelector('.tracing-guide')).not.toBeNull();
    expect(container.querySelector('.tracing-user')).not.toBeNull();
    expect(container.querySelector('.tracing-shape-name')).not.toBeNull();
    expect(container.querySelector('.tracing-next-btn')).not.toBeNull();
    expect(container.querySelector('.tracing-reset-btn')).not.toBeNull();
    expect(container.querySelector('.tracing-feedback')).not.toBeNull();
  });

  test('最初の図形(丸)のガイドと名前が表示される', () => {
    initTracingGame();
    const guide = container.querySelector('.tracing-guide');
    expect(guide.getAttribute('points').trim().length).toBeGreaterThan(0);
    expect(container.querySelector('.tracing-shape-name').textContent).toBe(SHAPES[0].name);
  });

  test('ユーザー軌跡polylineは初期状態で空', () => {
    initTracingGame();
    expect(container.querySelector('.tracing-user').getAttribute('points')).toBe('');
  });

  test('コンテナ不在時はnoopで例外なし', () => {
    document.body.removeChild(container);
    expect(() => initTracingGame()).not.toThrow();
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認**

Run: `npm test -- tracing-game.test.js`
Expected: FAIL（initTracingGame 未定義）

- [ ] **Step 3: initTracingGame を実装**

`tracing-game.js` の SHAPES 定義の直後、export の前に追加（`innerHTML` 不使用、全要素 DOM API で生成）:
```js
function createSvgElement(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function loadShape(container, state) {
  const shape = SHAPES[state.currentIndex];
  const guide = container.querySelector('.tracing-guide');
  const user = container.querySelector('.tracing-user');
  const nameEl = container.querySelector('.tracing-shape-name');
  const feedback = container.querySelector('.tracing-feedback');
  guide.setAttribute('points', pointsToString(shape.guidePoints));
  user.setAttribute('points', '');
  nameEl.textContent = shape.name;
  feedback.textContent = '';
  feedback.className = 'tracing-feedback';
  return Object.assign({}, state, {
    currentShape: shape,
    userPoints: [],
    isTracing: false,
    evaluated: false,
  });
}

function buildUI(container) {
  container.textContent = '';
  container.className = 'tracing-game';

  const header = document.createElement('div');
  header.className = 'tracing-header';
  const title = document.createElement('h2');
  title.className = 'tracing-title';
  title.textContent = 'なぞりあそび';
  const nameEl = document.createElement('p');
  nameEl.className = 'tracing-shape-name';
  header.appendChild(title);
  header.appendChild(nameEl);
  container.appendChild(header);

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'tracing-canvas-wrap';
  const svg = createSvgElement('svg');
  svg.setAttribute('class', 'tracing-canvas');
  svg.setAttribute('viewBox', '0 0 300 300');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '点線をなぞるキャンバス');

  const guide = createSvgElement('polyline');
  guide.setAttribute('class', 'tracing-guide');
  guide.setAttribute('fill', 'none');
  guide.setAttribute('stroke', '#bdc3c7');
  guide.setAttribute('stroke-width', '6');
  guide.setAttribute('stroke-linecap', 'round');
  guide.setAttribute('stroke-linejoin', 'round');
  guide.setAttribute('stroke-dasharray', '2,14');
  svg.appendChild(guide);

  const user = createSvgElement('polyline');
  user.setAttribute('class', 'tracing-user');
  user.setAttribute('fill', 'none');
  user.setAttribute('stroke', '#e91e63');
  user.setAttribute('stroke-width', '14');
  user.setAttribute('stroke-linecap', 'round');
  user.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(user);

  canvasWrap.appendChild(svg);
  container.appendChild(canvasWrap);

  const feedback = document.createElement('p');
  feedback.className = 'tracing-feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  container.appendChild(feedback);

  const controls = document.createElement('div');
  controls.className = 'tracing-controls';
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'tracing-reset-btn';
  resetBtn.textContent = 'やりなおし';
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'tracing-next-btn';
  nextBtn.textContent = 'つぎ';
  controls.appendChild(resetBtn);
  controls.appendChild(nextBtn);
  container.appendChild(controls);
}

function initTracingGame() {
  const container = document.getElementById('tracing-game');
  if (!container) return;
  buildUI(container);
  let state = loadShape(container, { currentIndex: 0, userPoints: [], isTracing: false, evaluated: false, successCount: 0, attemptCount: 0 });
}

if (typeof module !== 'undefined') {
  module.exports = {
    calculateAccuracy, generateCircleGuide, generateLineGuide,
    generatePolylineGuide, generateWaveGuide, pointsToString, distance,
    SHAPES, initTracingGame,
  };
}
```

- [ ] **Step 4: テストを実行し成功を確認**

Run: `npm test -- tracing-game.test.js`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add tracing-game.js tracing-game.test.js
git commit -m "feat(tracing): UI構築と図形ロードを追加 (#18)"
```

---

## Task 4: ポインタイベントと軌跡収集

**Files:**
- Modify: `tracing-game.js`
- Modify: `tracing-game.test.js`

- [ ] **Step 1: 失敗テストを書く**

`tracing-game.test.js` に追加。`getBoundingClientRect` をモックして座標変換を固定:
```js
describe('initTracingGame - ポインタイベント', () => {
  let container;
  let origCreateNS;
  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'tracing-game';
    document.body.appendChild(container);
    origCreateNS = document.createElementNS;
    document.createElementNS = function (ns, tag) {
      const el = origCreateNS.call(document, ns, tag);
      if (String(tag).toLowerCase() === 'svg') {
        el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300 });
      }
      return el;
    };
  });
  afterEach(() => {
    if (container.parentNode) document.body.removeChild(container);
    document.createElementNS = origCreateNS;
  });

  function dispatchPointer(svg, type, x, y) {
    const evt = new PointerEvent(type, { clientX: x, clientY: y, bubbles: true });
    svg.dispatchEvent(evt);
  }

  test('pointerdown→move→upでユーザー軌跡が描かれる', () => {
    initTracingGame();
    const svg = container.querySelector('.tracing-canvas');
    const user = container.querySelector('.tracing-user');
    dispatchPointer(svg, 'pointerdown', 250, 150);
    dispatchPointer(svg, 'pointermove', 200, 100);
    dispatchPointer(svg, 'pointermove', 150, 60);
    dispatchPointer(svg, 'pointerup', 150, 60);
    expect(user.getAttribute('points').trim().length).toBeGreaterThan(0);
  });

  test('pointerdown前にmoveしても軌跡は増えない', () => {
    initTracingGame();
    const svg = container.querySelector('.tracing-canvas');
    dispatchPointer(svg, 'pointermove', 200, 100);
    expect(container.querySelector('.tracing-user').getAttribute('points')).toBe('');
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認**

Run: `npm test -- tracing-game.test.js`
Expected: FAIL（軌跡が更新されない）

- [ ] **Step 3: ポインタイベント処理を実装**

`tracing-game.js` の `initTracingGame` を丸ごと下記に置換:
```js
const VIEW_SIZE = 300;
const TOLERANCE = 25;

function getSvgPoint(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  const scaleX = rect.width ? VIEW_SIZE / rect.width : 1;
  const scaleY = rect.height ? VIEW_SIZE / rect.height : 1;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function bindPointerEvents(container, svg, getState, setState) {
  const user = container.querySelector('.tracing-user');

  svg.addEventListener('pointerdown', (e) => {
    const state = getState();
    if (state.evaluated) return;
    const p = getSvgPoint(svg, e.clientX, e.clientY);
    const nextPoints = [...state.userPoints, p];
    user.setAttribute('points', pointsToString(nextPoints));
    setState(Object.assign({}, state, { isTracing: true, userPoints: nextPoints }));
  });

  svg.addEventListener('pointermove', (e) => {
    const state = getState();
    if (!state.isTracing) return;
    const p = getSvgPoint(svg, e.clientX, e.clientY);
    const nextPoints = [...state.userPoints, p];
    user.setAttribute('points', pointsToString(nextPoints));
    setState(Object.assign({}, state, { userPoints: nextPoints }));
  });

  svg.addEventListener('pointerup', () => {
    const state = getState();
    if (!state.isTracing) return;
    setState(Object.assign({}, state, { isTracing: false }));
  });

  svg.addEventListener('pointerleave', () => {
    const state = getState();
    if (state.isTracing) setState(Object.assign({}, state, { isTracing: false }));
  });
}

function initTracingGame() {
  const container = document.getElementById('tracing-game');
  if (!container) return;
  buildUI(container);
  let state = loadShape(container, { currentIndex: 0, userPoints: [], isTracing: false, evaluated: false, successCount: 0, attemptCount: 0 });
  const getState = () => state;
  const setState = (next) => { state = next; };
  const svg = container.querySelector('.tracing-canvas');
  bindPointerEvents(container, svg, getState, setState);
}
```

- [ ] **Step 4: テストを実行し成功を確認**

Run: `npm test -- tracing-game.test.js`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add tracing-game.js tracing-game.test.js
git commit -m "feat(tracing): ポインタイベントによる軌跡収集を追加 (#18)"
```

---

## Task 5: evaluateTrace（精度判定とフィードバック）

**Files:**
- Modify: `tracing-game.js`
- Modify: `tracing-game.test.js`

- [ ] **Step 1: 失敗テストを書く**

`tracing-game.test.js` の「ポインタイベント」`describe` 内に追加（成功ケースはガイド点そのものを入力）:
```js
  test('成功判定(70%以上)で緑フィードバックが出る', () => {
    initTracingGame();
    const svg = container.querySelector('.tracing-canvas');
    const guidePts = container.querySelector('.tracing-guide').getAttribute('points').split(' ');
    const first = guidePts[0].split(',').map(Number);
    dispatchPointer(svg, 'pointerdown', first[0], first[1]);
    for (const pt of guidePts) {
      const [x, y] = pt.split(',').map(Number);
      dispatchPointer(svg, 'pointermove', x, y);
    }
    dispatchPointer(svg, 'pointerup', 0, 0);
    const feedback = container.querySelector('.tracing-feedback');
    expect(feedback.classList.contains('tracing-success')).toBe(true);
    expect(feedback.textContent).not.toBe('');
  });

  test('点数不足のときは再挑戦フィードバック', () => {
    initTracingGame();
    const svg = container.querySelector('.tracing-canvas');
    dispatchPointer(svg, 'pointerdown', 10, 10);
    dispatchPointer(svg, 'pointermove', 12, 12);
    dispatchPointer(svg, 'pointerup', 12, 12);
    const feedback = container.querySelector('.tracing-feedback');
    expect(feedback.classList.contains('tracing-retry')).toBe(true);
  });
```

- [ ] **Step 2: テストを実行し失敗を確認**

Run: `npm test -- tracing-game.test.js`
Expected: FAIL（フィードバックが出ない）

- [ ] **Step 3: evaluateTrace を実装**

`tracing-game.js` の `bindPointerEvents` の前に `evaluateTrace` を追加:
```js
const SUCCESS_THRESHOLD = 70;

function evaluateTrace(container, state, setState) {
  if (state.userPoints.length < 2 || state.evaluated) return;
  const accuracy = calculateAccuracy(state.userPoints, state.currentShape.guidePoints, TOLERANCE);
  const feedback = container.querySelector('.tracing-feedback');
  const success = accuracy >= SUCCESS_THRESHOLD;
  feedback.textContent = success
    ? 'よくできました！ (' + accuracy + '%)'
    : 'もういっかい！ (' + accuracy + '%)';
  feedback.className = 'tracing-feedback ' + (success ? 'tracing-success' : 'tracing-retry');
  setState(Object.assign({}, state, {
    evaluated: true,
    successCount: state.successCount + (success ? 1 : 0),
    attemptCount: state.attemptCount + 1,
  }));
}
```

`bindPointerEvents` の `pointerup` ハンドラを下記に置換:
```js
  svg.addEventListener('pointerup', () => {
    const st = getState();
    if (!st.isTracing) return;
    setState(Object.assign({}, st, { isTracing: false }));
    evaluateTrace(container, getState(), setState);
  });
```

- [ ] **Step 4: テストを実行し成功を確認**

Run: `npm test -- tracing-game.test.js`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add tracing-game.js tracing-game.test.js
git commit -m "feat(tracing): 精度判定とフィードバックを追加 (#18)"
```

---

## Task 6: nextShape / resetShape / 自動初期化

**Files:**
- Modify: `tracing-game.js`
- Modify: `tracing-game.test.js`

- [ ] **Step 1: 失敗テストを書く**

`tracing-game.test.js` の「ポインタイベント」`describe` 内に追加:
```js
  test('やりなおしボタンで軌跡がクリアされる', () => {
    initTracingGame();
    const svg = container.querySelector('.tracing-canvas');
    dispatchPointer(svg, 'pointerdown', 10, 10);
    dispatchPointer(svg, 'pointermove', 20, 20);
    container.querySelector('.tracing-reset-btn').click();
    expect(container.querySelector('.tracing-user').getAttribute('points')).toBe('');
    expect(container.querySelector('.tracing-feedback').textContent).toBe('');
  });

  test('つぎボタンで次の図形に切り替わる', () => {
    initTracingGame();
    expect(container.querySelector('.tracing-shape-name').textContent).toBe(SHAPES[0].name);
    container.querySelector('.tracing-next-btn').click();
    expect(container.querySelector('.tracing-shape-name').textContent).toBe(SHAPES[1].name);
  });

  test('最後の図形のつぎで最初に戻る', () => {
    initTracingGame();
    for (let i = 0; i < SHAPES.length; i++) {
      container.querySelector('.tracing-next-btn').click();
    }
    expect(container.querySelector('.tracing-shape-name').textContent).toBe(SHAPES[0].name);
  });
```

- [ ] **Step 2: テストを実行し失敗を確認**

Run: `npm test -- tracing-game.test.js`
Expected: FAIL（ボタンが動かない）

- [ ] **Step 3: nextShape / resetShape / 自動初期化を実装**

`tracing-game.js` の `initTracingGame` を下記に置換（ボタン登録と自動初期化を追加）:
```js
function bindControls(container, getState, setState) {
  container.querySelector('.tracing-reset-btn').addEventListener('click', () => {
    setState(loadShape(container, getState()));
  });
  container.querySelector('.tracing-next-btn').addEventListener('click', () => {
    const cur = getState();
    const nextIndex = (cur.currentIndex + 1) % SHAPES.length;
    setState(loadShape(container, Object.assign({}, cur, { currentIndex: nextIndex })));
  });
}

function initTracingGame() {
  const container = document.getElementById('tracing-game');
  if (!container) return;
  buildUI(container);
  let state = loadShape(container, { currentIndex: 0, userPoints: [], isTracing: false, evaluated: false, successCount: 0, attemptCount: 0 });
  const getState = () => state;
  const setState = (next) => { state = next; };
  const svg = container.querySelector('.tracing-canvas');
  bindPointerEvents(container, svg, getState, setState);
  bindControls(container, getState, setState);
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initTracingGame);
}
```

- [ ] **Step 4: テストを実行し成功を確認**

Run: `npm test -- tracing-game.test.js`
Expected: PASS（全テスト成功）

- [ ] **Step 5: コミット**

```bash
git add tracing-game.js tracing-game.test.js
git commit -m "feat(tracing): 次図形/リセット/自動初期化を追加 (#18)"
```

---

## Task 7: ages-3-4.html 統合

**Files:**
- Modify: `ages-3-4.html`

- [ ] **Step 1: ナビゲーションボタンを追加**

`ages-3-4.html` の counting ボタン（`id="counting-game-btn-3"` の `</button>`）の直後に追加:
```html
                <button id="tracing-game-btn" class="game-nav-button"
                        role="tab" aria-selected="false" aria-controls="tracing-game-section"
                        aria-label="なぞりあそび - せんをなぞろう">
                    <span class="game-icon" aria-hidden="true">✏️</span>
                    <span class="game-title">なぞり</span>
                    <span class="game-description">せんをなぞろう</span>
                </button>
```

- [ ] **Step 2: セクションを追加**

counting セクション（`id="counting-game-section"` の `</div>` 終了）の直後に追加:
```html
        <!-- なぞりあそびセクション -->
        <div id="tracing-game-section" class="game-section"
             role="tabpanel" aria-labelledby="tracing-game-btn" aria-hidden="true">
            <div id="tracing-game"></div>
        </div>
```

- [ ] **Step 3: script を追加**

`<script src="counting-game.js"></script>` の直後に追加:
```html
    <script src="tracing-game.js"></script>
```

- [ ] **Step 4: switchToGame に tracing ケースを追加**

`switchToGame` 関数内の `else if (gameType === 'counting') {...}` ブロックの直後に追加:
```js
                } else if (gameType === 'tracing') {
                    var section = document.getElementById('tracing-game-section');
                    var button = document.getElementById('tracing-game-btn');
                    section.classList.add('active');
                    section.setAttribute('aria-hidden', 'false');
                    button.classList.add('active');
                    button.setAttribute('aria-selected', 'true');
                }
```

- [ ] **Step 5: ボタンイベントリスナーを追加**

`document.getElementById('counting-game-btn-3').addEventListener(...)` ブロックの直後に追加:
```js
            document.getElementById('tracing-game-btn').addEventListener('click', function() {
                switchToGame('tracing');
            });
```

- [ ] **Step 6: 手動確認**

ブラウザで `ages-3-4.html` を開き、「なぞり」ボタンをクリック → 点線ガイドが表示され、なぞると軌跡が描かれ、フィードバックが出ることを確認。

- [ ] **Step 7: コミット**

```bash
git add ages-3-4.html
git commit -m "feat(tracing): ages-3-4ページに「なぞり」ゲームを統合 (#18)"
```

---

## Task 8: style.css に tracing スタイルを追加

**Files:**
- Modify: `style.css`

- [ ] **Step 1: スタイルを追記**

`style.css` の末尾に追記:
```css
/* ===== なぞりあそび (tracing-game) ===== */
.tracing-game {
  max-width: 360px;
  margin: 0 auto;
  text-align: center;
}

.tracing-header {
  margin-bottom: 12px;
}

.tracing-title {
  font-size: 1.4rem;
  margin: 0 0 4px;
  color: #333;
}

.tracing-shape-name {
  font-size: 1.8rem;
  margin: 0;
  color: #e91e63;
  font-weight: bold;
}

.tracing-canvas-wrap {
  background: #fff;
  border: 4px solid #ffe082;
  border-radius: 16px;
  padding: 8px;
  touch-action: none;
}

.tracing-canvas {
  width: 100%;
  height: auto;
  max-width: 320px;
  display: block;
  margin: 0 auto;
  cursor: pointer;
}

.tracing-feedback {
  font-size: 1.6rem;
  font-weight: bold;
  min-height: 2em;
  margin: 12px 0;
}

.tracing-feedback.tracing-success {
  color: #2e7d32;
}

.tracing-feedback.tracing-retry {
  color: #ef6c00;
}

.tracing-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}

.tracing-controls button {
  font-size: 1.2rem;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: bold;
}

.tracing-reset-btn {
  background: #eceff1;
  color: #455a64;
}

.tracing-next-btn {
  background: #e91e63;
  color: #fff;
}
```

- [ ] **Step 2: 手動確認**

ブラウザで見た目を確認（点線ガイドが薄灰、ユーザー軌跡がピンク、ボタンが丸み）。

- [ ] **Step 3: コミット**

```bash
git add style.css
git commit -m "feat(tracing): なぞりゲームのスタイルを追加 (#18)"
```

---

## Task 9: 最終検証

**Files:** なし（検証のみ）

- [ ] **Step 1: 全テストを実行**

Run: `npm test`
Expected: 全テストファイルが PASS（既存テストの回帰なし + tracing-game.test.js 追加分）

- [ ] **Step 2: 手動E2E確認**

ブラウザで `ages-3-4.html` →「なぞり」→ 6図形すべて表示・なぞり・判定・次図形・リセットが動作することを確認。

- [ ] **Step 3: コンソールエラー確認**

ブラウザの開発者ツールでコンソールエラーがないことを確認。

- [ ] **Step 4: issue クローズ準備**

実装完了後、PR作成時に issue #18 を参照・クローズ。

---

## Appendix: 完成時の tracing-game.js 構成（参照用）

最終的に `tracing-game.js` は以下の順序で構成される:
1. ガイド点群生成関数群（`generateCircleGuide` 等）
2. `distance`, `calculateAccuracy`, `pointsToString`
3. `SHAPES`
4. `createSvgElement`, `loadShape`, `buildUI`
5. 定数（`VIEW_SIZE`, `TOLERANCE`, `SUCCESS_THRESHOLD`）
6. `getSvgPoint`, `bindPointerEvents`, `evaluateTrace`, `bindControls`
7. `initTracingGame`
8. `DOMContentLoaded` 自動初期化
9. `module.exports`

---

## Self-Review（作成後チェック）

- [x] **Spec coverage**: スペックの全要件（3-4歳・6図形・SVG点線・精度判定70%・HTML統合・進捗連携なし・テスト80%+）に各タスクが対応
- [x] **Placeholder scan**: TBD/TODO なし。全ステップに具体コード
- [x] **Type consistency**: `getState`/`setState`, `loadShape`, `evaluateTrace`, `TOLERANCE`, `SUCCESS_THRESHOLD`, `VIEW_SIZE` の名称が全タスクで一貫
- [x] **Security**: `innerHTML` 不使用、全DOM構築は `createElement` + `textContent`
