/**
 * ゲーミフィケーションシステム
 * Gamification System for Hiragana/Katakana Learning
 */

class GamificationSystem {
    constructor(progressTracker, badgeSystem, options = {}) {
        this.progressTracker = progressTracker;
        this.badgeSystem = badgeSystem;
        this.options = {
            showProgressBars: true,
            showStreakCounter: true,
            showLevelSystem: true,
            showDailyGoals: true,
            animationEnabled: true,
            ...options
        };
        
        // レベルシステム
        this.levelSystem = this.initializeLevelSystem();
        
        // 日次目標システム
        this.dailyGoals = this.initializeDailyGoals();
        
        // 現在の連続正解数
        this.currentStreak = 0;
        this.maxStreak = 0;
        
        // UI要素の参照
        this.progressContainer = null;
        this.streakDisplay = null;
        this.levelDisplay = null;
        this.goalDisplay = null;
    }
    
    /**
     * レベルシステムを初期化
     */
    initializeLevelSystem() {
        return {
            levels: [
                { level: 1, name: 'ひらがな初心者', requiredXP: 0, icon: '🌱', color: '#4ade80' },
                { level: 2, name: 'ひらがな学習者', requiredXP: 100, icon: '🌿', color: '#22c55e' },
                { level: 3, name: 'ひらがな練習生', requiredXP: 250, icon: '🍃', color: '#16a34a' },
                { level: 4, name: 'ひらがな上級者', requiredXP: 500, icon: '🌳', color: '#15803d' },
                { level: 5, name: 'ひらがなマスター', requiredXP: 1000, icon: '🎋', color: '#166534' },
                { level: 6, name: 'カタカナ初心者', requiredXP: 1500, icon: '⚡', color: '#3b82f6' },
                { level: 7, name: 'カタカナ学習者', requiredXP: 2000, icon: '🔷', color: '#2563eb' },
                { level: 8, name: 'カタカナ練習生', requiredXP: 2750, icon: '💎', color: '#1d4ed8' },
                { level: 9, name: 'カタカナ上級者', requiredXP: 3500, icon: '🔮', color: '#1e40af' },
                { level: 10, name: 'カタカナマスター', requiredXP: 5000, icon: '👑', color: '#1e3a8a' },
                { level: 11, name: '文字の達人', requiredXP: 7500, icon: '🏆', color: '#7c3aed' },
                { level: 12, name: '学習の王者', requiredXP: 10000, icon: '🌟', color: '#6d28d9' }
            ],
            
            // 経験値計算
            calculateXP: (progress) => {
                let totalXP = 0;
                
                // 習得文字数による経験値
                totalXP += progress.masteredCharacters.length * 50;
                
                // セッション完了による経験値
                totalXP += progress.sessions.length * 10;
                
                // 正答による経験値
                Object.values(progress.characterStats).forEach(stats => {
                    totalXP += stats.correctAttempts * 2;
                });
                
                // 連続学習日数による経験値
                totalXP += progress.consecutiveDays * 25;
                
                // バッジ獲得による経験値
                totalXP += progress.badges.length * 100;
                
                return totalXP;
            },
            
            // 現在のレベルを取得
            getCurrentLevel: (xp) => {
                const levels = this.levelSystem.levels;
                for (let i = levels.length - 1; i >= 0; i--) {
                    if (xp >= levels[i].requiredXP) {
                        return levels[i];
                    }
                }
                return levels[0];
            },
            
            // 次のレベルを取得
            getNextLevel: (currentLevel) => {
                const levels = this.levelSystem.levels;
                const currentIndex = levels.findIndex(l => l.level === currentLevel.level);
                return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
            }
        };
    }
    
