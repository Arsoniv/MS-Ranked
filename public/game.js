const ws = new WebSocket('wss://ms-ranked.vercel.app');

let playerId;
let gameState;

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.type === 'init') {
        playerId = data.playerId;
        gameState = data.board;
        renderGameState(gameState);
    } else if (data.type === 'update') {
        updateClearedTiles(data.clearedTiles);
    }
};

function renderGameState(board) {
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';  // Clear previous grid
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.textContent = cell.revealed ? (cell.mine ? '💣' : '') : '';
            cellElement.addEventListener('click', () => handleCellClick(rowIndex, colIndex));
            grid.appendChild(cellElement);
        });
    });
}

function handleCellClick(row, col) {
    if (!gameState[row][col].revealed) {
        gameState[row][col].revealed = true;  // Reveal the cell
        socket.send(JSON.stringify({ type: 'move', playerId, row, col }));
        renderGameState(gameState);
    }
}

function updateClearedTiles(clearedTiles) {
    document.querySelector('.player1-cleared').textContent = `Player 1 Cleared: ${clearedTiles.player1 || 0}`;
    document.querySelector('.player2-cleared').textContent = `Player 2 Cleared: ${clearedTiles.player2 || 0}`;
}

// Initial board rendering
renderGameState(gameState);
