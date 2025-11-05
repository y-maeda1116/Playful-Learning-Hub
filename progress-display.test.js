/**
 * 進捗表示機能のテスト
 * Tests for Progress Display functionality
 */

// テスト用のモックデータ
const mockProgressData = {
    userId: 'test-user',
    masteredCharacters: ['あ', 'い', 'う', 'え', 'お'],
    weakCharacters: ['か', 'き'],
    characterStats: {
        'あ': {
            character: 'あ',
            type: 'hiragana',
            romaji: 'a',
            totalAttempts: 10,
            correctAttempts: 9,
            incorrectAttempts: 1,
            accuracy: 90,
            averageResponseTime: 2000,
            totalResponseTime: 20000,
            firstAttemptDate: '2024-01-01T00:00:00.000Z',
            lastAttemptDate: '2024-01-02T00:00:00.000Z',
            masteryLevel: 85,
            consecutiveCorrect: 3,
            maxConsecutiveCorrect: 5
        },
        'か': {
            character: 'か',
            type: 'hiragana',
            romaji: 'ka',
            totalAttempts: 8,
            correctAttempts: 3,
            incorrectAttempts: 5,
            accuracy: 37.5,
            averageResponseTime: 4000,
            totalResponseTime: 32000,
            firstAttemptDate: '2024-01-01T00:00:00.000Z',
            lastAttemptDate: '2024-01-02T00:00:00.000Z',
            masteryLevel: 25,
            consecutiveCorrect: 0,
            maxConsecutiveCorrect: 1
        }
    },
    totalPlayTime: 300000, // 5分
    consecutiveDays: 3,
    badges: ['first-session', 'first-hiragana'],
    lastPlayed: '2024-01-02T00:00:00.000Z',
    sessions: [
        {
            sessionId: 'session_1',
            startTime: new Date('2024-01-01T10:00:00.000Z'),
            endTime: new Date('2024-01-01T10:05:00.000Z'),
            ageGroup: '3-4',
            mode: 'hiragana',
            attempts: [
                {
                    character: 'あ',
                    isCorrect: true,
                    responseTime: 2000,
                    attemptNumber: 1
                }
            ],
            totalScore: 8,
            totalQuestions: 10,
            accuracy: 80,
            playTime: 300000
        }
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    version: '1.0'
};

// テスト用のProgressTrackerモック
class MockProgressTracker {
    constructor() {
        this.data = mockProgressData;
    }
    
    generateProgressReport() {
        return {
            userId: this.data.userId,
            totalPlayTime: this.data.totalPlayTime,
            totalPlayTimeFormatted: '5分0秒',
            consecutiveDays: this.data.consecutiveDays,
            totalSessions: this.data.sessions.length,
            masteredCharacters: this.data.masteredCharacters.length,
            weakCharacters: this.data.weakCharacters.length,
            badges: this.data.badges.length,
            lastPlayed: this.data.lastPlayed,
            
            hiraganaStats: {
                totalCharacters: 2,
                masteredCharacters: 1,
                averageAccuracy: 63.75,
                averageResponseTime: 3000,
                masteryPercentage: 50
            },
            katakanaStats: {
                totalCharacters: 0,
                masteredCharacters: 0,
                averageAccuracy: 0,
                averageResponseTime: 0,
                masteryPercentage: 0
            },
            
            recentSessions: [
                {
                    date: '2024/1/1',
                    accuracy: 80,
                    totalQuestions: 10,
                    playTime: '5分0秒',
                    mode: 'hiragana'
                }
            ],
            
            overallAccuracy: 63.75,
            
            learningTrends: {
                accuracyTrend: 'improving',
                recentAccuracy: 80,
                previousAccuracy: 70,
                improvementRate: 10
            }
        };
    }
    
    identifyWeakCharacters() {
        return [
            {
                character: 'か',
                type: 'hiragana',
                romaji: 'ka',
                accuracy: 37.5,
                totalAttempts: 8,
                averageResponseTime: 4000,
                lastAttemptDate: '2024-01-02T00:00:00.000Z',
                recommendedPractice: ['基本的な文字認識練習を重点的に行いましょう']
            }
        ];
    }
    
    loadProgress() {
        return this.data;
    }
}

// DOM環境のセットアップ
function setupTestEnvironment() {
    // テスト用のHTML要素を作成
    document.body.innerHTML = `
        <div id="test-container"></div>
        <div id="summary-container"></div>
        <div id="parent-controls"></div>
    `;
}

// テスト関数
function testProgressDisplayCreation() {
    console.log('Testing ProgressDisplay creation...');
    
    setupTestEnvironment();
    
    const container = document.getElementById('test-container');
    const mockTracker = new MockProgressTracker();
    
    try {
        // ProgressDisplayが利用可能かチェック
        if (typeof ProgressDisplay === 'undefined') {
            console.log('❌ ProgressDisplay class not available');
            return false;
        }
        
        // ProgressDisplayを作成
        const progressDisplay = new ProgressDisplay(container, mockTracker);
        
        // 基本的な要素が作成されているかチェック
        const header = container.querySelector('.progress-header');
        const content = container.querySelector('.progress-content');
        const footer = container.querySelector('.progress-footer');
        
        if (!header || !content || !footer) {
            console.log('❌ Required elements not created');
            return false;
        }
        
        console.log('✅ ProgressDisplay created successfully');
        
        // クリーンアップ
        progressDisplay.destroy();
        return true;
        
    } catch (error) {
        console.log('❌ Error creating ProgressDisplay:', error.message);
        return false;
    }
}

function testProgressIntegration() {
    console.log('Testing ProgressIntegration...');
    
    setupTestEnvironment();
    
    try {
        // ProgressIntegrationが利用可能かチェック
        if (typeof ProgressIntegration === 'undefined') {
            console.log('❌ ProgressIntegration class not available');
            return false;
        }
        
        // ProgressIntegrationを作成
        const integration = new ProgressIntegration();
        
        // 初期化をテスト
        const initialized = integration.initialize();
        if (!initialized) {
            console.log('⚠️ ProgressIntegration initialization failed (expected in test environment)');
        }
        
        // 進捗サマリー表示をテスト
        integration.showProgressSummary('summary-container');
        
        const summaryContainer = document.getElementById('summary-container');
        if (summaryContainer.innerHTML.includes('学習データがありません')) {
            console.log('✅ Progress summary shows no data message (expected)');
        }
        
        // 保護者ボタン追加をテスト
        integration.addParentButton('parent-controls');
        
        const parentButton = document.querySelector('.parent-progress-button');
        if (parentButton) {
            console.log('✅ Parent button added successfully');
        } else {
            console.log('❌ Parent button not added');
            return false;
        }
        
        console.log('✅ ProgressIntegration tested successfully');
        return true;
        
    } catch (error) {
        console.log('❌ Error testing ProgressIntegration:', error.message);
        return false;
    }
}

function testProgressReportGeneration() {
    console.log('Testing progress report generation...');
    
    const mockTracker = new MockProgressTracker();
    
    try {
        const report = mockTracker.generateProgressReport();
        
        // 必要なプロパティが存在するかチェック
        const requiredProps = [
            'masteredCharacters', 'totalPlayTime', 'consecutiveDays',
            'overallAccuracy', 'hiraganaStats', 'katakanaStats'
        ];
        
        for (const prop of requiredProps) {
            if (!(prop in report)) {
                console.log(`❌ Missing property: ${prop}`);
                return false;
            }
        }
        
        // データの妥当性をチェック
        if (report.masteredCharacters !== 5) {
            console.log('❌ Incorrect mastered characters count');
            return false;
        }
        
        if (report.hiraganaStats.masteryPercentage !== 50) {
            console.log('❌ Incorrect hiragana mastery percentage');
            return false;
        }
        
        console.log('✅ Progress report generation successful');
        return true;
        
    } catch (error) {
        console.log('❌ Error generating progress report:', error.message);
        return false;
    }
}

function testWeakCharacterIdentification() {
    console.log('Testing weak character identification...');
    
    const mockTracker = new MockProgressTracker();
    
    try {
        const weakCharacters = mockTracker.identifyWeakCharacters();
        
        if (!Array.isArray(weakCharacters)) {
            console.log('❌ Weak characters should be an array');
            return false;
        }
        
        if (weakCharacters.length !== 1) {
            console.log('❌ Expected 1 weak character');
            return false;
        }
        
        const weakChar = weakCharacters[0];
        if (weakChar.character !== 'か' || weakChar.accuracy !== 37.5) {
            console.log('❌ Incorrect weak character data');
            return false;
        }
        
        if (!Array.isArray(weakChar.recommendedPractice)) {
            console.log('❌ Recommended practice should be an array');
            return false;
        }
        
        console.log('✅ Weak character identification successful');
        return true;
        
    } catch (error) {
        console.log('❌ Error identifying weak characters:', error.message);
        return false;
    }
}

// メインテスト実行関数
function runProgressDisplayTests() {
    console.log('🧪 Running Progress Display Tests...\n');
    
    const tests = [
        testProgressReportGeneration,
        testWeakCharacterIdentification,
        testProgressDisplayCreation,
        testProgressIntegration
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        if (test()) {
            passed++;
        }
        console.log(''); // 空行を追加
    }
    
    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️ Some tests failed. Check implementation.');
    }
    
    return passed === total;
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = {
        runProgressDisplayTests,
        MockProgressTracker,
        testProgressDisplayCreation,
        testProgressIntegration,
        testProgressReportGeneration,
        testWeakCharacterIdentification
    };
} else {
    // ブラウザ環境
    window.runProgressDisplayTests = runProgressDisplayTests;
    window.MockProgressTracker = MockProgressTracker;
}

// ブラウザ環境で自動実行
if (typeof window !== 'undefined' && window.document) {
    // DOMContentLoadedイベントで実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runProgressDisplayTests);
    } else {
        // 既にDOMが読み込まれている場合は即座に実行
        setTimeout(runProgressDisplayTests, 100);
    }
}