    /**
     * 日次目標システムを初期化
     */
    initializeDailyGoals() {
        return {
            goals: [
                {
                    id: 'daily-questions',
                    name: '今日の問題数',
                    description: '10問に挑戦しよう',
                    target: 10,
                    icon: '❓',
                    type: 'questions',
                    reward: { xp: 50, stamp: 'daily-practice' }
                },
                {
                    id: 'daily-accuracy',
                    name: '今日の正答率',
                    description: '80%以上の正答率を目指そう',
                    target: 80,
                    icon: '🎯',
                    type: 'accuracy',
                    reward: { xp: 75, stamp: 'accuracy-goal' }
                },
                {
                    id: 'daily-characters',
                    name: '新しい文字',
                    description: '1つの新しい文字を学ぼう',
                    target: 1,
                    icon: '📚',
                    type: 'new-characters',
                    reward: { xp: 100, stamp: 'character-mastered' }
                },
                {
                    id: 'daily-streak',
                    name: '連続正解',
                    description: '5問連続で正解しよう',
                    target: 5,
                    icon: '🔥',
                    type: 'streak',
                    reward: { xp: 60, stamp: 'streak-5' }
                }
            ],
            
            // 今日の進捗を取得
            getTodayProgress: (progress) => {
                const today = new Date().toDateString();
                const todaySessions = progress.sessions.filter(session => 
                    new Date(session.startTime).toDateString() === today
                );
                
                if (todaySessions.length === 0) {
                    return {
                        questions: 0,
                        accuracy: 0,
                        newCharacters: 0,
                        maxStreak: 0
                    };
                }
                
                const totalQuestions = todaySessions.reduce((sum, s) => sum + s.totalQuestions, 0);
                const totalCorrect = todaySessions.reduce((sum, s) => sum + s.totalScore, 0);
                const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
                
                // 今日習得した新しい文字数を計算
                const todayMastered = Object.values(progress.characterStats).filter(stats => {
                    const masteredToday = new Date(stats.lastAttemptDate).toDateString() === today;
                    return masteredToday && stats.masteryLevel >= 80;
                }).length;
                
                // 今日の最大連続正解数を計算
                let maxStreak = 0;
                let currentStreak = 0;
                
                todaySessions.forEach(session => {
                    session.attempts.forEach(attempt => {
                        if (attempt.isCorrect) {
                            currentStreak++;
                            maxStreak = Math.max(maxStreak, currentStreak);
                        } else {
                            currentStreak = 0;
                        }
                    });
                });
                
                return {
                    questions: totalQuestions,
                    accuracy: accuracy,
                    newCharacters: todayMastered,
                    maxStreak: maxStreak
                };
            },
            
            // 目標達成状況をチェック
            checkGoalCompletion: (goal, todayProgress) => {
                switch (goal.type) {
                    case 'questions':
                        return todayProgress.questions >= goal.target;
                    case 'accuracy':
                        return todayProgress.accuracy >= goal.target;
                    case 'new-characters':
                        return todayProgress.newCharacters >= goal.target;
                    case 'streak':
                        return todayProgress.maxStreak >= goal.target;
                    default:
                        return false;
                }
            },
            
            // 目標の進捗値を取得
            getGoalProgress: (goal, todayProgress) => {
                switch (goal.type) {
                    case 'questions':
                        return todayProgress.questions;
                    case 'accuracy':
                        return Math.round(todayProgress.accuracy);
                    case 'new-characters':
                        return todayProgress.newCharacters;
                    case 'streak':
                        return todayProgress.maxStreak;
                    default:
                        return 0;
                }
            }
        };
    }
    
