/**
 * バッジ・スタンプシステム
 * Badge and Stamp System for Hiragana/Katakana Learning
 */

class BadgeSystem {
    constructor(progressTracker, options = {}) {
        this.progressTracker = progressTracker;
        this.options = {
            showNotifications: true,
            animationDuration: 2000,
            soundEnabled: true,
            ...options
        };
        
        // バッジ定義
        this.badgeDefinitions = this.initializeBadgeDefinitions();
        
        // スタンプ定義
        this.stampDefinitions = this.initializeStampDefinitions();
        
        // 通知キュー
        this.notificationQueue = [];
        this.isShowingNotification = false;
    }
    
    /**
     * バッジ定義を初期化
     */
    initializeBadgeDefinitions() {
        return {
            // 学習開始バッジ
            'first-session': {
                id: 'first-session',
                name: '学習スタート',
                description: '初めての学習セッションを完了しました',
                icon: '🎯',
                category: 'milestone',
                rarity: 'common',
                requirement: '1回学習する',
                checkCondition: (progress) => progress.sessions.length >= 1
            },
            
            // ひらがな習得バッジ
            'first-hiragana': {
                id: 'first-hiragana',
                name: 'ひらがなデビュー',
                description: '初めてのひらがなを習得しました',
                icon: '🌸',
                category: 'achievement',
                rarity: 'common',
                requirement: 'ひらがなを1文字習得する',
                checkCondition: (progress) => {
                    const hiraganaCount = progress.masteredCharacters.filter(charId => {
                        const stats = progress.characterStats[charId];
                        return stats && stats.type === 'hiragana';
                    }).length;
                    return hiraganaCount >= 1;
                }
            },
            
            'hiragana-master': {
                id: 'hiragana-master',
                name: 'ひらがなマスター',
                description: 'ひらがな25文字を習得しました',
                icon: '👑',
                category: 'achievement',
                rarity: 'rare',
                requirement: 'ひらがなを25文字習得する',
                checkCondition: (progress) => {
                    const hiraganaCount = progress.masteredCharacters.filter(charId => {
                        const stats = progress.characterStats[charId];
                        return stats && stats.type === 'hiragana';
                    }).length;
                    return hiraganaCount >= 25;
                }
            },
            
            'hiragana-complete': {
                id: 'hiragana-complete',
                name: 'ひらがな完全制覇',
                description: 'すべてのひらがなを習得しました',
                icon: '🏆',
                category: 'achievement',
                rarity: 'legendary',
                requirement: 'すべてのひらがなを習得する',
                checkCondition: (progress) => {
                    const hiraganaCount = progress.masteredCharacters.filter(charId => {
                        const stats = progress.characterStats[charId];
                        return stats && stats.type === 'hiragana';
                    }).length;
                    return hiraganaCount >= 46; // ひらがな全文字
                }
            },
            
            // カタカナ習得バッジ
            'first-katakana': {
                id: 'first-katakana',
                name: 'カタカナデビュー',
                description: '初めてのカタカナを習得しました',
                icon: '⚡',
                category: 'achievement',
                rarity: 'common',
                requirement: 'カタカナを1文字習得する',
                checkCondition: (progress) => {
                    const katakanaCount = progress.masteredCharacters.filter(charId => {
                        const stats = progress.characterStats[charId];
                        return stats && stats.type === 'katakana';
                    }).length;
                    return katakanaCount >= 1;
                }
            },
            
            'katakana-master': {
                id: 'katakana-master',
                name: 'カタカナマスター',
                description: 'カタカナ25文字を習得しました',
                icon: '💎',
                category: 'achievement',
                rarity: 'rare',
                requirement: 'カタカナを25文字習得する',
                checkCondition: (progress) => {
                    const katakanaCount = progress.masteredCharacters.filter(charId => {
                        const stats = progress.characterStats[charId];
                        return stats && stats.type === 'katakana';
                    }).length;
                    return katakanaCount >= 25;
                }
            },
            
            // 継続学習バッジ
            'week-streak': {
                id: 'week-streak',
                name: '1週間継続',
                description: '7日連続で学習しました',
                icon: '🔥',
                category: 'streak',
                rarity: 'uncommon',
                requirement: '7日連続で学習する',
                checkCondition: (progress) => progress.consecutiveDays >= 7
            },
            
            'month-streak': {
                id: 'month-streak',
                name: '1ヶ月継続',
                description: '30日連続で学習しました',
                icon: '🌟',
                category: 'streak',
                rarity: 'epic',
                requirement: '30日連続で学習する',
                checkCondition: (progress) => progress.consecutiveDays >= 30
            },
            
            'hundred-days': {
                id: 'hundred-days',
                name: '100日継続',
                description: '100日連続で学習しました',
                icon: '💯',
                category: 'streak',
                rarity: 'legendary',
                requirement: '100日連続で学習する',
                checkCondition: (progress) => progress.consecutiveDays >= 100
            },
            
            // 学習時間バッジ
            'hour-learner': {
                id: 'hour-learner',
                name: '1時間学習',
                description: '累計1時間の学習を達成しました',
                icon: '⏰',
                category: 'time',
                rarity: 'common',
                requirement: '累計1時間学習する',
                checkCondition: (progress) => progress.totalPlayTime >= 3600000 // 1時間
            },
            
            'dedicated-learner': {
                id: 'dedicated-learner',
                name: '熱心な学習者',
                description: '累計10時間の学習を達成しました',
                icon: '📚',
                category: 'time',
                rarity: 'rare',
                requirement: '累計10時間学習する',
                checkCondition: (progress) => progress.totalPlayTime >= 36000000 // 10時間
            },
            
            'marathon-learner': {
                id: 'marathon-learner',
                name: '学習マラソナー',
                description: '累計50時間の学習を達成しました',
                icon: '🏃‍♂️',
                category: 'time',
                rarity: 'epic',
                requirement: '累計50時間学習する',
                checkCondition: (progress) => progress.totalPlayTime >= 180000000 // 50時間
            },
            
            // 正確性バッジ
            'perfect-session': {
                id: 'perfect-session',
                name: 'パーフェクト',
                description: '1セッションで100%の正答率を達成しました',
                icon: '🎯',
                category: 'accuracy',
                rarity: 'uncommon',
                requirement: '1セッションで100%正答',
                checkCondition: (progress) => {
                    return progress.sessions.some(session => session.accuracy === 100);
                }
            },
            
            'accuracy-master': {
                id: 'accuracy-master',
                name: '正確性マスター',
                description: '全体正答率90%以上を達成しました',
                icon: '🎪',
                category: 'accuracy',
                rarity: 'rare',
                requirement: '全体正答率90%以上',
                checkCondition: (progress) => {
                    const allStats = Object.values(progress.characterStats);
                    if (allStats.length === 0) return false;
                    
                    const totalCorrect = allStats.reduce((sum, stats) => sum + stats.correctAttempts, 0);
                    const totalAttempts = allStats.reduce((sum, stats) => sum + stats.totalAttempts, 0);
                    
                    return totalAttempts > 0 && (totalCorrect / totalAttempts) >= 0.9;
                }
            },
            
            // 特別バッジ
            'speed-demon': {
                id: 'speed-demon',
                name: 'スピードマスター',
                description: '平均反応時間2秒以下を達成しました',
                icon: '⚡',
                category: 'special',
                rarity: 'epic',
                requirement: '平均反応時間2秒以下',
                checkCondition: (progress) => {
                    const allStats = Object.values(progress.characterStats);
                    if (allStats.length === 0) return false;
                    
                    const avgResponseTime = allStats.reduce((sum, stats) => 
                        sum + stats.averageResponseTime, 0) / allStats.length;
                    
                    return avgResponseTime <= 2000;
                }
            },
            
            'comeback-kid': {
                id: 'comeback-kid',
                name: 'カムバックキッド',
                description: '苦手文字を克服しました',
                icon: '💪',
                category: 'special',
                rarity: 'uncommon',
                requirement: '苦手文字を5文字以上克服',
                checkCondition: (progress) => {
                    // 以前苦手だったが現在は習得済みの文字数をカウント
                    let overcomeCoun = 0;
                    Object.values(progress.characterStats).forEach(stats => {
                        if (stats.masteryLevel >= 80 && stats.incorrectAttempts >= 3) {
                            overcomeCoun++;
                        }
                    });
                    return overcomeCoun >= 5;
                }
            }
        };
    }
    
