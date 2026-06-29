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

const SHAPES = Object.freeze([
  {
    id: 'circle', name: 'まる', difficulty: 1,
    guidePoints: generateCircleGuide(150, 150, 100, 60),
  },
  {
    id: 'line', name: 'まっすぐ', difficulty: 1,
    guidePoints: generateLineGuide(40, 150, 260, 150, 40),
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
    const st = getState();
    if (!st.isTracing) return;
    setState(Object.assign({}, st, { isTracing: false }));
    evaluateTrace(container, getState(), setState);
  });

  svg.addEventListener('pointerleave', () => {
    const state = getState();
    if (state.isTracing) setState(Object.assign({}, state, { isTracing: false }));
  });
}

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

if (typeof module !== 'undefined') {
  module.exports = {
    calculateAccuracy, generateCircleGuide, generateLineGuide,
    generatePolylineGuide, generateWaveGuide, pointsToString, distance, SHAPES,
    initTracingGame,
  };
}