    /**
     * 進捗可視化UIを作成
     */
    createProgressVisualization(container) {
        const progress = this.progressTracker.loadProgress();
        if (!progress) return;
        
        const currentXP = this.levelSystem.calculateXP(progress);
        const currentLevel = this.levelSystem.getCurrentLevel(currentXP);
        const nextLevel = this.levelSystem.getNextLevel(currentLevel);
        const todayProgress = this.dailyGoals.getTodayProgress(progress);
        
        container.innerHTML = `
            <div class="gamification-dashboard">
                ${this.options.showLevelSystem ? this.createLevelDisplay(currentLevel, nextLevel, currentXP) : ''}
                ${this.options.showProgressBars ? this.createProgressBars(progress) : ''}
                ${this.options.showStreakCounter ? this.createStreakDisplay(progress) : ''}
                ${this.options.showDailyGoals ? this.createDailyGoalsDisplay(todayProgress) : ''}
                ${this.createAchievementSummary(progress)}
            </div>
        `;
        
        this.addGamificationStyles();
        this.bindProgressEvents(container);
    }
    
    /**
     * レベル表示を作成
     */
    createLevelDisplay(currentLevel, nextLevel, currentXP) {
        const progressToNext = nextLevel ? 
            ((currentXP - currentLevel.requiredXP) / (nextLevel.requiredXP - currentLevel.requiredXP)) * 100 : 100;
        
        return `
            <div class="level-display">
                <div class="level-header">
                    <div class="level-icon" style="color: ${currentLevel.color}">${currentLevel.icon}</div>
                    <div class="level-info">
                        <div class="level-number">レベル ${currentLevel.level}</div>
                        <div class="level-name">${currentLevel.name}</div>
                    </div>
                    <div class="level-xp">
                        <div class="xp-amount">${currentXP} XP</div>
                        ${nextLevel ? `<div class="xp-next">次のレベルまで ${nextLevel.requiredXP - currentXP} XP</div>` : '<div class="xp-max">最大レベル達成！</div>'}
                    </div>
                </div>
                ${nextLevel ? `
                    <div class="level-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressToNext}%; background: ${currentLevel.color}"></div>
                        </div>
                        <div class="progress-text">${Math.round(progressToNext)}%</div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * 進捗バーを作成
     */
    createProgressBars(progress) {
        const hiraganaStats = this.getCharacterTypeStats(progress, 'hiragana');
        const katakanaStats = this.getCharacterTypeStats(progress, 'katakana');
        const overallAccuracy = this.calculateOverallAccuracy(progress);
        
        return `
            <div class="progress-bars">
                <div class="progress-section">
                    <h4>📚 学習進捗</h4>
                    
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>ひらがな習得</span>
                            <span class="progress-value">${hiraganaStats.mastered}/${hiraganaStats.total}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill hiragana-progress" style="width: ${hiraganaStats.percentage}%"></div>
                        </div>
                        <div class="progress-percentage">${Math.round(hiraganaStats.percentage)}%</div>
                    </div>
                    
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>カタカナ習得</span>
                            <span class="progress-value">${katakanaStats.mastered}/${katakanaStats.total}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill katakana-progress" style="width: ${katakanaStats.percentage}%"></div>
                        </div>
                        <div class="progress-percentage">${Math.round(katakanaStats.percentage)}%</div>
                    </div>
                    
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>全体正答率</span>
                            <span class="progress-value">${Math.round(overallAccuracy)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill accuracy-progress" style="width: ${overallAccuracy}%"></div>
                        </div>
                        <div class="progress-percentage">${Math.round(overallAccuracy)}%</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 連続記録表示を作成
     */
    createStreakDisplay(progress) {
        const currentStreak = progress.consecutiveDays;
        const longestStreak = this.calculateLongestStreak(progress);
        const todayProgress = this.dailyGoals.getTodayProgress(progress);
        
        return `
            <div class="streak-display">
                <div class="streak-section">
                    <h4>🔥 連続記録</h4>
                    
                    <div class="streak-grid">
                        <div class="streak-item current-streak">
                            <div class="streak-icon">🔥</div>
                            <div class="streak-info">
                                <div class="streak-number">${currentStreak}</div>
                                <div class="streak-label">連続学習日数</div>
                            </div>
                        </div>
                        
                        <div class="streak-item longest-streak">
                            <div class="streak-icon">🏆</div>
                            <div class="streak-info">
                                <div class="streak-number">${longestStreak}</div>
                                <div class="streak-label">最長記録</div>
                            </div>
                        </div>
                        
                        <div class="streak-item answer-streak">
                            <div class="streak-icon">⚡</div>
                            <div class="streak-info">
                                <div class="streak-number">${todayProgress.maxStreak}</div>
                                <div class="streak-label">今日の連続正解</div>
                            </div>
                        </div>
                    </div>
                    
                    ${this.createStreakCalendar(progress)}
                </div>
            </div>
        `;
    }
    
    /**
     * 連続学習カレンダーを作成
     */
    createStreakCalendar(progress) {
        const today = new Date();
        const days = [];
        
        // 過去7日間の学習状況を表示
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dateString = date.toDateString();
            const hasSession = progress.sessions.some(session => 
                new Date(session.startTime).toDateString() === dateString
            );
            
            days.push({
                date: date.getDate(),
                dayName: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
                hasSession: hasSession,
                isToday: i === 0
            });
        }
        
        return `
            <div class="streak-calendar">
                <div class="calendar-title">今週の学習状況</div>
                <div class="calendar-days">
                    ${days.map(day => `
                        <div class="calendar-day ${day.hasSession ? 'active' : ''} ${day.isToday ? 'today' : ''}">
                            <div class="day-name">${day.dayName}</div>
                            <div class="day-number">${day.date}</div>
                            <div class="day-indicator">${day.hasSession ? '✅' : '⭕'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * 日次目標表示を作成
     */
    createDailyGoalsDisplay(todayProgress) {
        const completedGoals = [];
        const incompleteGoals = [];
        
        this.dailyGoals.goals.forEach(goal => {
            const isCompleted = this.dailyGoals.checkGoalCompletion(goal, todayProgress);
            const currentProgress = this.dailyGoals.getGoalProgress(goal, todayProgress);
            const progressPercentage = Math.min((currentProgress / goal.target) * 100, 100);
            
            const goalData = {
                ...goal,
                currentProgress,
                progressPercentage,
                isCompleted
            };
            
            if (isCompleted) {
                completedGoals.push(goalData);
            } else {
                incompleteGoals.push(goalData);
            }
        });
        
        return `
            <div class="daily-goals">
                <div class="goals-header">
                    <h4>🎯 今日の目標</h4>
                    <div class="goals-summary">${completedGoals.length}/${this.dailyGoals.goals.length} 達成</div>
                </div>
                
                <div class="goals-list">
                    ${[...incompleteGoals, ...completedGoals].map(goal => `
                        <div class="goal-item ${goal.isCompleted ? 'completed' : ''}">
                            <div class="goal-icon">${goal.icon}</div>
                            <div class="goal-content">
                                <div class="goal-name">${goal.name}</div>
                                <div class="goal-description">${goal.description}</div>
                                <div class="goal-progress">
                                    <div class="progress-bar small">
                                        <div class="progress-fill" style="width: ${goal.progressPercentage}%"></div>
                                    </div>
                                    <div class="progress-text">${goal.currentProgress}/${goal.target}</div>
                                </div>
                            </div>
                            <div class="goal-status">
                                ${goal.isCompleted ? '✅' : '⏳'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * 成果サマリーを作成
     */
    createAchievementSummary(progress) {
        const totalSessions = progress.sessions.length;
        const totalPlayTime = this.formatPlayTime(progress.totalPlayTime);
        const badgeCount = progress.badges.length;
        const masteredCount = progress.masteredCharacters.length;
        
        return `
            <div class="achievement-summary">
                <h4>🏆 学習成果</h4>
                <div class="achievement-grid">
                    <div class="achievement-item">
                        <div class="achievement-icon">📊</div>
                        <div class="achievement-value">${totalSessions}</div>
                        <div class="achievement-label">学習セッション</div>
                    </div>
                    
                    <div class="achievement-item">
                        <div class="achievement-icon">⏱️</div>
                        <div class="achievement-value">${totalPlayTime}</div>
                        <div class="achievement-label">総学習時間</div>
                    </div>
                    
                    <div class="achievement-item">
                        <div class="achievement-icon">🏅</div>
                        <div class="achievement-value">${badgeCount}</div>
                        <div class="achievement-label">獲得バッジ</div>
                    </div>
                    
                    <div class="achievement-item">
                        <div class="achievement-icon">📚</div>
                        <div class="achievement-value">${masteredCount}</div>
                        <div class="achievement-label">習得文字</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 文字タイプ別統計を取得
     */
    getCharacterTypeStats(progress, characterType) {
        const allCharacters = Object.values(progress.characterStats).filter(stats => 
            stats.type === characterType
        );
        
        const masteredCharacters = allCharacters.filter(stats => stats.masteryLevel >= 80);
        
        // 想定される総文字数（ひらがな46文字、カタカナ46文字）
        const expectedTotal = 46;
        const actualTotal = Math.max(allCharacters.length, masteredCharacters.length);
        const total = Math.max(expectedTotal, actualTotal);
        
        return {
            total: total,
            mastered: masteredCharacters.length,
            percentage: (masteredCharacters.length / total) * 100
        };
    }
    
    /**
     * 全体正答率を計算
     */
    calculateOverallAccuracy(progress) {
        const allStats = Object.values(progress.characterStats);
        if (allStats.length === 0) return 0;
        
        const totalCorrect = allStats.reduce((sum, stats) => sum + stats.correctAttempts, 0);
        const totalAttempts = allStats.reduce((sum, stats) => sum + stats.totalAttempts, 0);
        
        return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    }
    
    /**
     * 最長連続記録を計算
     */
    calculateLongestStreak(progress) {
        if (!progress.sessions || progress.sessions.length === 0) {
            return 0;
        }
        
        let maxStreak = 0;
        let currentStreak = 0;
        
        // セッションを日付順にソート
        const sortedSessions = progress.sessions.sort((a, b) => 
            new Date(a.startTime) - new Date(b.startTime)
        );
        
        // 日付別にグループ化
        const sessionsByDate = {};
        sortedSessions.forEach(session => {
            const date = new Date(session.startTime).toDateString();
            if (!sessionsByDate[date]) {
                sessionsByDate[date] = [];
            }
            sessionsByDate[date].push(session);
        });
        
        const dates = Object.keys(sessionsByDate).sort();
        let previousDate = null;
        
        dates.forEach(dateString => {
            const currentDate = new Date(dateString);
            
            if (previousDate) {
                const dayDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    // 連続している
                    currentStreak++;
                } else {
                    // 連続が途切れた
                    maxStreak = Math.max(maxStreak, currentStreak);
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            
            previousDate = currentDate;
        });
        
        return Math.max(maxStreak, currentStreak);
    }
    
    /**
     * 学習時間をフォーマット
     */
    formatPlayTime(milliseconds) {
        if (!milliseconds || milliseconds === 0) {
            return '0分';
        }
        
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}時間${minutes}分`;
        } else {
            return `${minutes}分`;
        }
    }
    
    /**
     * 進捗イベントを設定
     */
    bindProgressEvents(container) {
        // レベルアップアニメーション
        const levelDisplay = container.querySelector('.level-display');
        if (levelDisplay) {
            levelDisplay.addEventListener('click', () => {
                this.showLevelDetails();
            });
        }
        
        // 目標クリックイベント
        const goalItems = container.querySelectorAll('.goal-item');
        goalItems.forEach(item => {
            item.addEventListener('click', () => {
                this.showGoalDetails(item);
            });
        });
        
        // 進捗バーアニメーション
        const progressBars = container.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }
    
    /**
     * レベル詳細を表示
     */
    showLevelDetails() {
        const progress = this.progressTracker.loadProgress();
        if (!progress) return;
        
        const currentXP = this.levelSystem.calculateXP(progress);
        const currentLevel = this.levelSystem.getCurrentLevel(currentXP);
        const nextLevel = this.levelSystem.getNextLevel(currentLevel);
        
        const modal = document.createElement('div');
        modal.className = 'level-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>レベル詳細</h3>
                    <button class="close-button">×</button>
                </div>
                <div class="modal-body">
                    <div class="current-level-info">
                        <div class="level-icon" style="color: ${currentLevel.color}">${currentLevel.icon}</div>
                        <div class="level-details">
                            <h4>レベル ${currentLevel.level}: ${currentLevel.name}</h4>
                            <p>現在の経験値: ${currentXP} XP</p>
                            ${nextLevel ? `<p>次のレベルまで: ${nextLevel.requiredXP - currentXP} XP</p>` : '<p>最大レベル達成！</p>'}
                        </div>
                    </div>
                    
                    <div class="xp-breakdown">
                        <h4>経験値の内訳</h4>
                        <ul>
                            <li>習得文字: ${progress.masteredCharacters.length} × 50 = ${progress.masteredCharacters.length * 50} XP</li>
                            <li>セッション完了: ${progress.sessions.length} × 10 = ${progress.sessions.length * 10} XP</li>
                            <li>連続学習: ${progress.consecutiveDays} × 25 = ${progress.consecutiveDays * 25} XP</li>
                            <li>バッジ獲得: ${progress.badges.length} × 100 = ${progress.badges.length * 100} XP</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // モーダルを閉じる
        modal.querySelector('.close-button').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    /**
     * 目標詳細を表示
     */
    showGoalDetails(goalElement) {
        // 目標の詳細情報を表示する実装
        console.log('Goal details clicked:', goalElement);
    }
    
    /**
     * ゲーミフィケーションスタイルを追加
     */
    addGamificationStyles() {
        if (document.querySelector('#gamification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gamification-styles';
        style.textContent = `
            .gamification-dashboard {
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
            }
            
            .level-display {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 30px;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .level-display:hover {
                transform: translateY(-2px);
            }
            
            .level-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
            }
            
            .level-icon {
                font-size: 48px;
                margin-right: 15px;
            }
            
            .level-info {
                flex: 1;
            }
            
            .level-number {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .level-name {
                font-size: 18px;
                opacity: 0.9;
            }
            
            .level-xp {
                text-align: right;
            }
            
            .xp-amount {
                font-size: 20px;
                font-weight: bold;
            }
            
            .xp-next, .xp-max {
                font-size: 14px;
                opacity: 0.8;
            }
            
            .level-progress {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .progress-bar {
                flex: 1;
                height: 8px;
                background: rgba(255,255,255,0.3);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: white;
                border-radius: 4px;
                transition: width 1s ease;
            }
            
            .progress-text {
                font-size: 14px;
                font-weight: bold;
            }
            
            .progress-bars {
                background: white;
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .progress-section h4 {
                margin-bottom: 20px;
                color: #333;
                font-size: 18px;
            }
            
            .progress-item {
                margin-bottom: 20px;
            }
            
            .progress-label {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
                color: #666;
            }
            
            .progress-value {
                font-weight: bold;
                color: #333;
            }
            
            .progress-bar.small {
                height: 6px;
            }
            
            .hiragana-progress {
                background: linear-gradient(90deg, #4ade80, #22c55e);
            }
            
            .katakana-progress {
                background: linear-gradient(90deg, #3b82f6, #2563eb);
            }
            
            .accuracy-progress {
                background: linear-gradient(90deg, #f59e0b, #d97706);
            }
            
            .progress-percentage {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
            
            .streak-display {
                background: white;
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .streak-section h4 {
                margin-bottom: 20px;
                color: #333;
                font-size: 18px;
            }
            
            .streak-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
            }
            
            .streak-item {
                display: flex;
                align-items: center;
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
            }
            
            .current-streak {
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                color: white;
            }
            
            .longest-streak {
                background: linear-gradient(135deg, #feca57, #ff9ff3);
                color: white;
            }
            
            .answer-streak {
                background: linear-gradient(135deg, #48dbfb, #0abde3);
                color: white;
            }
            
            .streak-icon {
                font-size: 32px;
                margin-right: 15px;
            }
            
            .streak-number {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .streak-label {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .streak-calendar {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
            }
            
            .calendar-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 15px;
                text-align: center;
                color: #333;
            }
            
            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 10px;
            }
            
            .calendar-day {
                text-align: center;
                padding: 10px;
                border-radius: 8px;
                background: white;
                border: 2px solid #e9ecef;
            }
            
            .calendar-day.active {
                background: #d4edda;
                border-color: #28a745;
            }
            
            .calendar-day.today {
                border-color: #007bff;
                font-weight: bold;
            }
            
            .day-name {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }
            
            .day-number {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .day-indicator {
                font-size: 14px;
            }
            
            .daily-goals {
                background: white;
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .goals-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .goals-header h4 {
                color: #333;
                font-size: 18px;
                margin: 0;
            }
            
            .goals-summary {
                font-size: 14px;
                color: #666;
                background: #f8f9fa;
                padding: 5px 10px;
                border-radius: 15px;
            }
            
            .goals-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .goal-item {
                display: flex;
                align-items: center;
                background: #f8f9fa;
                border-radius: 10px;
                padding: 15px;
                transition: background-color 0.2s ease;
                cursor: pointer;
            }
            
            .goal-item:hover {
                background: #e9ecef;
            }
            
            .goal-item.completed {
                background: #d4edda;
                border: 1px solid #28a745;
            }
            
            .goal-icon {
                font-size: 24px;
                margin-right: 15px;
            }
            
            .goal-content {
                flex: 1;
            }
            
            .goal-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            
            .goal-description {
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
            }
            
            .goal-progress {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .goal-status {
                font-size: 20px;
            }
            
            .achievement-summary {
                background: white;
                border-radius: 10px;
                padding: 25px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .achievement-summary h4 {
                margin-bottom: 20px;
                color: #333;
                font-size: 18px;
            }
            
            .achievement-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
            }
            
            .achievement-item {
                text-align: center;
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
            }
            
            .achievement-icon {
                font-size: 32px;
                margin-bottom: 10px;
            }
            
            .achievement-value {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            
            .achievement-label {
                font-size: 14px;
                color: #666;
            }
            
            .level-details-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .modal-content {
                background: white;
                border-radius: 10px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
            }
            
            .close-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .current-level-info {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .level-details h4 {
                margin-bottom: 10px;
                color: #333;
            }
            
            .xp-breakdown ul {
                list-style: none;
                padding: 0;
            }
            
            .xp-breakdown li {
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            @media (max-width: 768px) {
                .gamification-dashboard {
                    padding: 15px;
                }
                
                .level-header {
                    flex-direction: column;
                    text-align: center;
                }
                
                .level-icon {
                    margin-right: 0;
                    margin-bottom: 10px;
                }
                
                .streak-grid {
                    grid-template-columns: 1fr;
                }
                
                .calendar-days {
                    grid-template-columns: repeat(7, 1fr);
                    gap: 5px;
                }
                
                .achievement-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * システムを破棄
     */
    destroy() {
        // 自動更新タイマーを停止
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // スタイルを削除
        const style = document.querySelector('#gamification-styles');
        if (style) {
            style.remove();
        }
        
        // モーダルを削除
        const modals = document.querySelectorAll('.level-details-modal');
        modals.forEach(modal => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { GamificationSystem };
} else {
    // ブラウザ環境
    window.GamificationSystem = GamificationSystem;
}