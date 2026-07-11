/**
 * ものがたりづくり（物語作成ツール）
 * Story Creator for ages 9-10
 *
 * 分岐する物語を読み進め、選択肢で展開を変える。最後まで読むと
 * その物語（たどった経路）を localStorage に保存し、後で読み返せる。
 */

function initStoryCreator() {
    const gameContainer = document.getElementById('story-creator');
    if (!gameContainer) return;

    const story = {
        start: {
            text: 'きょうは ゆうぐれ。きみは もりの みちに たどりついた。',
            choices: [
                { label: 'みぎへ いく', next: 'river' },
                { label: 'ひだりへ いく', next: 'cave' },
            ],
        },
        river: {
            text: 'みちを みぎに いくと、きれいな かわが あった。',
            choices: [
                { label: 'かわを わたる', next: 'treasure' },
                { label: 'もとへ もどる', next: 'start' },
            ],
        },
        cave: {
            text: 'みちを ひだりに いくと、くらい どうくつが あった。',
            choices: [
                { label: 'なかにはいる', next: 'bat' },
                { label: 'もとへ もどる', next: 'start' },
            ],
        },
        treasure: { text: 'かわの むこうで、ひかる たからものを みつけた！', choices: [] },
        bat: { text: 'こうもりが びっくりして とんでいった。きみは いえへ にげた。', choices: [] },
    };

    const STORAGE_KEY = 'story-creator-saved';
    let path = [];

    function loadSaved() {
        try {
            const data = window.localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveSaved(list) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            // 保存失敗は無視
        }
    }

    function buildUI() {
        gameContainer.textContent = '';

        const header = document.createElement('div');
        header.className = 'story-header';
        const title = document.createElement('h2');
        title.textContent = 'ものがたりづくり';
        header.appendChild(title);

        const restart = document.createElement('button');
        restart.className = 'story-restart-btn';
        restart.id = 'story-restart-btn';
        restart.textContent = 'はじめから';
        restart.addEventListener('click', startStory);
        header.appendChild(restart);
        gameContainer.appendChild(header);

        const scene = document.createElement('div');
        scene.className = 'story-scene';
        scene.id = 'story-scene';
        gameContainer.appendChild(scene);

        const savedTitle = document.createElement('h3');
        savedTitle.className = 'story-saved-title';
        savedTitle.textContent = '保存した ものがたり';
        gameContainer.appendChild(savedTitle);

        const savedArea = document.createElement('div');
        savedArea.className = 'story-saved';
        savedArea.id = 'story-saved';
        gameContainer.appendChild(savedArea);
    }

    function startStory() {
        path = [];
        showNode('start');
    }

    function showNode(id, resetPath = false) {
        const node = story[id];
        if (!node) return;
        
        if (resetPath) {
            path = [];
        }
        path.push(node.text);

    function showNode(id) {
        const node = story[id];
        if (!node) return;
        path.push(node.text);

        const scene = document.getElementById('story-scene');
        scene.textContent = '';

        const textEl = document.createElement('p');
        textEl.className = 'story-text';
        textEl.id = 'story-text';
        textEl.textContent = node.text;
        scene.appendChild(textEl);

        const choicesEl = document.createElement('div');
        choicesEl.className = 'story-choices';
        choicesEl.id = 'story-choices';
        scene.appendChild(choicesEl);

        if (node.choices.length === 0) {
            const endEl = document.createElement('p');
            endEl.className = 'story-end';
            endEl.textContent = '〜 おしまい 〜';
            scene.appendChild(endEl);
            saveStory(path);
            renderSaved();
        } else {
            node.choices.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'story-choice-btn';
                btn.textContent = c.label;
                btn.dataset.next = c.next;
                btn.addEventListener('click', () => showNode(c.next));
                choicesEl.appendChild(btn);
            });
        }
    }

    function saveStory(storyPath) {
        const list = loadSaved();
        list.push({ text: storyPath.join(' '), index: list.length + 1 });
        saveSaved(list);
    }

    function renderSaved() {
        const area = document.getElementById('story-saved');
        area.textContent = '';

        const list = loadSaved();
        if (list.length === 0) {
            area.textContent = 'まだありません。ものがたりを さいごまで よむと 保存されます。';
            return;
        }
        list.forEach((s, i) => {
            const item = document.createElement('div');
            item.className = 'story-saved-item';
            item.textContent = (i + 1) + 'ばんめの ものがたり';
            item.addEventListener('click', () => showSaved(s));
            area.appendChild(item);
        });
    }

    function showSaved(s) {
        const scene = document.getElementById('story-scene');
        scene.textContent = '';
        const textEl = document.createElement('p');
        textEl.className = 'story-text';
        textEl.id = 'story-text';
        textEl.textContent = s.text;
        scene.appendChild(textEl);
    }

    buildUI();
    startStory();
    renderSaved();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initStoryCreator);
}

if (typeof module !== 'undefined') {
    module.exports = { initStoryCreator };
}
