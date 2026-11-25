/**
 * きせつのイベント（季節のイベント機能）
 * Seasonal Event feature (all ages)
 *
 * 期間中（ハロウィン/お正月など）だけ index.html のバナー(#seasonal-banner)に
 * イベントを表示し、「あそぶ」で季節のミニクイズを開く。
 * 日付は引数で注入可能（テスト容易化）。本番は new Date()。
 */

function getSeasonalEvent(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 10 && day >= 15) || (month === 11 && day <= 5)) {
        return { key: 'halloween', name: 'ハロウィン', emoji: '🎃' };
    }
    if ((month === 12 && day >= 20) || (month === 1 && day <= 5)) {
        return { key: 'newyear', name: 'おしょうがつ', emoji: '🎎' };
    }
    return null;
}

const seasonalQuizzes = {
    halloween: {
        question: 'ハロウィンで おばけに なるために かぶる ものは？',
        choices: ['おばけのかめん', 'ぼうし', 'くつした'],
        answer: 'おばけのかめん',
    },
    newyear: {
        question: 'おしょうがつに あそぶ まわす おもちゃは？',
        choices: ['こま', 'ボール', 'たまご'],
        answer: 'こま',
    },
};

function initSeasonalEvent(now) {
    const banner = document.getElementById('seasonal-banner');
    if (!banner) return;

    const date = now || new Date();
    const event = getSeasonalEvent(date);

    banner.textContent = '';
    if (!event) {
        return;
    }

    const card = document.createElement('div');
    card.className = 'seasonal-card seasonal-' + event.key;

    const icon = document.createElement('span');
    icon.className = 'seasonal-icon';
    icon.textContent = event.emoji;

    const label = document.createElement('span');
    label.className = 'seasonal-label';
    label.textContent = event.name + 'あそび があるよ！';

    const playBtn = document.createElement('button');
    playBtn.className = 'seasonal-play-btn';
    playBtn.textContent = 'あそぶ';
    playBtn.addEventListener('click', () => showQuiz(event.key, banner));

    card.appendChild(icon);
    card.appendChild(label);
    card.appendChild(playBtn);
    banner.appendChild(card);
}

function showQuiz(key, container) {
    const quiz = seasonalQuizzes[key];
    if (!quiz) return;

    const existing = container.querySelector('.seasonal-quiz');
    if (existing) {
        existing.remove();
    }

    const quizEl = document.createElement('div');
    quizEl.className = 'seasonal-quiz';

    const q = document.createElement('p');
    q.className = 'seasonal-question';
    q.textContent = quiz.question;
    quizEl.appendChild(q);

    const choices = document.createElement('div');
    choices.className = 'seasonal-choices';
    quiz.choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'seasonal-choice-btn';
        btn.textContent = c;
        btn.addEventListener('click', () => {
            const feedback = quizEl.querySelector('.seasonal-feedback');
            if (c === quiz.answer) {
                feedback.textContent = 'せいかい！ 🎉';
                feedback.className = 'seasonal-feedback correct';
            } else {
                feedback.textContent = 'ざんねん... もういっかい！';
                feedback.className = 'seasonal-feedback incorrect';
            }
        });
        choices.appendChild(btn);
    });
    quizEl.appendChild(choices);

    const feedback = document.createElement('p');
    feedback.className = 'seasonal-feedback';
    quizEl.appendChild(feedback);

    container.appendChild(quizEl);
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { initSeasonalEvent(); });
}

if (typeof module !== 'undefined') {
    module.exports = { initSeasonalEvent, getSeasonalEvent };
}