    /**
     * スタンプ定義を初期化
     */
    initializeStampDefinitions() {
        return {
            // 日次スタンプ
            'daily-practice': {
                id: 'daily-practice',
                name: '今日の学習',
                description: '今日学習しました',
                icon: '📅',
                type: 'daily',
                requirement: '1日1回学習する'
            },
            
            // セッション完了スタンプ
            'session-complete': {
                id: 'session-complete',
                name: 'セッション完了',
                description: '学習セッションを完了しました',
                icon: '✅',
                type: 'session',
                requirement: '学習セッションを完了する'
            },
            
            // 文字習得スタンプ
            'character-mastered': {
                id: 'character-mastered',
                name: '文字習得',
                description: '新しい文字を習得しました',
                icon: '⭐',
                type: 'achievement',
                requirement: '文字を習得する'
            },
            
            // 正解スタンプ
            'correct-answer': {
                id: 'correct-answer',
                name: '正解',
                description: '問題に正解しました',
                icon: '🎉',
                type: 'instant',
                requirement: '問題に正解する'
            },
            
            // 連続正解スタンプ
            'streak-5': {
                id: 'streak-5',
                name: '5連続正解',
                description: '5問連続で正解しました',
                icon: '🔥',
                type: 'streak',
                requirement: '5問連続正解'
            },
            
            'streak-10': {
                id: 'streak-10',
                name: '10連続正解',
                description: '10問連続で正解しました',
                icon: '💥',
                type: 'streak',
                requirement: '10問連続正解'
            }
        };
    }
    
