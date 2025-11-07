/**
 * 進捗表示統合機能
 * Progress Display Integration for Hiragana/Katakana Learning
 */

class ProgressIntegration {
    constructor() {
        this.progressTracker = null;
        this.progressDisplay = null;
        this.isInitialized = false;
    }
    
    /**
     * 進捗統合システムを初期化
     */
    initialize() {
        if (this.isInitialized) return;
        
        try {
            // ProgressTrackerを初期化
            if (typeof ProgressTracker !== 'undefined') {
                this.progressTracker = new ProgressTracker({
                    storageKey: 'hiragana-learning-progress',
                    userId: 'default'
                });
                console.log('ProgressTracker initialized successfully');
            } else {
                console.warn('ProgressTracker not available');
                return false;
            }
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize progress integration:', error);
            return false;
        }
    }
    
    /**
     * 保護者向け進捗表示を作成
     */
    createParentProgressDisplay(containerId, options = {}) {
        if (!this.isInitialized) {
            console.warn('Progress integration not initialized');
            return null;
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return null;
        }
        
        try {
            // ProgressDisplayを初期化
            if (typeof ProgressDisplay !== 'undefined') {
                this.progressDisplay = new ProgressDisplay(
                    container, 
                    this.progressTracker, 
                    {
                        showDetailedStats: true,
                        showWeakCharacters: true,
                        showBadges: true,
                        refreshInterval: 30000,
                        ...options
                    }
                );
                
                console.log('Parent progress display created successfully');
                return this.progressDisplay;
            } else {
                console.error('ProgressDisplay class not available');
                return null;
            }
        } catch (error) {
            console.error('Failed to create parent progress display:', error);
            return null;
        }
    }
    
    /**
     * ゲームと進捗追跡を連携
     */
    connectGameToProgress(game) {
        if (!this.isInitialized || !this.progressTracker) {
            console.warn('Progress tracking not available');
            return false;
        }
        
        try {
            // ゲームイベントリスナーを設定
            this.setupGameEventListeners(game);
            return true;
        } catch (error) {
            console.error('Failed to connect game to progress:', error);
            return false;
        }
    }
    
    /**
     * ゲームイベントリスナーを設定
     */
    setupGameEventListeners(game) {
        if (!game) return;
        
        // セッション開始
        if (typeof game.ageGroup !== 'undefined' && typeof game.mode !== 'undefined') {
            this.progressTracker.startSession(game.ageGroup, game.mode);
        }
        
        // 回答記録（ゲームにイベントシステムがある場合）
        if (typeof game.on === 'function') {
            game.on('answer', (data) => {
                this.progressTracker.recordAttempt(
                    data.character,
                    data.isCorrect,
                    data.responseTime || 0
                );
            });
            
            game.on('sessionEnd', () => {
                this.progressTracker.endSession();
            });
        }
    }
    
    /**
     * 進捗サマリーを表示
     */
    showProgressSummary(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!this.progressTracker) {
            container.innerHTML = '<p>学習データがありません</p>';
            return;
        }
        
