/**
 * 文字書き練習機能
 * Writing Practice Feature for Hiragana and Katakana
 */

class WritingPracticeGame {
    constructor(container, options = {}) {
        this.container = container;
        this.currentCharacter = null;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.strokePaths = [];
        this.currentStroke = [];
        this.guideStrokes = [];
        this.completedStrokes = 0;
        
        // 設定
        this.options = {
            canvasSize: options.canvasSize || 300,
            strokeWidth: options.strokeWidth || 8,
            guideStrokeWidth: options.guideStrokeWidth || 2,
            strokeColor: options.strokeColor || '#2c3e50',
            guideColor: options.guideColor || '#bdc3c7',
            correctColor: options.correctColor || '#27ae60',
            incorrectColor: options.incorrectColor || '#e74c3c',
            showStrokeOrder: options.showStrokeOrder !== false,
            tolerance: options.tolerance || 30, // ピクセル単位の許容範囲
            ...options
        };
        
        // タッチサポートの検出
        this.touchSupported = 'ontouchstart' in window;
        
        this.initializeCanvas();
        this.bindEvents();
    }
    
    /**
     * Canvasの初期化
     */
    initializeCanvas() {
        // メインコンテナを作成
        this.practiceContainer = document.createElement('div');
        this.practiceContainer.className = 'writing-practice-container';
        this.practiceContainer.innerHTML = `
            <div class="practice-header">
                <div class="character-display"></div>
                <div class="stroke-counter">
                    画数: <span class="current-stroke">0</span> / <span class="total-strokes">0</span>
                </div>
            </div>
            
            <div class="canvas-container">
                <canvas class="writing-canvas"></canvas>
                <div class="stroke-guide-overlay"></div>
            </div>
            
            <div class="practice-controls">
                <button class="show-guide-btn">お手本を表示</button>
                <button class="clear-btn">消去</button>
                <button class="hint-btn">ヒント</button>
                <button class="next-stroke-btn" style="display: none;">次の画</button>
            </div>
            
            <div class="practice-feedback" style="display: none;">
                <div class="feedback-message"></div>
                <button class="continue-btn">続ける</button>
            </div>
        `;
        
        this.container.appendChild(this.practiceContainer);
        
        // Canvas要素を取得して設定
        this.canvas = this.practiceContainer.querySelector('.writing-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas サイズを設定
        const size = this.options.canvasSize;
        this.canvas.width = size;
        this.canvas.height = size;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        // 描画設定
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.options.strokeColor;
        this.ctx.lineWidth = this.options.strokeWidth;
        
        // UI要素の参照を保存
        this.characterDisplay = this.practiceContainer.querySelector('.character-display');
        this.currentStrokeDisplay = this.practiceContainer.querySelector('.current-stroke');
        this.totalStrokesDisplay = this.practiceContainer.querySelector('.total-strokes');
        this.feedbackContainer = this.practiceContainer.querySelector('.practice-feedback');
        this.guideOverlay = this.practiceContainer.querySelector('.stroke-guide-overlay');
    }
    
    /**
     * イベントバインディング
     */
    bindEvents() {
        // 描画イベント
        if (this.touchSupported) {
            this.canvas.addEventListener('touchstart', (e) => this.handleDrawStart(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleDrawMove(e), { passive: false });
            this.canvas.addEventListener('touchend', (e) => this.handleDrawEnd(e), { passive: false });
        } else {
            this.canvas.addEventListener('mousedown', (e) => this.handleDrawStart(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleDrawMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.handleDrawEnd(e));
            this.canvas.addEventListener('mouseleave', (e) => this.handleDrawEnd(e));
        }
        
        // コントロールボタン
        this.practiceContainer.querySelector('.show-guide-btn').addEventListener('click', () => {
            this.toggleGuideDisplay();
        });
        
        this.practiceContainer.querySelector('.clear-btn').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        this.practiceContainer.querySelector('.hint-btn').addEventListener('click', () => {
            this.showHint();
        });
        
        this.practiceContainer.querySelector('.next-stroke-btn').addEventListener('click', () => {
            this.nextStroke();
        });
        
        this.practiceContainer.querySelector('.continue-btn').addEventListener('click', () => {
            this.hideFeedback();
        });
    }
    
    /**
     * 文字の練習を開始
     */
    startPractice(character) {
        this.currentCharacter = character;
        this.completedStrokes = 0;
        this.strokePaths = [];
        this.guideStrokes = character.strokeOrder || [];
        
        // UIを更新
        this.characterDisplay.textContent = character.id;
        this.totalStrokesDisplay.textContent = this.guideStrokes.length;
        this.updateStrokeCounter();
        
        // Canvasをクリア
        this.clearCanvas();
        
        // 最初の画のガイドを表示
        if (this.guideStrokes.length > 0) {
            this.showCurrentStrokeGuide();
        }
        
        this.hideFeedback();
    }
    
    /**
     * 描画開始処理
     */
    handleDrawStart(event) {
        event.preventDefault();
        this.isDrawing = true;
        this.currentStroke = [];
        
        const point = this.getEventPoint(event);
        this.currentStroke.push(point);
        
        // 描画開始点を描画
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.options.strokeWidth / 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    /**
     * 描画移動処理
     */
    handleDrawMove(event) {
        if (!this.isDrawing) return;
        
        event.preventDefault();
        const point = this.getEventPoint(event);
        this.currentStroke.push(point);
        
        // 線を描画
        if (this.currentStroke.length > 1) {
            const prevPoint = this.currentStroke[this.currentStroke.length - 2];
            
            this.ctx.beginPath();
            this.ctx.moveTo(prevPoint.x, prevPoint.y);
            this.ctx.lineTo(point.x, point.y);
            this.ctx.stroke();
        }
    }
    
    /**
     * 描画終了処理
     */
    handleDrawEnd(event) {
        if (!this.isDrawing) return;
        
        event.preventDefault();
        this.isDrawing = false;
        
        // 現在の画を保存
        if (this.currentStroke.length > 0) {
            this.strokePaths.push([...this.currentStroke]);
            this.evaluateCurrentStroke();
        }
        
        this.currentStroke = [];
    }
    
    /**
     * イベントから座標を取得
     */
    getEventPoint(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    /**
     * 現在の画を評価
     */
    evaluateCurrentStroke() {
        if (this.completedStrokes >= this.guideStrokes.length) {
            this.showCompletionFeedback();
            return;
        }
        
        const currentGuideStroke = this.guideStrokes[this.completedStrokes];
        const userStroke = this.currentStroke;
        
        // 画の評価を実行
        const evaluation = this.evaluateStrokeAccuracy(userStroke, currentGuideStroke);
        
        if (evaluation.isCorrect) {
            this.completedStrokes++;
            this.updateStrokeCounter();
            this.showStrokeFeedback(true, evaluation.accuracy);
            
            // 次の画のガイドを表示
            if (this.completedStrokes < this.guideStrokes.length) {
                setTimeout(() => {
                    this.showCurrentStrokeGuide();
                }, 1000);
            } else {
                // 全ての画が完了
                setTimeout(() => {
                    this.showCompletionFeedback();
                }, 1000);
            }
        } else {
            this.showStrokeFeedback(false, evaluation.accuracy);
        }
    }
    
    /**
     * 画の正確性を評価
     */
    evaluateStrokeAccuracy(userStroke, guideStroke) {
        if (!guideStroke || !guideStroke.path) {
            return { isCorrect: true, accuracy: 100 };
        }
        
        // 簡単な評価アルゴリズム：開始点と終了点の距離をチェック
        if (userStroke.length < 2) {
            return { isCorrect: false, accuracy: 0 };
        }
        
        const userStart = userStroke[0];
        const userEnd = userStroke[userStroke.length - 1];
        
        // ガイドストロークのパスから開始点と終了点を推定
        const guidePoints = this.parseStrokePath(guideStroke.path);
        if (guidePoints.length < 2) {
            return { isCorrect: true, accuracy: 100 };
        }
        
        const guideStart = guidePoints[0];
        const guideEnd = guidePoints[guidePoints.length - 1];
        
        // 距離を計算
        const startDistance = this.calculateDistance(userStart, guideStart);
        const endDistance = this.calculateDistance(userEnd, guideEnd);
        
        const tolerance = this.options.tolerance;
        const isCorrect = startDistance <= tolerance && endDistance <= tolerance;
        
        // 正確性を計算（0-100%）
        const maxDistance = Math.sqrt(this.canvas.width * this.canvas.width + this.canvas.height * this.canvas.height);
        const averageDistance = (startDistance + endDistance) / 2;
        const accuracy = Math.max(0, 100 - (averageDistance / maxDistance) * 100);
        
        return { isCorrect, accuracy: Math.round(accuracy) };
    }
    
    /**
     * SVGパスを座標配列に変換
     */
    parseStrokePath(pathString) {
        // 簡単なパス解析（M, L, Q, C コマンドに対応）
        const points = [];
        const commands = pathString.match(/[MLQC][^MLQC]*/g) || [];
        
        commands.forEach(command => {
            const type = command[0];
            const coords = command.slice(1).trim().split(/[\s,]+/).map(Number);
            
            switch (type) {
                case 'M': // MoveTo
                    if (coords.length >= 2) {
                        points.push({ x: coords[0], y: coords[1] });
                    }
                    break;
                case 'L': // LineTo
                    if (coords.length >= 2) {
                        points.push({ x: coords[0], y: coords[1] });
                    }
                    break;
                case 'Q': // QuadraticCurveTo
                    if (coords.length >= 4) {
                        points.push({ x: coords[2], y: coords[3] });
                    }
                    break;
                case 'C': // CubicCurveTo
                    if (coords.length >= 6) {
                        points.push({ x: coords[4], y: coords[5] });
                    }
                    break;
            }
        });
        
        return points;
    }
    
    /**
     * 2点間の距離を計算
     */
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 現在の画のガイドを表示
     */
    showCurrentStrokeGuide() {
        if (this.completedStrokes >= this.guideStrokes.length) return;
        
        const currentGuide = this.guideStrokes[this.completedStrokes];
        if (!currentGuide || !currentGuide.path) return;
        
        // ガイドオーバーレイをクリア
        this.guideOverlay.innerHTML = '';
        
        // SVGでガイドストロークを表示
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.options.canvasSize);
        svg.setAttribute('height', this.options.canvasSize);
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', currentGuide.path);
        path.setAttribute('stroke', this.options.guideColor);
        path.setAttribute('stroke-width', this.options.guideStrokeWidth);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '5,5');
        
        // アニメーション効果
        path.style.animation = 'guide-pulse 2s ease-in-out infinite';
        
        svg.appendChild(path);
        this.guideOverlay.appendChild(svg);
        
        // 画順番号を表示
        if (this.options.showStrokeOrder) {
            this.showStrokeOrderNumber(currentGuide, this.completedStrokes + 1);
        }
    }
    
    /**
     * 画順番号を表示
     */
    showStrokeOrderNumber(stroke, number) {
        const points = this.parseStrokePath(stroke.path);
        if (points.length === 0) return;
        
        const startPoint = points[0];
        
        const numberElement = document.createElement('div');
        numberElement.className = 'stroke-number';
        numberElement.textContent = number;
        numberElement.style.cssText = `
            position: absolute;
            left: ${startPoint.x - 15}px;
            top: ${startPoint.y - 15}px;
            width: 30px;
            height: 30px;
            background-color: #e74c3c;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            z-index: 10;
            animation: number-bounce 0.5s ease-out;
        `;
        
        this.guideOverlay.appendChild(numberElement);
        
        // 3秒後に番号を削除
        setTimeout(() => {
            if (numberElement.parentNode) {
                numberElement.parentNode.removeChild(numberElement);
            }
        }, 3000);
    }
    
    /**
     * 画のフィードバックを表示
     */
    showStrokeFeedback(isCorrect, accuracy) {
        const feedbackMessage = this.feedbackContainer.querySelector('.feedback-message');
        
        if (isCorrect) {
            feedbackMessage.innerHTML = `
                <div class="stroke-feedback correct">
                    <span class="feedback-icon">✓</span>
                    <span class="feedback-text">よくできました！</span>
                    <div class="accuracy-display">正確性: ${accuracy}%</div>
                </div>
            `;
            this.feedbackContainer.className = 'practice-feedback correct';
        } else {
            feedbackMessage.innerHTML = `
                <div class="stroke-feedback incorrect">
                    <span class="feedback-icon">↻</span>
                    <span class="feedback-text">もう一度挑戦してみましょう</span>
                    <div class="accuracy-display">正確性: ${accuracy}%</div>
                </div>
            `;
            this.feedbackContainer.className = 'practice-feedback incorrect';
        }
        
        this.feedbackContainer.style.display = 'block';
        
        // 自動的にフィードバックを隠す
        setTimeout(() => {
            this.hideFeedback();
        }, 2000);
    }
    
    /**
     * 完了フィードバックを表示
     */
    showCompletionFeedback() {
        const feedbackMessage = this.feedbackContainer.querySelector('.feedback-message');
        
        feedbackMessage.innerHTML = `
            <div class="completion-feedback">
                <div class="completion-icon">🎉</div>
                <div class="completion-text">
                    <h3>「${this.currentCharacter.id}」完成！</h3>
                    <p>とても上手に書けました！</p>
                </div>
                <div class="completion-stats">
                    <div>画数: ${this.guideStrokes.length}</div>
                    <div>完了した画: ${this.completedStrokes}</div>
                </div>
            </div>
        `;
        
        this.feedbackContainer.className = 'practice-feedback completion';
        this.feedbackContainer.style.display = 'block';
        
        // 完了イベントを発火
        this.onPracticeComplete && this.onPracticeComplete({
            character: this.currentCharacter,
            completedStrokes: this.completedStrokes,
            totalStrokes: this.guideStrokes.length,
            strokePaths: this.strokePaths
        });
    }
    
    /**
     * フィードバックを隠す
     */
    hideFeedback() {
        this.feedbackContainer.style.display = 'none';
    }
    
    /**
     * ガイド表示を切り替え
     */
    toggleGuideDisplay() {
        const button = this.practiceContainer.querySelector('.show-guide-btn');
        const isVisible = this.guideOverlay.style.opacity !== '0';
        
        if (isVisible) {
            this.guideOverlay.style.opacity = '0';
            button.textContent = 'お手本を表示';
        } else {
            this.guideOverlay.style.opacity = '1';
            this.showCurrentStrokeGuide();
            button.textContent = 'お手本を隠す';
        }
    }
    
    /**
     * Canvasをクリア
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.strokePaths = [];
        this.completedStrokes = 0;
        this.updateStrokeCounter();
        this.guideOverlay.innerHTML = '';
        
        // 最初の画のガイドを再表示
        if (this.currentCharacter && this.guideStrokes.length > 0) {
            this.showCurrentStrokeGuide();
        }
    }
    
    /**
     * ヒントを表示
     */
    showHint() {
        if (this.completedStrokes >= this.guideStrokes.length) return;
        
        // 現在の画の開始点を強調表示
        const currentGuide = this.guideStrokes[this.completedStrokes];
        if (!currentGuide || !currentGuide.path) return;
        
        const points = this.parseStrokePath(currentGuide.path);
        if (points.length === 0) return;
        
        const startPoint = points[0];
        
        // ヒント表示要素を作成
        const hint = document.createElement('div');
        hint.className = 'writing-hint';
        hint.style.cssText = `
            position: absolute;
            left: ${startPoint.x - 20}px;
            top: ${startPoint.y - 20}px;
            width: 40px;
            height: 40px;
            border: 3px solid #e74c3c;
            border-radius: 50%;
            animation: hint-pulse 1s ease-in-out 3;
            pointer-events: none;
            z-index: 20;
        `;
        
        this.guideOverlay.appendChild(hint);
        
        // 3秒後にヒントを削除
        setTimeout(() => {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        }, 3000);
    }
    
    /**
     * 次の画に進む
     */
    nextStroke() {
        if (this.completedStrokes < this.guideStrokes.length) {
            this.showCurrentStrokeGuide();
        }
    }
    
    /**
     * 画数カウンターを更新
     */
    updateStrokeCounter() {
        this.currentStrokeDisplay.textContent = this.completedStrokes;
    }
    
    /**
     * 練習結果を取得
     */
    getPracticeResults() {
        return {
            character: this.currentCharacter,
            completedStrokes: this.completedStrokes,
            totalStrokes: this.guideStrokes.length,
            strokePaths: this.strokePaths,
            isCompleted: this.completedStrokes >= this.guideStrokes.length
        };
    }
    
    /**
     * 書き練習を破棄
     */
    destroy() {
        if (this.practiceContainer && this.practiceContainer.parentNode) {
            this.practiceContainer.parentNode.removeChild(this.practiceContainer);
        }
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WritingPracticeGame };
} else {
    window.WritingPracticeGame = WritingPracticeGame;
}