/**
 * Unit tests for the UI component (split from UIComponents.test.ts, issue #37).
 * Test code moved unedited.
 */

import {
  MatchingGameUI,
  QuizGameUI,
  ChemicalFormulaPuzzleUI,
  PeriodicTableJigsawUI,
  ProgressTrackingUI,
  FeedbackUI,
  RewardNotificationUI,
} from '../../src/ui/UIComponents';
import { ElementContentManager } from '../../src/managers/ElementContentManager';
import { getBadgesByGrade } from '../../src/data/badges';
describe('FeedbackUI', () => {
  it('should render correct feedback', () => {
    const ui = new FeedbackUI(true, '正解です！', '水素について学びました');
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toContain('feedback-ui');
    expect(rendered.className).toContain('correct');
    expect(rendered.textContent).toContain('正解です！');
  });

  it('should render incorrect feedback', () => {
    const ui = new FeedbackUI(false, '不正解です', '正しい答えは酸素です');
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toContain('feedback-ui');
    expect(rendered.className).toContain('incorrect');
    expect(rendered.textContent).toContain('不正解です');
  });

  it('should display correct icon for correct answer', () => {
    const ui = new FeedbackUI(true, '正解です！');
    const rendered = ui.render();

    const icon = rendered.querySelector('.feedback-icon');
    expect(icon?.textContent).toContain('✓');
  });

  it('should display incorrect icon for incorrect answer', () => {
    const ui = new FeedbackUI(false, '不正解です');
    const rendered = ui.render();

    const icon = rendered.querySelector('.feedback-icon');
    expect(icon?.textContent).toContain('✗');
  });

  it('should display feedback message', () => {
    const message = '素晴らしい！';
    const ui = new FeedbackUI(true, message);
    const rendered = ui.render();

    const messageElement = rendered.querySelector('.feedback-message');
    expect(messageElement?.textContent).toBe(message);
  });

  it('should display additional info when provided', () => {
    const additionalInfo = '追加情報';
    const ui = new FeedbackUI(true, '正解です！', additionalInfo);
    const rendered = ui.render();

    expect(rendered.textContent).toContain(additionalInfo);
  });

  it('should have feedback-info element when additional info is provided', () => {
    const ui = new FeedbackUI(true, '正解です！', '追加情報');
    const rendered = ui.render();

    const infoElement = rendered.querySelector('.feedback-info');
    expect(infoElement).toBeDefined();
    expect(infoElement?.textContent).toBe('追加情報');
  });

  it('should not display additional info when not provided', () => {
    const ui = new FeedbackUI(true, '正解です！');
    const rendered = ui.render();

    const infoElement = rendered.querySelector('.feedback-info');
    expect(infoElement).toBeNull();
  });

  it('should have accessible structure', () => {
    const ui = new FeedbackUI(true, '正解です！', '追加情報');
    const rendered = ui.render();

    expect(rendered.querySelector('.feedback-icon')).toBeDefined();
    expect(rendered.querySelector('.feedback-message')).toBeDefined();
  });

  it('should destroy component', () => {
    const ui = new FeedbackUI(true, '正解です！');
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});
