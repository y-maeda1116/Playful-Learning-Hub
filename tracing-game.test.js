const {
  calculateAccuracy, generateCircleGuide, generateLineGuide,
  generatePolylineGuide, generateWaveGuide, pointsToString, SHAPES, initTracingGame,
} = require('./tracing-game.js');

// jsdom 26.x does not expose a global PointerEvent constructor.
// Alias it to MouseEvent (which PointerEvent extends in browsers) so the
// pointer-event tests below can construct events exactly as written.
if (typeof PointerEvent === 'undefined' && typeof MouseEvent !== 'undefined') {
  global.PointerEvent = MouseEvent;
}

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
  test('line図形は水平直線（yが一定）', () => {
    const line = SHAPES.find(s => s.id === 'line');
    const ys = line.guidePoints.map(p => p.y);
    expect(ys.every(y => y === ys[0])).toBe(true);
  });
  test('難易度順（昇順）に並んでいる', () => {
    const diffs = SHAPES.map(s => s.difficulty);
    const sorted = [...diffs].sort((a, b) => a - b);
    expect(diffs).toEqual(sorted);
  });
});

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
});
