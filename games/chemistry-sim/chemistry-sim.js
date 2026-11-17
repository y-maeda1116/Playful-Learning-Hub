/**
 * かがくじっけん（化学実験シミュレーション）
 * Chemistry Simulation for ages 11-12
 *
 * 2つの薬品を選んで「まぜる」ことで化学反応（色変化・泡）を再現し、
 * 結果の説明を表示する。物理計算は不要、反応ルールはデータ駆動。
 */

function initChemistrySim() {
    const gameContainer = document.getElementById('chemistry-sim');
    if (!gameContainer) return;

    const chemicals = [
        { id: 'water', name: 'みず', color: '#bbdefb', emoji: '💧' },
        { id: 'acid', name: 'さん', color: '#fff176', emoji: '🍋' },
        { id: 'base', name: 'えんき', color: '#ce93d8', emoji: '🧪' },
        { id: 'metal', name: 'きんぞく', color: '#bdbdbd', emoji: '⚙️' },
    ];

    const reactions = [
        { ids: ['acid', 'base'], name: 'ちゅうわ（中和）', color: '#81c784', bubble: true, explain: 'さんとえんきがはんのうして、みずとしおができるよ！' },
        { ids: ['acid', 'metal'], name: 'すいそがでる', color: '#fff9c4', bubble: true, explain: 'さんがきんぞくをとかして、すいそがしゅつげん！' },
        { ids: ['water', 'acid'], name: 'うすまる', color: '#fff59d', bubble: false, explain: 'みずでさんがうすくなったよ。' },
        { ids: ['water', 'base'], name: 'ようえき', color: '#e1bee7', bubble: false, explain: 'みずにえんきがとけて、ようえきになったよ。' },
    ];

    let selected = []; // 選んだ薬品id（最大2）

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'chemistry-header';
        const title = document.createElement('h2');
        title.textContent = 'かがくじっけん';
        header.appendChild(title);
        gameContainer.appendChild(header);

        const guide = document.createElement('p');
        guide.className = 'chemistry-guide';
        guide.id = 'chemistry-guide';
        guide.textContent = 'ざいやくを2つえらんで「まぜる」をおそう！';
        gameContainer.appendChild(guide);

        // ビーカー
        const beaker = document.createElement('div');
        beaker.className = 'chemistry-beaker';
        const liquid = document.createElement('div');
        liquid.className = 'chemistry-liquid';
        liquid.id = 'chemistry-liquid';
        beaker.appendChild(liquid);
        gameContainer.appendChild(beaker);

        // 薬品ボタン
        const shelf = document.createElement('div');
        shelf.className = 'chemistry-shelf';
        shelf.id = 'chemistry-shelf';
        chemicals.forEach(chem => {
            const btn = document.createElement('button');
            btn.className = 'chemistry-chem-btn';
            btn.textContent = chem.emoji + ' ' + chem.name;
            btn.dataset.id = chem.id;
            btn.addEventListener('click', () => toggleChemical(chem.id, btn));
            shelf.appendChild(btn);
        });
        gameContainer.appendChild(shelf);

        // 操作ボタン
        const controls = document.createElement('div');
        controls.className = 'chemistry-controls';

        const mixBtn = document.createElement('button');
        mixBtn.className = 'chemistry-mix-btn';
        mixBtn.id = 'chemistry-mix-btn';
        mixBtn.textContent = 'まぜる';
        mixBtn.disabled = true;
        mixBtn.addEventListener('click', mix);
        controls.appendChild(mixBtn);

        const resetBtn = document.createElement('button');
        resetBtn.className = 'chemistry-reset-btn';
        resetBtn.textContent = 'やりなおし';
        resetBtn.addEventListener('click', resetSelection);
        controls.appendChild(resetBtn);

        gameContainer.appendChild(controls);

        // 結果
        const result = document.createElement('div');
        result.className = 'chemistry-result';
        result.id = 'chemistry-result';
        gameContainer.appendChild(result);
    }

    function toggleChemical(id, btn) {
        // 結果表示後の選択は自動リセット
        const result = document.getElementById('chemistry-result');
        if (result.dataset.done === 'true') {
            resetSelection();
        }

        if (selected.includes(id)) {
            selected = selected.filter(x => x !== id);
            btn.classList.remove('selected');
        } else {
            if (selected.length >= 2) return;
            selected.push(id);
            btn.classList.add('selected');
        }
        updateBeaker();
        updateMixButton();
    }

    function updateBeaker() {
        const liquid = document.getElementById('chemistry-liquid');
        liquid.classList.remove('bubble');
        if (selected.length === 0) {
            liquid.style.background = '#e0e0e0';
            liquid.textContent = '';
        } else if (selected.length === 1) {
            const chem = chemicals.find(c => c.id === selected[0]);
            liquid.style.background = chem.color;
            liquid.textContent = chem.emoji;
        } else {
            liquid.style.background = '#cccccc';
            liquid.textContent = selected
                .map(id => chemicals.find(c => c.id === id).emoji).join(' + ');
        }
    }

    function updateMixButton() {
        const mixBtn = document.getElementById('chemistry-mix-btn');
        mixBtn.disabled = selected.length !== 2;
    }

    function findReaction(ids) {
        return reactions.find(r =>
            r.ids.length === ids.length &&
            r.ids.every(id => ids.includes(id))
        );
    }

    function mix() {
        if (selected.length !== 2) return;
        const reaction = findReaction(selected);
        const liquid = document.getElementById('chemistry-liquid');
        const result = document.getElementById('chemistry-result');
        result.textContent = '';

        if (reaction) {
            liquid.style.background = reaction.color;
            liquid.classList.toggle('bubble', reaction.bubble);

            const nameEl = document.createElement('p');
            nameEl.className = 'chemistry-reaction-name';
            nameEl.textContent = reaction.name;
            const explainEl = document.createElement('p');
            explainEl.className = 'chemistry-explain';
            explainEl.textContent = reaction.explain;
            result.appendChild(nameEl);
            result.appendChild(explainEl);
        } else {
            const noReact = document.createElement('p');
            noReact.className = 'chemistry-no-reaction';
            noReact.textContent = 'ふしぎ！ はんのうしなかったよ。';
            result.appendChild(noReact);
        }
        result.dataset.done = 'true';
    }

    function resetSelection() {
        selected = [];
        document.querySelectorAll('.chemistry-chem-btn').forEach(b => b.classList.remove('selected'));
        const result = document.getElementById('chemistry-result');
        result.textContent = '';
        result.dataset.done = 'false';
        updateBeaker();
        updateMixButton();
    }

    buildUI();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initChemistrySim);
}

if (typeof module !== 'undefined') {
    module.exports = { initChemistrySim };
}