        try {
            const progress = this.progressTracker.loadProgress();
            if (!progress || !progress.sessions || progress.sessions.length === 0) {
                container.innerHTML = `
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <p>📚 まだ学習データがありません</p>
                        <p>ゲームを始めて学習記録を作りましょう！</p>
                    </div>
                `;
                return;
            }
            
            const totalSessions = progress.sessions.length;
            const totalPlayTime = Math.round((progress.totalPlayTime || 0) / 1000 / 60); // 分
            const masteredCount = progress.masteredCharacters ? progress.masteredCharacters.length : 0;
            
            container.innerHTML = `
                <div style="padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #1976d2;">📊 学習サマリー</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; font-size: 14px;">
                        <div><strong>セッション数:</strong> ${totalSessions}回</div>
                        <div><strong>学習時間:</strong> ${totalPlayTime}分</div>
                        <div><strong>習得文字:</strong> ${masteredCount}文字</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to show progress summary:', error);
            container.innerHTML = '<p>進捗データの読み込みに失敗しました</p>';
        }
    }
    
    /**
     * 保護者向けボタンを追加
     */
    addParentButton(containerId, buttonText = '保護者向け進捗確認') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const button = document.createElement('button');
        button.textContent = buttonText;
        button.className = 'parent-progress-button';
        button.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 0;
            transition: background-color 0.3s;
        `;
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#45a049';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#4CAF50';
        });
        
        button.addEventListener('click', () => {
            this.showParentProgressModal();
        });
        
        container.appendChild(button);
    }
    
    /**
     * 保護者向け進捗モーダルを表示
     */
    showParentProgressModal() {
        // モーダルが既に存在する場合は削除
        const existingModal = document.getElementById('parent-progress-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'parent-progress-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;
        closeButton.addEventListener('click', () => modal.remove());
        
        const progressContainer = document.createElement('div');
        progressContainer.id = 'modal-progress-container';
        
        modalContent.appendChild(closeButton);
        modalContent.appendChild(progressContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 進捗表示を作成
        this.createParentProgressDisplay('modal-progress-container');
        
        // モーダル外クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// グローバルインスタンスを作成
const progressIntegration = new ProgressIntegration();
    
    /**
     * ゲームイベントリスナーを設定
     */
    setupGameEventListeners(game) {
        // ゲーム開始時のセッション開始
        const originalStartNewRound = game.startNewRound.bind(game);
        game.startNewRound = () => {
            // 初回ラウンドの場合はセッションを開始
            if (game.totalQuestions === 0) {
                this.progressTracker.startSession(game.ageGroup, game.mode);
                console.log('Learning session started');
            }
            originalStartNewRound();
        };
        
        // 回答処理時の進捗記録
        const originalHandleAnswer = game.handleAnswer.bind(game);
        game.handleAnswer = (selectedCharacter) => {
            const startTime = Date.now();
            
            // 元の回答処理を実行
            originalHandleAnswer(selectedCharacter);
            
            // 回答結果を記録
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const isCorrect = selectedCharacter.id === game.currentCharacter.id;
            
            if (this.progressTracker.currentSession) {
                this.progressTracker.recordAttempt(
                    game.currentCharacter,
                    isCorrect,
                    responseTime,
                    1 // attemptNumber
                );
                console.log('Answer recorded:', {
                    character: game.currentCharacter.id,
                    correct: isCorrect,
                    responseTime
                });
            }
        };
        
        // ゲーム終了時のセッション終了
        const originalDestroy = game.destroy ? game.destroy.bind(game) : () => {};
        game.destroy = () => {
            if (this.progressTracker.currentSession) {
                const sessionSummary = this.progressTracker.endSession();
                console.log('Learning session ended:', sessionSummary);
                
                // 進捗表示を更新
                if (this.progressDisplay) {
                    this.progressDisplay.refreshDisplay();
                }
            }
            originalDestroy();
        };
    }
    
    /**
     * 簡易進捗サマリーを表示
     */
    showProgressSummary(containerId) {
        if (!this.isInitialized || !this.progressTracker) {
            console.warn('Progress tracking not available');
            return;
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }
        
        const report = this.progressTracker.generateProgressReport();
        if (!report) {
            container.innerHTML = '<p>学習データがありません</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="progress-summary">
                <h3>学習進捗サマリー</h3>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">習得文字数:</span>
                        <span class="stat-value">${report.masteredCharacters}文字</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">学習時間:</span>
                        <span class="stat-value">${report.totalPlayTimeFormatted}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">正答率:</span>
                        <span class="stat-value">${Math.round(report.overallAccuracy)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">連続学習:</span>
                        <span class="stat-value">${report.consecutiveDays}日</span>
                    </div>
                </div>
                <button class="show-detailed-progress" onclick="progressIntegration.showDetailedProgress()">
                    詳細な進捗を見る
                </button>
            </div>
        `;
        
        // 簡易スタイルを追加
        this.addSummaryStyles();
    }
    
    /**
     * 詳細進捗表示を表示
     */
    showDetailedProgress() {
        // モーダルまたは新しいページで詳細進捗を表示
        const modal = document.createElement('div');
        modal.className = 'progress-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>詳細な学習進捗</h2>
                    <button class="close-modal" onclick="this.closest('.progress-modal').remove()">×</button>
                </div>
                <div class="modal-body" id="detailed-progress-container">
                    <!-- ここに詳細進捗が表示されます -->
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 詳細進捗表示を作成
        this.createParentProgressDisplay('detailed-progress-container', {
            refreshInterval: 0 // モーダル内では自動更新しない
        });
        
        // モーダルスタイルを追加
        this.addModalStyles();
    }
    
    /**
     * 保護者向けボタンを追加
     */
    addParentButton(containerId, buttonText = '保護者向け進捗確認') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }
        
        const button = document.createElement('button');
        button.className = 'parent-progress-button';
        button.textContent = buttonText;
        button.onclick = () => this.showDetailedProgress();
        
        container.appendChild(button);
        
        // ボタンスタイルを追加
        this.addButtonStyles();
    }
    
    /**
     * 簡易サマリー用スタイルを追加
     */
    addSummaryStyles() {
        if (document.querySelector('#progress-summary-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'progress-summary-styles';
        style.textContent = `
            .progress-summary {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                border: 2px solid #e9ecef;
            }
            
            .progress-summary h3 {
                margin-top: 0;
                color: #495057;
                text-align: center;
            }
            
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 15px 0;
            }
            
            .stat-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .stat-label {
                display: block;
                font-size: 14px;
                color: #6c757d;
                margin-bottom: 5px;
            }
            
            .stat-value {
                display: block;
                font-size: 18px;
                font-weight: bold;
                color: #495057;
            }
            
            .show-detailed-progress {
                display: block;
                width: 100%;
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s ease;
                margin-top: 15px;
            }
            
            .show-detailed-progress:hover {
                transform: translateY(-2px);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * モーダル用スタイルを追加
     */
    addModalStyles() {
        if (document.querySelector('#progress-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'progress-modal-styles';
        style.textContent = `
            .progress-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .modal-content {
                background: white;
                border-radius: 10px;
                width: 90%;
                max-width: 1000px;
                max-height: 90%;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .modal-header h2 {
                margin: 0;
            }
            
            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px 10px;
                border-radius: 50%;
                transition: background 0.2s ease;
            }
            
            .close-modal:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .modal-body {
                max-height: 70vh;
                overflow-y: auto;
                padding: 0;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * ボタン用スタイルを追加
     */
    addButtonStyles() {
        if (document.querySelector('#parent-button-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'parent-button-styles';
        style.textContent = `
            .parent-progress-button {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin: 10px 5px;
            }
            
            .parent-progress-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 進捗統合システムを破棄
     */
    destroy() {
        if (this.progressDisplay) {
            this.progressDisplay.destroy();
            this.progressDisplay = null;
        }
        
        if (this.progressTracker) {
            this.progressTracker.destroy();
            this.progressTracker = null;
        }
        
        this.isInitialized = false;
    }
}

// グローバルインスタンスを作成
const progressIntegration = new ProgressIntegration();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { ProgressIntegration, progressIntegration };
} else {
    // ブラウザ環境
    window.ProgressIntegration = ProgressIntegration;
    window.progressIntegration = progressIntegration;
}