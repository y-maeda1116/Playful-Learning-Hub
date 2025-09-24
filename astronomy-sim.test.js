import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// HTMLファイルを読み込んでDOMをセットアップ
const html = fs.readFileSync(path.resolve(__dirname, './ages-9-10.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

// globalに必要なオブジェクトをセットアップ
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = vi.fn();


describe('天体観測シミュレーション', () => {

    it('HTMLにシミュレーションのコンテナ要素が存在すること', () => {
        // HTML内に #astronomy-simulation が存在するかを確認
        const simContainer = document.getElementById('astronomy-simulation');
        expect(simContainer).not.toBeNull();
    });

    it('HTMLにcanvas要素が存在すること', () => {
        const canvas = document.getElementById('sky-canvas');
        expect(canvas).not.toBeNull();
        expect(canvas.tagName).toBe('CANVAS');
    });

    /*
    * 注: このテストスイートは、機能の存在を確認する基本的なものです。
    *
    * astronomy-sim.js の現在の実装は、すべてのロジックが
    * DOMContentLoaded イベントリスナー内にカプセル化されています。
    * これにより、位置計算や状態管理などの内部関数を直接インポートして
    * 単体テストを行うことが困難になっています。
    *
    * 本来であれば、計算ロジック（例: `calculatePlanetPosition(date, planet)`) を
    * 純粋な関数として分離し、エクスポートすることで、より堅牢なテストが可能になります。
    * しかし、現在のコード構造では、DOMに依存しないロジックのテストは複雑になります。
    */
});
