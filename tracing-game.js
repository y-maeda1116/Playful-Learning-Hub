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
    guidePoints: generateLineGuide(40, 150, 260, 40, 40),
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

if (typeof module !== 'undefined') {
  module.exports = {
    calculateAccuracy, generateCircleGuide, generateLineGuide,
    generatePolylineGuide, generateWaveGuide, pointsToString, distance, SHAPES,
  };
}
