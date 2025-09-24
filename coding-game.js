document.addEventListener('DOMContentLoaded', () => {
    const levels = {
        1: {
            grid: [
                "S.W.",
                ".W.G",
                "....",
                "W..."
            ],
            rows: 4,
            cols: 4
        },
        2: {
            grid: [
                "S...",
                "WWWW",
                "....",
                "...G"
            ],
            rows: 4,
            cols: 4,
            availableCommands: ['forward', 'turnRight', 'jump']
        },
        3: {
            grid: [
                "S.W.",
                ".W.W",
                "....",
                "W..G"
            ],
            rows: 4,
            cols: 4
        }
    };

    let currentLevel, character, sequence, gameBoard, sequenceBlocks;
    let isExecuting = false;

    const levelSelection = document.getElementById('level-selection');
    const gameContainer = document.getElementById('game-container');
    const runBtn = document.getElementById('run-btn');
    const resetBtn = document.getElementById('reset-btn');
    const gameMessage = document.getElementById('game-message');

    levelSelection.addEventListener('click', (e) => {
        if (e.target.classList.contains('level-btn')) {
            const levelNum = e.target.dataset.level;
            currentLevel = levels[levelNum];
            levelSelection.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'flex'; // Keep flex display
            startGame();
        }
    });

    function startGame() {
        gameBoard = document.getElementById('game-board');
        sequenceBlocks = document.getElementById('sequence-blocks');
        sequence = [];
        isExecuting = false;
        gameMessage.textContent = '';

        const startPos = findChar(currentLevel.grid, 'S');
        character = {
            x: startPos.x,
            y: startPos.y,
            dir: 'right' // 'up', 'down', 'left', 'right'
        };

        renderBoard();
        setupDragAndDrop();
    }

    function findChar(grid, char) {
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c] === char) {
                    return { x: c, y: r };
                }
            }
        }
    }

    function renderBoard() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${currentLevel.cols}, 50px)`;
        gameBoard.style.gridTemplateRows = `repeat(${currentLevel.rows}, 50px)`;

        for (let r = 0; r < currentLevel.rows; r++) {
            for (let c = 0; c < currentLevel.cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.x = c;
                cell.dataset.y = r;
                if (currentLevel.grid[r][c] === 'W') {
                    cell.classList.add('wall');
                }
                if (currentLevel.grid[r][c] === 'G') {
                    const goal = document.createElement('div');
                    goal.id = 'goal';
                    goal.textContent = 'G';
                    cell.appendChild(goal);
                }
                gameBoard.appendChild(cell);
            }
        }
        renderCharacter();
    }

    function renderCharacter() {
        let characterElement = document.getElementById('character');
        if (characterElement) {
            characterElement.remove();
        }
        characterElement = document.createElement('div');
        characterElement.id = 'character';
        characterElement.textContent = getDirectionArrow(character.dir);

        const cell = document.querySelector(`.grid-cell[data-x='${character.x}'][data-y='${character.y}']`);
        if (cell) {
            cell.appendChild(characterElement);
        }
    }

    function getDirectionArrow(dir) {
        switch (dir) {
            case 'up': return '↑';
            case 'down': return '↓';
            case 'left': return '←';
            case 'right': return '→';
        }
    }

    function setupDragAndDrop() {
        const commands = document.querySelectorAll('#toolbox .command');
        commands.forEach(command => {
            command.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.command);
            });
        });

        sequenceBlocks.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        sequenceBlocks.addEventListener('drop', (e) => {
            e.preventDefault();
            const commandType = e.dataTransfer.getData('text/plain');
            addCommandToSequence(commandType);
        });
    }

    function addCommandToSequence(commandType) {
        if (isExecuting) return;
        const commandElement = document.createElement('div');
        commandElement.classList.add('command');
        commandElement.textContent = document.querySelector(`[data-command=${commandType}]`).textContent;
        commandElement.dataset.command = commandType;
        sequenceBlocks.appendChild(commandElement);
        sequence.push(commandType);
    }

    runBtn.addEventListener('click', () => {
        if (isExecuting || sequence.length === 0) return;
        isExecuting = true;
        gameMessage.textContent = '実行中...';
        executeSequence();
    });

    resetBtn.addEventListener('click', () => {
        const startPos = findChar(currentLevel.grid, 'S');
        character = {
            x: startPos.x,
            y: startPos.y,
            dir: 'right'
        };
        sequence = [];
        sequenceBlocks.innerHTML = '';
        isExecuting = false;
        gameMessage.textContent = '';
        renderCharacter();
    });

    async function executeSequence() {
        for (const command of sequence) {
            await executeCommand(command);
            await new Promise(resolve => setTimeout(resolve, 400));
        }
        checkWinCondition();
        isExecuting = false;
    }

    function executeCommand(command) {
        const { x, y, dir } = character;
        let newX = x, newY = y;

        switch (command) {
            case 'forward':
                if (dir === 'right') newX++;
                else if (dir === 'left') newX--;
                else if (dir === 'up') newY--;
                else if (dir === 'down') newY++;
                break;
            case 'turnRight':
                const directions = ['up', 'right', 'down', 'left'];
                const currentIndex = directions.indexOf(dir);
                character.dir = directions[(currentIndex + 1) % 4];
                break;
            case 'jump':
                if (dir === 'right') newX += 2;
                else if (dir === 'left') newX -= 2;
                else if (dir === 'up') newY -= 2;
                else if (dir === 'down') newY += 2;
                break;
        }

        if (isValidMove(newX, newY)) {
            character.x = newX;
            character.y = newY;
        }

        renderCharacter();
        return Promise.resolve();
    }

    function isValidMove(x, y) {
        if (x < 0 || x >= currentLevel.cols || y < 0 || y >= currentLevel.rows) {
            return false;
        }
        if (currentLevel.grid[y][x] === 'W') {
            return false;
        }
        return true;
    }

    function checkWinCondition() {
        const goalPos = findChar(currentLevel.grid, 'G');
        if (character.x === goalPos.x && character.y === goalPos.y) {
            gameMessage.textContent = 'クリア！おめでとう！';
            gameMessage.style.color = '#4CAF50';
        } else {
            gameMessage.textContent = '残念！もう一度挑戦しよう。';
            gameMessage.style.color = '#f44336';
        }
    }
});
