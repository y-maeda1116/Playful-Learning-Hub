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
