/**
 * シンプルなテストスクリプト（Node.js不要）
 * ブラウザのコンソールで実行可能
 */

// シンプルなアサーション関数
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
}

function assertGreaterThan(actual, expected, message) {
    if (actual <= expected) {
        throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
    }
}

function assertDefined(value, message) {
    if (value === undefined || value === null) {
        throw new Error(message || 'Expected value to be defined');
    }
}

function assertArrayLength(array, expectedLength, message) {
    if (!array || array.length !== expectedLength) {
        throw new Error(message || `Expected array length ${expectedLength}, but got ${array ? array.length : 'undefined'}`);
    }
}

function assertContains(array, item, message) {
    if (!array || !array.includes(item)) {
        throw new Error(message || `Expected array to contain ${item}`);
    }
}

// テスト実行関数
function runTest(testName, testFunction) {
    try {
        testFunction();
        console.log(`✅ ${testName}: PASSED`);
        return true;
    } catch (error) {
        console.error(`❌ ${testName}: FAILED - ${error.message}`);
        return false;
    }
}

// テストスイート実行関数
function runTestSuite(suiteName, tests) {
    console.log(`\n🧪 Running ${suiteName}...`);
    console.log('='.repeat(50));
    
    let passed = 0;
    let total = tests.length;
    
    tests.forEach(test => {
        if (runTest(test.name, test.fn)) {
            passed++;
        }
    });
    
    console.log(`\n📊 ${suiteName} Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log(`🎉 All tests in ${suiteName} passed!`);
    } else {
        console.log(`⚠️ ${total - passed} tests failed in ${suiteName}`);
    }
    
    return { passed, total };
}

// メインテスト実行関数
function runAllSimpleTests() {
    console.clear();
    console.log('🚀 Starting Simple Test Suite for Hiragana Learning System');
    console.log('=' .repeat(60));
    
    let totalPassed = 0;
    let totalTests = 0;
    
    // Character Data Tests
    const characterDataTests = [
        {
            name: 'Character class creation',
            fn: () => {
                const char = new Character('あ', 'hiragana', 'a', 1);
                assertEqual(char.id, 'あ');
                assertEqual(char.type, 'hiragana');
                assertEqual(char.romaji, 'a');
                assertEqual(char.difficulty, 1);
            }
        },
        {
            name: 'Basic hiragana data exists',
            fn: () => {
                assertDefined(basicHiraganaData);
                assertGreaterThan(basicHiraganaData.length, 0);
                assertEqual(basicHiraganaData[0].id, 'あ');
            }
        },
        {
            name: 'Full hiragana data contains basic data',
            fn: () => {
                assertDefined(fullHiraganaData);
                assertGreaterThan(fullHiraganaData.length, basicHiraganaData.length);
            }
        },
        {
            name: 'Katakana data exists',
            fn: () => {
                assertDefined(katakanaData);
                assertGreaterThan(katakanaData.length, 0);
                assertEqual(katakanaData[0].type, 'katakana');
            }
        },
        {
            name: 'getCharacterSetForAge function',
            fn: () => {
                const age3to4 = getCharacterSetForAge('3-4');
                assertEqual(age3to4.length, basicHiraganaData.length);
                
                const age5to6 = getCharacterSetForAge('5-6', 'hiragana');
                assertEqual(age5to6.length, fullHiraganaData.length);
            }
        },
        {
            name: 'getRandomCharacters function',
            fn: () => {
                const random3 = getRandomCharacters(basicHiraganaData, 3);
                assertArrayLength(random3, 3);
                
                const random5 = getRandomCharacters(basicHiraganaData, 5);
                assertArrayLength(random5, 5);
            }
        }
    ];
    
    const result1 = runTestSuite('Character Data Tests', characterDataTests);
    totalPassed += result1.passed;
    totalTests += result1.total;
    
    // Audio Manager Tests
    const audioManagerTests = [
        {
            name: 'AudioManager initialization',
            fn: () => {
                const audioManager = new AudioManager();
                assertDefined(audioManager);
                assertDefined(audioManager.audioCache);
            }
        },
        {
            name: 'Audio preloading does not throw',
            fn: () => {
                const audioManager = new AudioManager();
                // 実際の音声ファイルがなくてもエラーにならないことを確認
                audioManager.preloadCharacterAudio('あ');
                assert(true, 'Audio preloading completed without error');
            }
        }
    ];
    
    const result2 = runTestSuite('Audio Manager Tests', audioManagerTests);
    totalPassed += result2.passed;
    totalTests += result2.total;
    
    // Progress Tracker Tests
    const progressTrackerTests = [
        {
            name: 'ProgressTracker initialization',
            fn: () => {
                const tracker = new ProgressTracker('test-user');
                assertDefined(tracker);
                assertEqual(tracker.userId, 'test-user');
            }
        },
        {
            name: 'Session recording',
            fn: () => {
                const tracker = new ProgressTracker('test-user');
                tracker.startSession('3-4', 'hiragana');
                assertDefined(tracker.currentSession);
                assertEqual(tracker.currentSession.ageGroup, '3-4');
                assertEqual(tracker.currentSession.mode, 'hiragana');
            }
        },
        {
            name: 'Accuracy calculation',
            fn: () => {
                const tracker = new ProgressTracker('test-user');
                tracker.startSession('3-4', 'hiragana');
                
                tracker.recordAttempt('あ', true, 1000);
                tracker.recordAttempt('い', false, 2000);
                tracker.recordAttempt('う', true, 1500);
                
                const accuracy = tracker.calculateAccuracy();
                assertEqual(accuracy, 66.67);
            }
        }
    ];
    
    const result3 = runTestSuite('Progress Tracker Tests', progressTrackerTests);
    totalPassed += result3.passed;
    totalTests += result3.total;
    
    // Badge System Tests
    const badgeSystemTests = [
        {
            name: 'BadgeSystem initialization',
            fn: () => {
                const badgeSystem = new BadgeSystem();
                assertDefined(badgeSystem);
                assertDefined(badgeSystem.earnedBadges);
            }
        },
        {
            name: 'First session badge award',
            fn: () => {
                const badgeSystem = new BadgeSystem();
                const mockProgress = {
                    sessions: [{ sessionId: 'test' }],
                    totalPlayTime: 60000
                };
                
                const newBadges = badgeSystem.checkAndAwardBadges(mockProgress);
                const hasFirstSessionBadge = newBadges.some(badge => badge.id === 'first-session');
                assert(hasFirstSessionBadge, 'Should award first session badge');
            }
        }
    ];
    
    const result4 = runTestSuite('Badge System Tests', badgeSystemTests);
    totalPassed += result4.passed;
    totalTests += result4.total;
    
    // 最終結果
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 Total: ${totalTests} tests`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalTests - totalPassed}`);
    console.log(`📈 Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);
    
    if (totalPassed === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! 🎉');
        console.log('✨ The Hiragana Learning System is working correctly!');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the implementation.');
    }
    
    return {
        total: totalTests,
        passed: totalPassed,
        failed: totalTests - totalPassed,
        successRate: Math.round((totalPassed / totalTests) * 100)
    };
}

// ブラウザ環境での自動実行
if (typeof window !== 'undefined') {
    console.log('🧪 Simple Test Script loaded. Run runAllSimpleTests() to execute tests.');
    
    // 5秒後に自動実行（オプション）
    setTimeout(() => {
        if (confirm('自動的にテストを実行しますか？')) {
            runAllSimpleTests();
        }
    }, 2000);
}

// Node.js環境での実行（もし利用可能な場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllSimpleTests,
        runTestSuite,
        runTest,
        assert,
        assertEqual,
        assertGreaterThan,
        assertDefined,
        assertArrayLength,
        assertContains
    };
}