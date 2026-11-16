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

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { ProgressIntegration, progressIntegration };
} else {
    // ブラウザ環境
    window.ProgressIntegration = ProgressIntegration;
    window.progressIntegration = progressIntegration;
}