    /**
     * 新しいバッジをチェックして付与
     */
    checkAndAwardBadges(progress) {
        const newBadges = [];
        
        Object.values(this.badgeDefinitions).forEach(badge => {
            // 既に獲得済みのバッジはスキップ
            if (progress.badges.includes(badge.id)) {
                return;
            }
            
            // 条件をチェック
            if (badge.checkCondition(progress)) {
                newBadges.push(badge);
                progress.badges.push(badge.id);
            }
        });
        
        // 新しいバッジの通知を表示
        if (newBadges.length > 0 && this.options.showNotifications) {
            this.showBadgeNotifications(newBadges);
        }
        
        return newBadges;
    }
    
    /**
     * スタンプを付与
     */
    awardStamp(stampId, context = {}) {
        const stamp = this.stampDefinitions[stampId];
        if (!stamp) {
            console.warn(`Unknown stamp: ${stampId}`);
            return null;
        }
        
        const awardedStamp = {
            ...stamp,
            awardedAt: new Date().toISOString(),
            context: context
        };
        
        // 進捗データにスタンプを記録
        const progress = this.progressTracker.loadProgress();
        if (progress) {
            if (!progress.stamps) {
                progress.stamps = [];
            }
            
            progress.stamps.push(awardedStamp);
            this.progressTracker.saveProgressData(progress);
        }
        
        // スタンプ通知を表示
        if (this.options.showNotifications) {
            this.showStampNotification(awardedStamp);
        }
        
        return awardedStamp;
    }
    
    /**
     * バッジ通知を表示
     */
    showBadgeNotifications(badges) {
        badges.forEach((badge, index) => {
            setTimeout(() => {
                this.showBadgeNotification(badge);
            }, index * 1000); // 1秒間隔で表示
        });
    }
    
    /**
     * 単一バッジ通知を表示
     */
    showBadgeNotification(badge) {
        this.notificationQueue.push({
            type: 'badge',
            data: badge
        });
        
        if (!this.isShowingNotification) {
            this.processNotificationQueue();
        }
    }
    
    /**
     * スタンプ通知を表示
     */
    showStampNotification(stamp) {
        // インスタントスタンプ以外は通知を表示
        if (stamp.type !== 'instant') {
            this.notificationQueue.push({
                type: 'stamp',
                data: stamp
            });
            
            if (!this.isShowingNotification) {
                this.processNotificationQueue();
            }
        }
    }
    
