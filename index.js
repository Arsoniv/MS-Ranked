const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

let initialBoard = generateBoard(10, 10);  // Generate the same board for both players

let players = {};  // Track players' states
let clearedTiles = {};  // Track cleared tiles for both players

wss.on('connection', function connection(ws) {
    const playerId = generatePlayerId();
    players[playerId] = {
        board: cloneBoard(initialBoard),  // Each player gets their own version of the same board
        cleared: 0
    };
    clearedTiles[playerId] = 0;  // Initialize cleared tiles

    ws.on('message', function message(data) {
        const parsedData = JSON.parse(data);

        // Handle player move
        if (parsedData.type === 'move') {
            const { playerId, row, col } = parsedData;
            const player = players[playerId];
            if (!player.board[row][col].revealed) {
                player.board[row][col].revealed = true;
                player.cleared += 1;  // Increment cleared tiles for the player
                clearedTiles[playerId] = player.cleared;
            }
            broadcastGameState();
        }
    });

    ws.send(JSON.stringify({ type: 'init', board: initialBoard, playerId }));
});

function generateBoard(rows, cols) {
    // Generate a 10x10 board with mines
    const board = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push({ mine: Math.random() < 0.2, revealed: false });  // 20% chance of a mine
        }
        board.push(row);
    }
    return board;
}

function cloneBoard(board) {
    return board.map(row => row.map(cell => ({ ...cell })));
}

function broadcastGameState() {
    const gameState = {
        type: 'update',
        clearedTiles: clearedTiles,
    };
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gameState));
        }
    });
}

function generatePlayerId() {
    return Math.random().toString(36).substr(2, 9);
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
