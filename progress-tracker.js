/**
 * 進捗追跡システム
 * Progress Tracking System for Hiragana/Katakana Learning
 */

class ProgressTracker {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'hiragana-learning-progress';
        this.userId = options.userId || 'default';
        this.sessionStorageKey = `${this.storageKey}-session`;
        
        // 現在のセッションデータ
        this.currentSession = null;
        
        // 進捗データの初期化
        this.initializeProgress();
    }
    
    /**
     * 進捗データの初期化
     */
    initializeProgress() {
        try {
            // 既存の進捗データを読み込み
            const existingProgress = this.loadProgress();
            
            if (!existingProgress) {
                // 初回利用時のデフォルト進捗データを作成
                const defaultProgress = this.createDefaultProgress();
                this.saveProgressData(defaultProgress);
            }
        } catch (error) {
            console.warn('Progress initialization failed:', error);
            // エラー時はセッションストレージを使用
            this.useSessionStorage = true;
        }
    }
    
    /**
     * デフォルト進捗データを作成
     */
    createDefaultProgress() {
        return {
            userId: this.userId,
            masteredCharacters: [],
            weakCharacters: [],
            characterStats: {}, // 文字別統計情報
            totalPlayTime: 0,
            consecutiveDays: 0,
            badges: [],
            lastPlayed: null,
            sessions: [],
            createdAt: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    /**
     * 新しい学習セッションを開始
     */
    startSession(ageGroup, mode) {
        this.currentSession = {
            sessionId: this.generateSessionId(),
            startTime: new Date(),
            endTime: null,
            ageGroup: ageGroup, // '3-4' | '5-6'
            mode: mode, // 'hiragana' | 'katakana' | 'mixed'
            attempts: [],
            totalScore: 0,
            totalQuestions: 0,
            accuracy: 0,
            playTime: 0
        };
        
        return this.currentSession.sessionId;
    }
    
    /**
     * セッションIDを生成
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 回答結果を記録
     */
    recordAttempt(character, isCorrect, responseTime, attemptNumber = 1) {
        if (!this.currentSession) {
            console.warn('No active session to record attempt');
            return;
        }
        
        const attempt = {
            character: character.id,
            characterType: character.type,
            romaji: character.romaji,
            isCorrect: isCorrect,
            responseTime: responseTime,
            attemptNumber: attemptNumber,
            timestamp: new Date().toISOString()
        };
        
        this.currentSession.attempts.push(attempt);
        this.currentSession.totalQuestions++;
        
        if (isCorrect) {
            this.currentSession.totalScore++;
        }
        
        // 正答率を更新
        this.currentSession.accuracy = (this.currentSession.totalScore / this.currentSession.totalQuestions) * 100;
        
        // 文字別統計を更新
        this.updateCharacterStats(character, isCorrect, responseTime);
    }
    
    /**
     * 文字別統計を更新
     */
    updateCharacterStats(character, isCorrect, responseTime) {
        const progress = this.loadProgress();
        if (!progress) return;
        
        const charId = character.id;
        
        // 文字別統計が存在しない場合は初期化
        if (!progress.characterStats[charId]) {
            progress.characterStats[charId] = {
                character: character.id,
                type: character.type,
                romaji: character.romaji,
                totalAttempts: 0,
                correctAttempts: 0,
                incorrectAttempts: 0,
                accuracy: 0,
                averageResponseTime: 0,
                totalResponseTime: 0,
                firstAttemptDate: new Date().toISOString(),
                lastAttemptDate: null,
                masteryLevel: 0, // 0-100の習得レベル
                consecutiveCorrect: 0,
                maxConsecutiveCorrect: 0
            };
        }
        
        const stats = progress.characterStats[charId];
        
        // 統計を更新
        stats.totalAttempts++;
        stats.totalResponseTime += responseTime;
        stats.averageResponseTime = stats.totalResponseTime / stats.totalAttempts;
        stats.lastAttemptDate = new Date().toISOString();
        
        if (isCorrect) {
            stats.correctAttempts++;
            stats.consecutiveCorrect++;
            stats.maxConsecutiveCorrect = Math.max(stats.maxConsecutiveCorrect, stats.consecutiveCorrect);
        } else {
            stats.incorrectAttempts++;
            stats.consecutiveCorrect = 0;
        }
        
        // 正答率を更新
        stats.accuracy = (stats.correctAttempts / stats.totalAttempts) * 100;
        
        // 習得レベルを計算（正答率、連続正解数、試行回数を考慮）
        stats.masteryLevel = this.calculateMasteryLevel(stats);
        
        // 習得済み文字の判定（習得レベル80%以上）
        if (stats.masteryLevel >= 80 && !progress.masteredCharacters.includes(charId)) {
            progress.masteredCharacters.push(charId);
            // 苦手文字リストから削除
            progress.weakCharacters = progress.weakCharacters.filter(id => id !== charId);
        }
        
        // 苦手文字の判定（正答率50%未満かつ5回以上試行）
        if (stats.accuracy < 50 && stats.totalAttempts >= 5 && !progress.weakCharacters.includes(charId)) {
            progress.weakCharacters.push(charId);
        }
        
        // 進捗データを保存
        this.saveProgressData(progress);
    }
    
    /**
     * 習得レベルを計算
     */
    calculateMasteryLevel(stats) {
        // 基本正答率（60%の重み）
        const accuracyScore = stats.accuracy * 0.6;
        
        // 連続正解ボーナス（20%の重み）
        const consecutiveBonus = Math.min(stats.maxConsecutiveCorrect * 10, 100) * 0.2;
        
        // 経験値ボーナス（20%の重み）- 試行回数に基づく
        const experienceBonus = Math.min(stats.totalAttempts * 5, 100) * 0.2;
        
        return Math.min(accuracyScore + consecutiveBonus + experienceBonus, 100);
    }
    
    /**
     * セッションを終了
     */
    endSession() {
        if (!this.currentSession) {
            console.warn('No active session to end');
            return null;
        }
        
        this.currentSession.endTime = new Date();
        this.currentSession.playTime = this.currentSession.endTime - this.currentSession.startTime;
        
        // 進捗データを更新
        const progress = this.loadProgress();
        if (progress) {
            // セッション履歴に追加
            progress.sessions.push({...this.currentSession});
            
            // 総プレイ時間を更新
            progress.totalPlayTime += this.currentSession.playTime;
            
            // 最終プレイ日を更新
            progress.lastPlayed = new Date().toISOString();
            
            // 連続学習日数を更新
            this.updateConsecutiveDays(progress);
            
            // バッジの確認と付与
            this.checkAndAwardBadges(progress);
            
            // 進捗データを保存
            this.saveProgressData(progress);
        }
        
        const sessionSummary = {...this.currentSession};
        this.currentSession = null;
        
        return sessionSummary;
    }
    
    /**
     * 連続学習日数を更新
     */
    updateConsecutiveDays(progress) {
        const today = new Date();
        const lastPlayed = progress.lastPlayed ? new Date(progress.lastPlayed) : null;
        
        if (!lastPlayed) {
            progress.consecutiveDays = 1;
            return;
        }
        
        const daysDiff = Math.floor((today - lastPlayed) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            // 昨日プレイしていた場合、連続日数を増加
            progress.consecutiveDays++;
        } else if (daysDiff === 0) {
            // 今日既にプレイしている場合、連続日数は維持
            // 何もしない
        } else {
            // 1日以上空いている場合、連続日数をリセット
            progress.consecutiveDays = 1;
        }
    }
    
    /**
     * バッジの確認と付与
     */
    checkAndAwardBadges(progress) {
        const newBadges = [];
        
        // 初回学習バッジ
        if (!progress.badges.includes('first-session') && progress.sessions.length === 1) {
            newBadges.push('first-session');
        }
        
        // 初回ひらがな習得バッジ
        const hiraganaCount = progress.masteredCharacters.filter(charId => {
            const stats = progress.characterStats[charId];
            return stats && stats.type === 'hiragana';
        }).length;
        
        if (!progress.badges.includes('first-hiragana') && hiraganaCount >= 1) {
            newBadges.push('first-hiragana');
        }
        
        // ひらがなマスターバッジ（基本25文字習得）
        if (!progress.badges.includes('hiragana-master') && hiraganaCount >= 25) {
            newBadges.push('hiragana-master');
        }
        
        // 連続学習バッジ
        if (!progress.badges.includes('week-streak') && progress.consecutiveDays >= 7) {
            newBadges.push('week-streak');
        }
        
        if (!progress.badges.includes('month-streak') && progress.consecutiveDays >= 30) {
            newBadges.push('month-streak');
        }
        
        // 学習時間バッジ
        const totalHours = progress.totalPlayTime / (1000 * 60 * 60);
        if (!progress.badges.includes('hour-learner') && totalHours >= 1) {
            newBadges.push('hour-learner');
        }
        
        if (!progress.badges.includes('dedicated-learner') && totalHours >= 10) {
            newBadges.push('dedicated-learner');
        }
        
        // 新しいバッジを追加
        progress.badges.push(...newBadges);
        
        return newBadges;
    }
    
    /**
     * 進捗データを読み込み
     */
    loadProgress() {
        try {
            if (this.useSessionStorage) {
                const data = sessionStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : null;
            } else {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.warn('Failed to load progress data:', error);
            return null;
        }
    }
    
    /**
     * 進捗データを保存
     */
    saveProgressData(progressData) {
        try {
            const dataString = JSON.stringify(progressData);
            
            if (this.useSessionStorage) {
                sessionStorage.setItem(this.storageKey, dataString);
            } else {
                localStorage.setItem(this.storageKey, dataString);
            }
            
            return true;
        } catch (error) {
            console.warn('Failed to save progress data:', error);
            
            // ローカルストレージが失敗した場合、セッションストレージにフォールバック
            if (!this.useSessionStorage) {
                try {
                    this.useSessionStorage = true;
                    sessionStorage.setItem(this.storageKey, dataString);
                    return true;
                } catch (sessionError) {
                    console.error('Both localStorage and sessionStorage failed:', sessionError);
                }
            }
            
            return false;
        }
    }
    
    /**
     * 文字別習得状況を取得
     */
    getCharacterMastery(characterId) {
        const progress = this.loadProgress();
        if (!progress || !progress.characterStats[characterId]) {
            return null;
        }
        
        return progress.characterStats[characterId];
    }
    
    /**
     * 全体の進捗レポートを生成
     */
    generateProgressReport() {
        const progress = this.loadProgress();
        if (!progress) {
            return null;
        }
        
        const report = {
            userId: progress.userId,
            totalPlayTime: progress.totalPlayTime,
            totalPlayTimeFormatted: this.formatPlayTime(progress.totalPlayTime),
            consecutiveDays: progress.consecutiveDays,
            totalSessions: progress.sessions.length,
            masteredCharacters: progress.masteredCharacters.length,
            weakCharacters: progress.weakCharacters.length,
            badges: progress.badges.length,
            lastPlayed: progress.lastPlayed,
            
            // 文字タイプ別統計
            hiraganaStats: this.getCharacterTypeStats(progress, 'hiragana'),
            katakanaStats: this.getCharacterTypeStats(progress, 'katakana'),
            
            // 最近のセッション統計
            recentSessions: this.getRecentSessionStats(progress),
            
            // 全体的な正答率
            overallAccuracy: this.calculateOverallAccuracy(progress),
            
            // 学習傾向
            learningTrends: this.analyzeLearningTrends(progress)
        };
        
        return report;
    }
    
    /**
     * 文字タイプ別統計を取得
     */
    getCharacterTypeStats(progress, characterType) {
        const typeStats = Object.values(progress.characterStats)
            .filter(stats => stats.type === characterType);
        
        if (typeStats.length === 0) {
            return {
                totalCharacters: 0,
                masteredCharacters: 0,
                averageAccuracy: 0,
                averageResponseTime: 0
            };
        }
        
        const masteredCount = typeStats.filter(stats => stats.masteryLevel >= 80).length;
        const totalAccuracy = typeStats.reduce((sum, stats) => sum + stats.accuracy, 0);
        const totalResponseTime = typeStats.reduce((sum, stats) => sum + stats.averageResponseTime, 0);
        
        return {
            totalCharacters: typeStats.length,
            masteredCharacters: masteredCount,
            averageAccuracy: totalAccuracy / typeStats.length,
            averageResponseTime: totalResponseTime / typeStats.length,
            masteryPercentage: (masteredCount / typeStats.length) * 100
        };
    }
    
    /**
     * 最近のセッション統計を取得
     */
    getRecentSessionStats(progress, sessionCount = 5) {
        const recentSessions = progress.sessions
            .slice(-sessionCount)
            .map(session => ({
                date: new Date(session.startTime).toLocaleDateString('ja-JP'),
                accuracy: session.accuracy,
                totalQuestions: session.totalQuestions,
                playTime: this.formatPlayTime(session.playTime),
                mode: session.mode
            }));
        
        return recentSessions;
    }
    
    /**
     * 全体的な正答率を計算
     */
    calculateOverallAccuracy(progress) {
        const allStats = Object.values(progress.characterStats);
        if (allStats.length === 0) return 0;
        
        const totalCorrect = allStats.reduce((sum, stats) => sum + stats.correctAttempts, 0);
        const totalAttempts = allStats.reduce((sum, stats) => sum + stats.totalAttempts, 0);
        
        return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    }
    
    /**
     * 学習傾向を分析
     */
    analyzeLearningTrends(progress) {
        const sessions = progress.sessions;
        if (sessions.length < 2) {
            return {
                accuracyTrend: 'insufficient_data',
                playTimeTrend: 'insufficient_data',
                improvementRate: 0
            };
        }
        
        // 最近5セッションと前5セッションを比較
        const recentSessions = sessions.slice(-5);
        const previousSessions = sessions.slice(-10, -5);
        
        const recentAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length;
        const previousAccuracy = previousSessions.length > 0 
            ? previousSessions.reduce((sum, s) => sum + s.accuracy, 0) / previousSessions.length 
            : recentAccuracy;
        
        const accuracyTrend = recentAccuracy > previousAccuracy + 5 ? 'improving' :
                             recentAccuracy < previousAccuracy - 5 ? 'declining' : 'stable';
        
        return {
            accuracyTrend,
            recentAccuracy,
            previousAccuracy,
            improvementRate: recentAccuracy - previousAccuracy
        };
    }
    
    /**
     * 苦手文字を特定
     */
    identifyWeakCharacters() {
        const progress = this.loadProgress();
        if (!progress) return [];
        
        // 苦手文字の詳細情報を取得
        const weakCharacterDetails = progress.weakCharacters.map(charId => {
            const stats = progress.characterStats[charId];
            return {
                character: charId,
                type: stats.type,
                romaji: stats.romaji,
                accuracy: stats.accuracy,
                totalAttempts: stats.totalAttempts,
                averageResponseTime: stats.averageResponseTime,
                lastAttemptDate: stats.lastAttemptDate,
                recommendedPractice: this.generatePracticeRecommendation(stats)
            };
        });
        
        // 正答率の低い順にソート
        return weakCharacterDetails.sort((a, b) => a.accuracy - b.accuracy);
    }
    
    /**
     * 練習推奨事項を生成
     */
    generatePracticeRecommendation(stats) {
        const recommendations = [];
        
        if (stats.accuracy < 30) {
            recommendations.push('基本的な文字認識練習を重点的に行いましょう');
        } else if (stats.accuracy < 50) {
            recommendations.push('選択肢を減らした練習から始めましょう');
        }
        
        if (stats.averageResponseTime > 5000) {
            recommendations.push('文字の形を覚える練習をしましょう');
        }
        
        if (stats.totalAttempts < 10) {
            recommendations.push('もう少し練習回数を増やしましょう');
        }
        
        return recommendations.length > 0 ? recommendations : ['継続的な練習を続けましょう'];
    }
    
    /**
     * プレイ時間をフォーマット
     */
    formatPlayTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}時間${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
    
    /**
     * 進捗データをエクスポート
     */
    exportProgress() {
        const progress = this.loadProgress();
        if (!progress) return null;
        
        return {
            ...progress,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    /**
     * 進捗データをインポート
     */
    importProgress(progressData) {
        try {
            // データの妥当性をチェック
            if (!progressData || typeof progressData !== 'object') {
                throw new Error('Invalid progress data format');
            }
            
            // 必要なプロパティの存在確認
            const requiredProps = ['userId', 'masteredCharacters', 'characterStats', 'sessions'];
            for (const prop of requiredProps) {
                if (!(prop in progressData)) {
                    throw new Error(`Missing required property: ${prop}`);
                }
            }
            
            // 既存データとマージ
            const existingProgress = this.loadProgress();
            const mergedProgress = this.mergeProgressData(existingProgress, progressData);
            
            // 保存
            return this.saveProgressData(mergedProgress);
        } catch (error) {
            console.error('Failed to import progress data:', error);
            return false;
        }
    }
    
    /**
     * 進捗データをマージ
     */
    mergeProgressData(existing, imported) {
        if (!existing) return imported;
        
        // セッションデータをマージ（重複除去）
        const existingSessionIds = new Set(existing.sessions.map(s => s.sessionId));
        const newSessions = imported.sessions.filter(s => !existingSessionIds.has(s.sessionId));
        
        // 文字統計をマージ（より新しいデータを優先）
        const mergedCharacterStats = {...existing.characterStats};
        Object.keys(imported.characterStats).forEach(charId => {
            const existingStats = mergedCharacterStats[charId];
            const importedStats = imported.characterStats[charId];
            
            if (!existingStats || new Date(importedStats.lastAttemptDate) > new Date(existingStats.lastAttemptDate)) {
                mergedCharacterStats[charId] = importedStats;
            }
        });
        
        return {
            ...existing,
            ...imported,
            sessions: [...existing.sessions, ...newSessions],
            characterStats: mergedCharacterStats,
            totalPlayTime: existing.totalPlayTime + imported.totalPlayTime,
            badges: [...new Set([...existing.badges, ...imported.badges])], // 重複除去
            lastPlayed: new Date(Math.max(
                new Date(existing.lastPlayed || 0),
                new Date(imported.lastPlayed || 0)
            )).toISOString()
        };
    }
    
    /**
     * 進捗データをリセット
     */
    resetProgress() {
        try {
            const defaultProgress = this.createDefaultProgress();
            return this.saveProgressData(defaultProgress);
        } catch (error) {
            console.error('Failed to reset progress:', error);
            return false;
        }
    }
    
    /**
     * ProgressTrackerを破棄
     */
    destroy() {
        if (this.currentSession) {
            this.endSession();
        }
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { ProgressTracker };
} else {
    // ブラウザ環境
    window.ProgressTracker = ProgressTracker;
}