    /**
     * 通知キューを処理
     */
    processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }
        
        this.isShowingNotification = true;
        const notification = this.notificationQueue.shift();
        
        this.displayNotification(notification).then(() => {
            // 次の通知を処理
            setTimeout(() => {
                this.processNotificationQueue();
            }, 500);
        });
    }
    
    /**
     * 通知を表示
     */
    displayNotification(notification) {
        return new Promise((resolve) => {
            const { type, data } = notification;
            
            // 通知要素を作成
            const notificationElement = document.createElement('div');
            notificationElement.className = `badge-notification ${type}-notification`;
            
            if (type === 'badge') {
                notificationElement.innerHTML = this.createBadgeNotificationHTML(data);
            } else if (type === 'stamp') {
                notificationElement.innerHTML = this.createStampNotificationHTML(data);
            }
            
            // 通知をDOMに追加
            document.body.appendChild(notificationElement);
            
            // アニメーション開始
            setTimeout(() => {
                notificationElement.classList.add('show');
            }, 100);
            
            // 効果音を再生
            if (this.options.soundEnabled) {
                this.playNotificationSound(type, data);
            }
            
            // 通知を自動で閉じる
            setTimeout(() => {
                notificationElement.classList.add('hide');
                setTimeout(() => {
                    if (notificationElement.parentNode) {
                        notificationElement.parentNode.removeChild(notificationElement);
                    }
                    resolve();
                }, 500);
            }, this.options.animationDuration);
        });
    }
    
    /**
     * バッジ通知HTMLを作成
     */
    createBadgeNotificationHTML(badge) {
        const rarityClass = `rarity-${badge.rarity}`;
        
        return `
            <div class="notification-content ${rarityClass}">
                <div class="notification-header">
                    <div class="notification-title">🏆 新しいバッジを獲得！</div>
                </div>
                <div class="notification-body">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-info">
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-description">${badge.description}</div>
                        <div class="badge-rarity">${this.getRarityText(badge.rarity)}</div>
                    </div>
                </div>
                <div class="notification-sparkles">✨</div>
            </div>
        `;
    }
    
    /**
     * スタンプ通知HTMLを作成
     */
    createStampNotificationHTML(stamp) {
        return `
            <div class="notification-content stamp-content">
                <div class="notification-header">
                    <div class="notification-title">📝 スタンプゲット！</div>
                </div>
                <div class="notification-body">
                    <div class="stamp-icon">${stamp.icon}</div>
                    <div class="stamp-info">
                        <div class="stamp-name">${stamp.name}</div>
                        <div class="stamp-description">${stamp.description}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * レアリティテキストを取得
     */
    getRarityText(rarity) {
        const rarityTexts = {
            'common': 'コモン',
            'uncommon': 'アンコモン',
            'rare': 'レア',
            'epic': 'エピック',
            'legendary': 'レジェンダリー'
        };
        
        return rarityTexts[rarity] || 'コモン';
    }
    
    /**
     * 通知効果音を再生
     */
    playNotificationSound(type, data) {
        // AudioManagerが利用可能な場合は効果音を再生
        if (typeof window !== 'undefined' && window.AudioManager) {
            const audioManager = new window.AudioManager();
            
            if (type === 'badge') {
                const soundType = data.rarity === 'legendary' || data.rarity === 'epic' 
                    ? 'badge-epic' : 'badge-common';
                audioManager.playFeedbackSound(soundType);
            } else if (type === 'stamp') {
                audioManager.playFeedbackSound('stamp');
            }
        }
    }
    
    /**
     * バッジコレクション表示を作成
     */
    createBadgeCollection(container) {
        const progress = this.progressTracker.loadProgress();
        if (!progress) return;
        
        const earnedBadges = progress.badges.map(badgeId => this.badgeDefinitions[badgeId]).filter(Boolean);
        const availableBadges = Object.values(this.badgeDefinitions).filter(badge => 
            !progress.badges.includes(badge.id)
        );
        
        container.innerHTML = `
            <div class="badge-collection">
                <div class="collection-header">
                    <h3>🏆 バッジコレクション</h3>
                    <div class="collection-stats">
                        ${earnedBadges.length} / ${Object.keys(this.badgeDefinitions).length} 獲得
                    </div>
                </div>
                
                <div class="earned-badges">
                    <h4>獲得済みバッジ</h4>
                    <div class="badges-grid">
                        ${earnedBadges.map(badge => this.createBadgeCard(badge, true)).join('')}
                    </div>
                </div>
                
                <div class="available-badges">
                    <h4>未獲得バッジ</h4>
                    <div class="badges-grid">
                        ${availableBadges.map(badge => this.createBadgeCard(badge, false)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.addBadgeCollectionStyles();
    }
    
    /**
     * バッジカードを作成
     */
    createBadgeCard(badge, isEarned) {
        const rarityClass = `rarity-${badge.rarity}`;
        const earnedClass = isEarned ? 'earned' : 'locked';
        
        return `
            <div class="badge-card ${rarityClass} ${earnedClass}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
                <div class="badge-rarity">${this.getRarityText(badge.rarity)}</div>
                ${!isEarned ? `<div class="badge-requirement">${badge.requirement}</div>` : ''}
            </div>
        `;
    }
    
    /**
     * スタンプコレクション表示を作成
     */
    createStampCollection(container) {
        const progress = this.progressTracker.loadProgress();
        if (!progress || !progress.stamps) {
            container.innerHTML = '<div class="no-stamps">まだスタンプがありません</div>';
            return;
        }
        
        // スタンプを日付別にグループ化
        const stampsByDate = this.groupStampsByDate(progress.stamps);
        
        container.innerHTML = `
            <div class="stamp-collection">
                <div class="collection-header">
                    <h3>📝 スタンプコレクション</h3>
                    <div class="collection-stats">
                        総スタンプ数: ${progress.stamps.length}
                    </div>
                </div>
                
                <div class="stamps-timeline">
                    ${Object.keys(stampsByDate).sort().reverse().map(date => `
                        <div class="stamp-day">
                            <div class="day-header">${this.formatDate(date)}</div>
                            <div class="day-stamps">
                                ${stampsByDate[date].map(stamp => this.createStampCard(stamp)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.addStampCollectionStyles();
    }
    
    /**
     * スタンプを日付別にグループ化
     */
    groupStampsByDate(stamps) {
        const grouped = {};
        
        stamps.forEach(stamp => {
            const date = new Date(stamp.awardedAt).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(stamp);
        });
        
        return grouped;
    }
    
    /**
     * スタンプカードを作成
     */
    createStampCard(stamp) {
        const time = new Date(stamp.awardedAt).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="stamp-card">
                <div class="stamp-icon">${stamp.icon}</div>
                <div class="stamp-info">
                    <div class="stamp-name">${stamp.name}</div>
                    <div class="stamp-time">${time}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * 日付をフォーマット
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return '今日';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return '昨日';
        } else {
            return date.toLocaleDateString('ja-JP');
        }
    }
    
    /**
     * バッジコレクションのスタイルを追加
     */
    addBadgeCollectionStyles() {
        if (document.querySelector('#badge-collection-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'badge-collection-styles';
        style.textContent = `
            .badge-collection {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .collection-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .collection-header h3 {
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .collection-stats {
                font-size: 16px;
                color: #666;
            }
            
            .badges-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            
            .badge-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            
            .badge-card:hover {
                transform: translateY(-2px);
            }
            
            .badge-card.earned {
                background: linear-gradient(135deg, #ffeaa7, #fab1a0);
                border: 2px solid #fdcb6e;
            }
            
            .badge-card.locked {
                background: #f8f9fa;
                border: 2px dashed #dee2e6;
                opacity: 0.6;
            }
            
            .badge-card.rarity-common.earned {
                background: linear-gradient(135deg, #ddd6fe, #c7d2fe);
            }
            
            .badge-card.rarity-uncommon.earned {
                background: linear-gradient(135deg, #bbf7d0, #86efac);
            }
            
            .badge-card.rarity-rare.earned {
                background: linear-gradient(135deg, #fecaca, #fca5a5);
            }
            
            .badge-card.rarity-epic.earned {
                background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
            }
            
            .badge-card.rarity-legendary.earned {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                animation: legendary-glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes legendary-glow {
                from { box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                to { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); }
            }
            
            .badge-icon {
                font-size: 48px;
                margin-bottom: 10px;
            }
            
            .badge-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #333;
            }
            
            .badge-description {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
            }
            
            .badge-rarity {
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                padding: 4px 8px;
                border-radius: 12px;
                display: inline-block;
                margin-bottom: 8px;
            }
            
            .badge-card.rarity-common .badge-rarity {
                background: #e5e7eb;
                color: #6b7280;
            }
            
            .badge-card.rarity-uncommon .badge-rarity {
                background: #dcfce7;
                color: #16a34a;
            }
            
            .badge-card.rarity-rare .badge-rarity {
                background: #fecaca;
                color: #dc2626;
            }
            
            .badge-card.rarity-epic .badge-rarity {
                background: #e9d5ff;
                color: #9333ea;
            }
            
            .badge-card.rarity-legendary .badge-rarity {
                background: #fbbf24;
                color: #92400e;
            }
            
            .badge-requirement {
                font-size: 12px;
                color: #999;
                font-style: italic;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * スタンプコレクションのスタイルを追加
     */
    addStampCollectionStyles() {
        if (document.querySelector('#stamp-collection-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'stamp-collection-styles';
        style.textContent = `
            .stamp-collection {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .stamps-timeline {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .stamp-day {
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .day-header {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #333;
                border-bottom: 2px solid #667eea;
                padding-bottom: 5px;
            }
            
            .day-stamps {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .stamp-card {
                display: flex;
                align-items: center;
                background: #f8f9fa;
                border-radius: 8px;
                padding: 10px;
                min-width: 120px;
            }
            
            .stamp-icon {
                font-size: 24px;
                margin-right: 10px;
            }
            
            .stamp-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 2px;
            }
            
            .stamp-time {
                font-size: 12px;
                color: #666;
            }
            
            .no-stamps {
                text-align: center;
                padding: 40px;
                color: #666;
                font-size: 16px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 通知スタイルを追加
     */
    addNotificationStyles() {
        if (document.querySelector('#badge-notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'badge-notification-styles';
        style.textContent = `
            .badge-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.5s ease;
                max-width: 350px;
            }
            
            .badge-notification.show {
                transform: translateX(0);
            }
            
            .badge-notification.hide {
                transform: translateX(400px);
            }
            
            .notification-content {
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                border-left: 5px solid #667eea;
                position: relative;
                overflow: hidden;
            }
            
            .notification-content.rarity-legendary {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: white;
                animation: legendary-pulse 1s ease-in-out infinite alternate;
            }
            
            .notification-content.rarity-epic {
                background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
                border-left-color: #9333ea;
            }
            
            .notification-content.rarity-rare {
                background: linear-gradient(135deg, #fecaca, #fca5a5);
                border-left-color: #dc2626;
            }
            
            @keyframes legendary-pulse {
                from { box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
                to { box-shadow: 0 6px 30px rgba(245, 158, 11, 0.4); }
            }
            
            .notification-header {
                margin-bottom: 15px;
            }
            
            .notification-title {
                font-size: 16px;
                font-weight: bold;
                color: #333;
            }
            
            .notification-content.rarity-legendary .notification-title {
                color: white;
            }
            
            .notification-body {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .badge-icon,
            .stamp-icon {
                font-size: 48px;
            }
            
            .badge-info,
            .stamp-info {
                flex: 1;
            }
            
            .badge-name,
            .stamp-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            
            .notification-content.rarity-legendary .badge-name {
                color: white;
            }
            
            .badge-description,
            .stamp-description {
                font-size: 14px;
                color: #666;
                margin-bottom: 5px;
            }
            
            .notification-content.rarity-legendary .badge-description {
                color: rgba(255,255,255,0.9);
            }
            
            .badge-rarity {
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                padding: 2px 6px;
                border-radius: 8px;
                background: rgba(0,0,0,0.1);
                color: #333;
            }
            
            .notification-content.rarity-legendary .badge-rarity {
                background: rgba(255,255,255,0.2);
                color: white;
            }
            
            .notification-sparkles {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 20px;
                animation: sparkle 1s ease-in-out infinite alternate;
            }
            
            @keyframes sparkle {
                from { opacity: 0.5; transform: scale(1); }
                to { opacity: 1; transform: scale(1.2); }
            }
            
            .stamp-content {
                border-left-color: #28a745;
            }
            
            @media (max-width: 480px) {
                .badge-notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    transform: translateY(-100px);
                }
                
                .badge-notification.show {
                    transform: translateY(0);
                }
                
                .badge-notification.hide {
                    transform: translateY(-100px);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 初期化時にスタイルを追加
     */
    initialize() {
        this.addNotificationStyles();
    }
    
    /**
     * BadgeSystemを破棄
     */
    destroy() {
        // 通知キューをクリア
        this.notificationQueue = [];
        this.isShowingNotification = false;
        
        // 表示中の通知を削除
        const notifications = document.querySelectorAll('.badge-notification');
        notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // スタイルを削除
        const styles = [
            '#badge-notification-styles',
            '#badge-collection-styles', 
            '#stamp-collection-styles'
        ];
        
        styles.forEach(styleId => {
            const styleElement = document.querySelector(styleId);
            if (styleElement) {
                styleElement.remove();
            }
        });
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { BadgeSystem };
} else {
    // ブラウザ環境
    window.BadgeSystem = BadgeSystem;
}