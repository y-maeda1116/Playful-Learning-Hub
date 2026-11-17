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
describe('RewardNotificationUI', () => {
  it('should render reward notification', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toBe('reward-notification-ui');
    expect(rendered.textContent).toContain(badge.name);
  });

  it('should display reward content section', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const rewardContent = rendered.querySelector('.reward-content');
    expect(rewardContent).toBeDefined();
  });

  it('should display badge icon', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const icon = rendered.querySelector('.reward-icon');
    expect(icon?.textContent).toBe(badge.icon);
  });

  it('should display badge name', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const name = rendered.querySelector('h3');
    expect(name?.textContent).toBe(badge.name);
  });

  it('should display custom message', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const message = 'カスタムメッセージ';
    const ui = new RewardNotificationUI(badge, message);
    const rendered = ui.render();

    expect(rendered.textContent).toContain(message);
  });

  it('should display badge description', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    const description = rendered.querySelector('.badge-description');
    expect(description?.textContent).toBe(badge.description);
  });

  it('should display badge information', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered.textContent).toContain(badge.name);
    expect(rendered.textContent).toContain(badge.description);
  });

  it('should have accessible structure', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered.querySelector('.reward-icon')).toBeDefined();
    expect(rendered.querySelector('h3')).toBeDefined();
    expect(rendered.querySelector('.badge-description')).toBeDefined();
  });

  it('should destroy component', () => {
    const badges = getBadgesByGrade(3);
    const badge = badges[0];
    const ui = new RewardNotificationUI(badge, 'バッジを獲得しました！');
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});
