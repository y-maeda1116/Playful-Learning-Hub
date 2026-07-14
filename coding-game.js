/**
 * プログラミングあそび（プログラミング基礎ゲーム）
 * Coding Game for ages 7-8
 *
 * ブロック（まえへ/みぎ/ひだり）をクリックでプログラムに並べ、実行すると
 * キャラがグリッド上を動く。ゴールに届けばクリア、複数ステージ。
 */

function initCodingGame() {
    var container = document.getElementById('coding-game');
    if (!container) return;

    var GRID = 5;
    // direction: 0=up, 1=right, 2=down, 3=left
    var DIR_VEC = { 0: [0, -1], 1: [1, 0], 2: [0, 1], 3: [-1, 0] };

    var stages = [
        { start: { x: 0, y: 4, dir: 1 }, goal: { x: 4, y: 4 } },
        { start: { x: 0, y: 0, dir: 2 }, goal: { x: 0, y: 4 } },
        { start: { x: 0, y: 0, dir: 1 }, goal: { x: 4, y: 4 } },
    ];

    var stageIdx = 0;
    var player = { x: 0, y: 0, dir: 0 };
    var program = [];
    var running = false;
    var timer = null;

    function loadStage(i) {
        var s = stages[i];
        player = { x: s.start.x, y: s.start.y, dir: s.start.dir };
        program = [];
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        render();
    }

    function buildUI() {
        container.textContent = '';

        var header = document.createElement('div');
        header.className = 'coding-header';
        var title = document.createElement('h2');
        title.textContent = 'プログラミングあそび';
        header.appendChild(title);
        var stageLabel = document.createElement('span');
        stageLabel.className = 'coding-stage';
        stageLabel.id = 'coding-stage';
        header.appendChild(stageLabel);
        container.appendChild(header);

        var grid = document.createElement('div');
        grid.className = 'coding-grid';
        grid.id = 'coding-grid';
        container.appendChild(grid);

        var palette = document.createElement('div');
        palette.className = 'coding-palette';
        palette.id = 'coding-palette';
        [['forward', 'まえへ 1マス'], ['right', 'みぎに まわる'], ['left', 'ひだりに まわる']].forEach(function (pair) {
            var btn = document.createElement('button');
            btn.className = 'coding-block-btn';
            btn.textContent = pair[1];
            btn.dataset.type = pair[0];
            btn.addEventListener('click', function () { addBlock(pair[0]); });
            palette.appendChild(btn);
        });
        container.appendChild(palette);

        var progLabel = document.createElement('h3');
        progLabel.textContent = 'プログラム（ならんだ じゅん）';
        container.appendChild(progLabel);

        var programEl = document.createElement('div');
        programEl.className = 'coding-program';
        programEl.id = 'coding-program';
        container.appendChild(programEl);

        var controls = document.createElement('div');
        controls.className = 'coding-controls';

        var runBtn = document.createElement('button');
        runBtn.className = 'coding-run-btn';
        runBtn.id = 'coding-run-btn';
        runBtn.textContent = 'じっこう';
        runBtn.addEventListener('click', run);
        controls.appendChild(runBtn);

        var clearBtn = document.createElement('button');
        clearBtn.className = 'coding-clear-btn';
        clearBtn.textContent = 'プログラムを けす';
        clearBtn.addEventListener('click', function () { program = []; renderProgram(); });
        controls.appendChild(clearBtn);

        var resetBtn = document.createElement('button');
        resetBtn.className = 'coding-reset-btn';
        resetBtn.textContent = 'もういちど';
        resetBtn.addEventListener('click', function () { loadStage(stageIdx); });
        controls.appendChild(resetBtn);

        container.appendChild(controls);

        var msg = document.createElement('p');
        msg.className = 'coding-message';
        msg.id = 'coding-message';
        container.appendChild(msg);

        loadStage(stageIdx);
    }

    function addBlock(type) {
        if (running) return;
        program.push({ type: type });
        renderProgram();
    }

    function blockLabel(type) {
        return { forward: 'まえへ', right: 'みぎ', left: 'ひだり' }[type];
    }

    function renderProgram() {
        var el = document.getElementById('coding-program');
        el.textContent = '';
        if (program.length === 0) {
            el.textContent = 'ブロックを ついかしてね';
            return;
        }
        program.forEach(function (b, i) {
            var chip = document.createElement('span');
            chip.className = 'coding-chip coding-chip-' + b.type;
            chip.textContent = (i + 1) + '. ' + blockLabel(b.type);
            el.appendChild(chip);
        });
    }

    function render() {
        var stage = stages[stageIdx];
        var grid = document.getElementById('coding-grid');
        grid.textContent = '';
        for (var y = 0; y < GRID; y++) {
            for (var x = 0; x < GRID; x++) {
                var cell = document.createElement('div');
                cell.className = 'coding-cell';
                if (x === stage.goal.x && y === stage.goal.y) {
                    cell.classList.add('goal');
                    cell.textContent = '🎯';
                }
                if (x === player.x && y === player.y) {
                    cell.classList.add('player');
                    cell.textContent = '🐱';
                }
                grid.appendChild(cell);
            }
        }
        document.getElementById('coding-stage').textContent = 'ステージ ' + (stageIdx + 1);
        renderProgram();
    }

    function run() {
        if (running) return;
        if (program.length === 0) {
            setMessage('ブロックを ならべてね', '');
            return;
        }
        running = true;
        setMessage('じっこうちゅう...', '');
        var step = 0;
        timer = setInterval(function () {
            if (step >= program.length) {
                clearInterval(timer);
                timer = null;
                running = false;
                checkResult();
                return;
            }
            execute(program[step].type);
            step++;
        }, 500);
    }

    function execute(type) {
        if (type === 'forward') {
            var vec = DIR_VEC[player.dir];
            var nx = player.x + vec[0];
            var ny = player.y + vec[1];
            if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
                player.x = nx;
                player.y = ny;
            }
        } else if (type === 'right') {
            player.dir = (player.dir + 1) % 4;
        } else if (type === 'left') {
            player.dir = (player.dir + 3) % 4;
        }
        render();
    }

    function checkResult() {
        var goal = stages[stageIdx].goal;
        if (player.x === goal.x && player.y === goal.y) {
            setMessage('クリア！やったー！ 🎉', 'success');
            if (stageIdx < stages.length - 1) {
                stageIdx++;
                setTimeout(function () { loadStage(stageIdx); }, 1500);
            }
        } else {
            setMessage('ゴールに つかなかったよ。もういっかい！', 'fail');
        }
    }

    function setMessage(text, kind) {
        var el = document.getElementById('coding-message');
        el.textContent = text;
        el.className = 'coding-message' + (kind ? ' ' + kind : '');
    }

    buildUI();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initCodingGame);
}

if (typeof module !== 'undefined') {
    module.exports = { initCodingGame };
}
