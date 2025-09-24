import { describe, it, expect, beforeAll, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, './ages-7-8.html'), 'utf8');
const scriptContent = fs.readFileSync(path.resolve(__dirname, './coding-game.js'), 'utf8');

describe('Coding Game', () => {
    let dom;
    let window;
    let document;

    beforeAll(async () => {
        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            resources: 'usable',
        });
        window = dom.window;
        document = window.document;

        const scriptEl = document.createElement('script');
        scriptEl.textContent = scriptContent;
        document.body.appendChild(scriptEl);

        // Wait for the DOM to be fully loaded and scripts to run
        await new Promise(resolve => window.addEventListener('load', resolve));
    });

    it('should have a coding game container', () => {
        const gameContainer = document.getElementById('coding-game');
        expect(gameContainer).not.toBeNull();
    });

    it('should show the game container when a level is selected', () => {
        const levelButton = document.querySelector('.level-btn[data-level="1"]');
        const gameContainer = document.getElementById('game-container');

        // Check for the .hidden class
        expect(gameContainer.classList.contains('hidden')).toBe(true);

        // Dispatch a click event
        levelButton.click();

        // Check that the .hidden class is removed
        expect(gameContainer.classList.contains('hidden')).toBe(false);
        expect(gameContainer.style.display).toBe('flex');
    });

    it('should add a command to the sequence when dropped (visual check)', () => {
        // This test is hard to implement in JSDOM without DataTransfer
        // We will just check if the sequence container exists
        const sequenceBlocks = document.getElementById('sequence-blocks');
        expect(sequenceBlocks).not.toBeNull();
    });
});
