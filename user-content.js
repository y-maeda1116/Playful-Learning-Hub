/**
 * クイズをつくろう（ユーザー作成コンテンツ）
 * User-Generated Content (all ages)
 *
 * 子どもが自分でクイズを作って遊べる（localStorage 版：同ブラウザ内で作成・保存・プレイ）。
 * NGワードの簡易フィルタと、不適切内容の報告マーク機能付き。
 * 静的サイト（バックエンドなし）のため「他ユーザーとの公開共有」は不可。
 */

function initUserContent() {
    const container = document.getElementById('user-content');
    if (!container) return;

    var STORAGE_KEY = 'user-content-quizzes';
    var NG_WORDS = ['ばか', 'あほ', 'しね', 'くそ', 'まぬけ'];

    var playTarget = null;

    function loadQuizzes() {
        try {
            var data = window.localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveQuizzes(list) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            // 保存失敗は無視
        }
    }

    function hasNgWord(text) {
        var s = String(text);
        return NG_WORDS.some(function (w) { return s.indexOf(w) !== -1; });
    }

    function buildUI() {
        container.textContent = '';

        var header = document.createElement('div');
        header.className = 'user-content-header';
        var title = document.createElement('h2');
        title.textContent = 'クイズをつくろう';
        header.appendChild(title);
        container.appendChild(header);

        var body = document.createElement('div');
        body.className = 'user-content-body';
        body.id = 'user-content-body';
        container.appendChild(body);

        renderMenu();
    }

    function renderMenu() {
        var body = document.getElementById('user-content-body');
        body.textContent = '';

        var createBtn = document.createElement('button');
        createBtn.className = 'uc-button uc-primary';
        createBtn.id = 'uc-create-btn';
        createBtn.textContent = '新しいクイズをつくる';
        createBtn.addEventListener('click', renderCreateForm);
        body.appendChild(createBtn);

        var listTitle = document.createElement('h3');
        listTitle.textContent = 'つくったクイズ';
        body.appendChild(listTitle);

        var list = loadQuizzes();
        var listEl = document.createElement('div');
        listEl.className = 'uc-list';
        listEl.id = 'uc-list';
        if (list.length === 0) {
            listEl.textContent = 'まだありません。つくってみよう！';
        } else {
            list.forEach(function (q) { listEl.appendChild(makeQuizCard(q)); });
        }
        body.appendChild(listEl);
    }

    function makeQuizCard(q) {
        var card = document.createElement('div');
        card.className = 'uc-card' + (q.reported ? ' reported' : '');

        var title = document.createElement('p');
        title.className = 'uc-card-title';
        title.textContent = q.question;
        card.appendChild(title);

        var playBtn = document.createElement('button');
        playBtn.className = 'uc-button';
        playBtn.textContent = 'あそぶ';
        playBtn.addEventListener('click', function () { playTarget = q; renderPlay(); });
        card.appendChild(playBtn);

        var reportBtn = document.createElement('button');
        reportBtn.className = 'uc-button uc-warn';
        reportBtn.textContent = 'ほうこく';
        reportBtn.addEventListener('click', function () { reportQuiz(q.id); });
        card.appendChild(reportBtn);

        var delBtn = document.createElement('button');
        delBtn.className = 'uc-button uc-danger';
        delBtn.textContent = 'けす';
        delBtn.addEventListener('click', function () { deleteQuiz(q.id); });
        card.appendChild(delBtn);

        return card;
    }

    function renderCreateForm() {
        var body = document.getElementById('user-content-body');
        body.textContent = '';

        var backBtn = document.createElement('button');
        backBtn.className = 'uc-button';
        backBtn.textContent = 'もどる';
        backBtn.addEventListener('click', renderMenu);
        body.appendChild(backBtn);

        var qLabel = document.createElement('label');
        qLabel.className = 'uc-field';
        qLabel.textContent = 'もんだい：';
        var qInput = document.createElement('input');
        qInput.type = 'text';
        qInput.id = 'uc-question';
        qInput.className = 'uc-input';
        qLabel.appendChild(qInput);
        body.appendChild(qLabel);

        for (var i = 0; i < 4; i++) {
            var field = document.createElement('div');
            field.className = 'uc-field';

            var label = document.createElement('span');
            label.textContent = 'せんたし' + (i + 1) + '：';
            field.appendChild(label);

            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'uc-input uc-choice';
            input.dataset.index = String(i);
            field.appendChild(input);

            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'uc-answer';
            radio.value = String(i);
            radio.className = 'uc-answer-radio';
            radio.setAttribute('aria-label', 'せんたし' + (i + 1) + 'をせいかいにする');
            field.appendChild(radio);

            body.appendChild(field);
        }

        var msg = document.createElement('p');
        msg.className = 'uc-message';
        msg.id = 'uc-message';
        body.appendChild(msg);

        var saveBtn = document.createElement('button');
        saveBtn.className = 'uc-button uc-primary';
        saveBtn.id = 'uc-save-btn';
        saveBtn.textContent = 'ほぞん';
        saveBtn.addEventListener('click', saveNewQuiz);
        body.appendChild(saveBtn);
    }

    function saveNewQuiz() {
        var qInput = document.getElementById('uc-question');
        var msg = document.getElementById('uc-message');
        var choices = Array.prototype.slice.call(document.querySelectorAll('.uc-choice'))
            .map(function (i) { return i.value.trim(); });
        var radio = document.querySelector('.uc-answer-radio:checked');

        var question = (qInput.value || '').trim();
        if (!question) {
            msg.textContent = 'もんだいを いれてね';
            return;
        }
        if (choices.some(function (c) { return !c; })) {
            msg.textContent = 'せんたしを 4つ すべて いれてね';
            return;
        }
        if (!radio) {
            msg.textContent = 'せいかいの せんたしを えらんでね';
            return;
        }
        if (hasNgWord(question) || choices.some(hasNgWord)) {
            msg.textContent = 'もうしわけない、つかえない ことばが あります';
            return;
        }

        var answerIndex = parseInt(radio.value, 10);
        var list = loadQuizzes();
        list.push({
            id: 'q' + list.length + '-' + question.length,
            question: question,
            choices: choices,
            answerIndex: answerIndex,
            reported: false
        });
        saveQuizzes(list);
        renderMenu();
    }

    function renderPlay() {
        var body = document.getElementById('user-content-body');
        body.textContent = '';
        var q = playTarget;
        if (!q) {
            renderMenu();
            return;
        }

        var backBtn = document.createElement('button');
        backBtn.className = 'uc-button';
        backBtn.textContent = 'もどる';
        backBtn.addEventListener('click', renderMenu);
        body.appendChild(backBtn);

        var qEl = document.createElement('p');
        qEl.className = 'uc-play-question';
        qEl.id = 'uc-play-question';
        qEl.textContent = q.question;
        body.appendChild(qEl);

        var choicesEl = document.createElement('div');
        choicesEl.className = 'uc-play-choices';
        choicesEl.id = 'uc-play-choices';
        q.choices.forEach(function (c, i) {
            var btn = document.createElement('button');
            btn.className = 'uc-choice-btn';
            btn.textContent = c;
            btn.dataset.index = String(i);
            btn.addEventListener('click', function () { answerPlay(i, btn); });
            choicesEl.appendChild(btn);
        });
        body.appendChild(choicesEl);

        var feedback = document.createElement('p');
        feedback.className = 'uc-feedback';
        feedback.id = 'uc-feedback';
        body.appendChild(feedback);
    }

    function answerPlay(selected, btn) {
        var feedback = document.getElementById('uc-feedback');
        if (selected === playTarget.answerIndex) {
            btn.classList.add('correct');
            feedback.textContent = 'せいかい！ 🎉';
            feedback.className = 'uc-feedback correct';
        } else {
            btn.classList.add('incorrect');
            feedback.textContent = 'ざんねん... せいかいは「' + playTarget.choices[playTarget.answerIndex] + '」だよ';
            feedback.className = 'uc-feedback incorrect';
        }
    }

    function reportQuiz(id) {
        var list = loadQuizzes();
        var q = list.find(function (x) { return x.id === id; });
        if (q) {
            q.reported = true;
            saveQuizzes(list);
            renderMenu();
        }
    }

    function deleteQuiz(id) {
        var list = loadQuizzes().filter(function (x) { return x.id !== id; });
        saveQuizzes(list);
        renderMenu();
    }

    buildUI();
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initUserContent);
}

if (typeof module !== 'undefined') {
    module.exports = { initUserContent };
}
