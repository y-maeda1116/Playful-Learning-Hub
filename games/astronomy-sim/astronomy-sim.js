/**
 * ほしぞら観察（天体観測シミュレーション）
 * Astronomy Simulation for ages 9-10
 *
 * Canvas に簡易星空を描画。時間スライダーで星空が回転し、
 * 星座をクリックすると名前と説明を表示。本格的な天体計算は行わない。
 * 回転計算は純粋関数（getSkyRotation / rotatePoint）として分離しテスト可能。
 */

function getSkyRotation(hour) {
    // 0-24時 → 0-360度（1日で1回転）
    return (hour / 24) * 360;
}

function rotatePoint(x, y, deg) {
    var rad = deg * Math.PI / 180;
    return {
        x: x * Math.cos(rad) - y * Math.sin(rad),
        y: x * Math.sin(rad) + y * Math.cos(rad)
    };
}

var CONSTELLATIONS = [
    {
        name: 'オリオンざ',
        stars: [{ x: -0.35, y: -0.1 }, { x: -0.15, y: 0.05 }, { x: 0.05, y: -0.05 }, { x: 0.25, y: 0.1 }],
        lines: [[0, 1], [1, 2], [2, 3]],
        info: '冬のゆうがたに みえる、ゆうめいな星座だよ！'
    },
    {
        name: 'おおぐまざ',
        stars: [{ x: 0.3, y: -0.35 }, { x: 0.45, y: -0.2 }, { x: 0.5, y: 0 }, { x: 0.4, y: 0.15 }],
        lines: [[0, 1], [1, 2], [2, 3]],
        info: '北斗七星を ふくむ、おおきな くまの 星座だよ！'
    },
    {
        name: 'カシオペアざ',
        stars: [{ x: -0.4, y: 0.3 }, { x: -0.25, y: 0.2 }, { x: -0.1, y: 0.35 }, { x: 0.05, y: 0.2 }],
        lines: [[0, 1], [1, 2], [2, 3]],
        info: 'Wのかたちをした 星座だよ！'
    }
];

function initAstronomySim() {
    var container = document.getElementById('astronomy-sim');
    if (!container) return;

    var hour = 21;
    var zoom = 1;

    function buildUI() {
        container.textContent = '';

        var header = document.createElement('div');
        header.className = 'astro-header';
        var title = document.createElement('h2');
        title.textContent = 'ほしぞら観察';
        header.appendChild(title);
        container.appendChild(header);

        var canvasWrap = document.createElement('div');
        canvasWrap.className = 'astro-canvas-wrap';
        var canvas = document.createElement('canvas');
        canvas.id = 'astro-canvas';
        canvas.className = 'astro-canvas';
        canvas.width = 300;
        canvas.height = 300;
        canvasWrap.appendChild(canvas);
        container.appendChild(canvasWrap);

        var controls = document.createElement('div');
        controls.className = 'astro-controls';

        var sliderLabel = document.createElement('label');
        sliderLabel.className = 'astro-field';
        sliderLabel.textContent = 'じかん：';
        var slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '24';
        slider.value = String(hour);
        slider.id = 'astro-hour';
        slider.className = 'astro-slider';
        sliderLabel.appendChild(slider);
        controls.appendChild(sliderLabel);

        var hourLabel = document.createElement('span');
        hourLabel.id = 'astro-hour-label';
        hourLabel.textContent = hour + '時';
        controls.appendChild(hourLabel);

        var zoomIn = document.createElement('button');
        zoomIn.className = 'astro-zoom-btn';
        zoomIn.id = 'astro-zoom-in';
        zoomIn.textContent = '＋ おおきく';
        zoomIn.addEventListener('click', function () { zoom = Math.min(2, zoom + 0.2); render(); });
        controls.appendChild(zoomIn);

        var zoomOut = document.createElement('button');
        zoomOut.className = 'astro-zoom-btn';
        zoomOut.id = 'astro-zoom-out';
        zoomOut.textContent = '－ ちいさく';
        zoomOut.addEventListener('click', function () { zoom = Math.max(0.5, zoom - 0.2); render(); });
        controls.appendChild(zoomOut);

        container.appendChild(controls);

        var info = document.createElement('div');
        info.className = 'astro-info';
        info.id = 'astro-info';
        info.textContent = 'ほしや星座を クリックしてみよう！';
        container.appendChild(info);

        slider.addEventListener('input', function () {
            hour = parseInt(slider.value, 10);
            hourLabel.textContent = hour + '時';
            render();
        });

        canvas.addEventListener('click', function (e) { handleCanvasClick(e, canvas); });

        render();
    }

    function render() {
        var canvas = document.getElementById('astro-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return; // テスト環境（jsdom）など未対応なら何もしない

        var w = canvas.width, h = canvas.height;
        var cx = w / 2, cy = h / 2;
        var rot = getSkyRotation(hour);

        ctx.fillStyle = '#1a237e';
        ctx.fillRect(0, 0, w, h);

        CONSTELLATIONS.forEach(function (c) {
            var pts = c.stars.map(function (s) {
                var r = rotatePoint(s.x, s.y, rot);
                return { x: cx + r.x * 150 * zoom, y: cy + r.y * 150 * zoom };
            });
            ctx.strokeStyle = '#90caf9';
            ctx.lineWidth = 1;
            ctx.beginPath();
            c.lines.forEach(function (l) {
                ctx.moveTo(pts[l[0]].x, pts[l[0]].y);
                ctx.lineTo(pts[l[1]].x, pts[l[1]].y);
            });
            ctx.stroke();

            ctx.fillStyle = '#fff59d';
            pts.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    function handleCanvasClick(e, canvas) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var cx = canvas.width / 2, cy = canvas.height / 2;
        var rot = getSkyRotation(hour);

        var found = null;
        var minDist = 999;
        CONSTELLATIONS.forEach(function (c) {
            c.stars.forEach(function (s) {
                var r = rotatePoint(s.x, s.y, rot);
                var px = cx + r.x * 150 * zoom;
                var py = cy + r.y * 150 * zoom;
                var d = Math.sqrt((px - mx) * (px - mx) + (py - my) * (py - my));
                if (d < 20 && d < minDist) {
                    minDist = d;
                    found = c;
                }
            });
        });

        var info = document.getElementById('astro-info');
        if (!info) return;
        if (found) {
            info.textContent = '✨ ' + found.name + ' ✨ ' + found.info;
        } else {
            info.textContent = 'ここには みあたらないよ。ほかのほしを ためしてみてね！';
        }
    }

    buildUI();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initAstronomySim);
}

if (typeof module !== 'undefined') {
    module.exports = { initAstronomySim, getSkyRotation, rotatePoint };
}
