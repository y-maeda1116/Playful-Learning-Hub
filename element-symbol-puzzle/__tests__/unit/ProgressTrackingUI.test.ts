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
describe('ProgressTrackingUI', () => {
  it('should render progress tracking UI', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges = [badges[0].id];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    expect(rendered).toBeDefined();
    expect(rendered.className).toBe('progress-tracking-ui');
    expect(rendered.querySelector('.progress-stats')).toBeDefined();
    expect(rendered.querySelector('.badges-section')).toBeDefined();
  });

  it('should display statistics title', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats h3');
    expect(statsSection?.textContent).toContain('学習進捗');
  });

  it('should display mastery level', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats');
    expect(statsSection?.textContent).toContain('75');
  });

  it('should display average accuracy', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats');
    expect(statsSection?.textContent).toContain('85.5');
  });

  it('should display streak days', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const statsSection = rendered.querySelector('.progress-stats');
    expect(statsSection?.textContent).toContain('5');
  });

  it('should display progress bar', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const progressBar = rendered.querySelector('.progress-bar');
    expect(progressBar).toBeDefined();
  });

  it('should set progress bar width correctly', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const progressFill = rendered.querySelector('.progress-fill') as HTMLElement;
    expect(progressFill?.style.width).toBe('75%');
  });

  it('should display badges section', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgesSection = rendered.querySelector('.badges-section h3');
    expect(badgesSection?.textContent).toContain('バッジ');
  });

  it('should display all badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgeElements = rendered.querySelectorAll('.badge');
    expect(badgeElements.length).toBe(badges.length);
  });

  it('should mark unlocked badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges = [badges[0].id];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const unlockedBadgeElements = rendered.querySelectorAll('.badge.unlocked');
    expect(unlockedBadgeElements.length).toBeGreaterThan(0);
  });

  it('should mark locked badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const lockedBadgeElements = rendered.querySelectorAll('.badge.locked');
    expect(lockedBadgeElements.length).toBeGreaterThan(0);
  });

  it('should display badge names', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgeNames = rendered.querySelectorAll('.badge-name');
    badgeNames.forEach((name, index) => {
      expect(name.textContent).toBe(badges[index].name);
    });
  });

  it('should display badge descriptions', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const badgeDescriptions = rendered.querySelectorAll('.badge-description');
    expect(badgeDescriptions.length).toBeGreaterThan(0);
  });

  it('should display lock icon for locked badges', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    const lockedBadges = rendered.querySelectorAll('.badge.locked');
    lockedBadges.forEach((badge) => {
      expect(badge.textContent).toContain('🔒');
    });
  });

  it('should destroy component', () => {
    const badges = getBadgesByGrade(3);
    const unlockedBadges: string[] = [];

    const ui = new ProgressTrackingUI(75, 3600, 85.5, badges, unlockedBadges, 5);
    const rendered = ui.render();

    expect(rendered.innerHTML).not.toBe('');
    ui.destroy();
    expect(rendered.innerHTML).toBe('');
  });
});
