let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let pingInterval = 0;
let score = 0;
let fillStyle = "#eeeeee";
let fillStyle2 = "#999999";
let textFillStyle = "#222222";
let boardWidth = 10;
let boardHeight = 10;
let tileSeperation = 2;
let tileWidth = 40;
let gameId = localStorage.getItem("id");
let mines = JSON.parse(localStorage.getItem("mines"));
let firstMine = JSON.parse(localStorage.getItem("firstMine"));
let userName = localStorage.getItem("userName");
let oppoName = localStorage.getItem("opponent");
let youElo = localStorage.getItem("youElo");
let oppoElo = localStorage.getItem("oppoElo");
let oppoScore = 0;
let paused = false;
console.log(mines);

const box = document.getElementById("box");
const heading = document.getElementById("heading");
heading.innerText = (userName + "[" + youElo + "] vs " + oppoName + "[" + oppoElo + "]");

let board = [];
let displayedBoard = [];

function initializeBoard() {
    for (let y = 0; y < boardHeight; y++) {
        board[y] = [];
        displayedBoard[y] = [];
        for (let x = 0; x < boardWidth; x++) {
            board[y][x] = 0;
            displayedBoard[y][x] = 10;
        }
    }
}

function loadBoard() {
    mines.forEach(mine => {
        board[mine[1]][mine[0]] = 1;
    });
}

function setCanvasSize() {
    // Set the actual drawing size of the canvas
    canvas.width = (tileWidth + tileSeperation) * boardWidth + tileSeperation;
    canvas.height = (tileWidth + tileSeperation) * boardHeight + tileSeperation;

    // Optionally set the CSS width/height for display (useful for scaling)
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
}


function drawBoard() {
    ctx.fillStyle = fillStyle;
    
    let xC = 0;
    let yC = 0;

    while (yC < boardHeight) {
        while (xC < boardWidth) {
            if (displayedBoard[yC][xC] === 10) {
                ctx.fillStyle = fillStyle2;
            }else {
                ctx.fillStyle = fillStyle;
            }
            ctx.fillRect(
                (xC * (tileSeperation + tileWidth)) + tileSeperation, 
                (yC * (tileSeperation + tileWidth)) + tileSeperation, 
                tileWidth, tileWidth
            );
            if (displayedBoard[yC][xC] != 10 && displayedBoard[yC][xC] != 0) {
                ctx.fillStyle = textFillStyle;
                ctx.fillText(displayedBoard[yC][xC], (xC * (tileSeperation + tileWidth)) + tileSeperation + 8, (yC * (tileSeperation + tileWidth)) + tileSeperation + 13);
            }
            xC++;
        } 
        xC = 0;  
        yC++;
    }
}

async function checkForWin() {
    let xC = 0;
    let yC = 0;

    let hasWon = true;

    while (yC < boardHeight) {
        while (xC < boardWidth) {
            if (displayedBoard[yC][xC] === 10) {
                if (board[yC][xC] !== 1) {
                    hasWon = false;
                    break;
                }
            }
            xC++;
        } 
        xC = 0;  
        yC++;
    }

    if (hasWon) {
        box.style.borderColor = "green";
        removeEventListener("beforeunload", handleBeforeUnload);

        const response = await fetch("/api/win", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: gameId,
                userName: userName,
                opponent : oppoName
            })
        })

        homePage()
    }
}

function getTileCoordinates(mouseX, mouseY) {

    let tileX = Math.floor(mouseX / (tileWidth + tileSeperation));
    let tileY = Math.floor(mouseY / (tileWidth + tileSeperation));

    if (tileX >= 0 && tileX < boardWidth && tileY >= 0 && tileY < boardHeight) {
        console.log(`Tile clicked: X = ${tileX}, Y = ${tileY}`);
        return { tileX, tileY };
    } else {
        console.log("Clicked outside the board!");
        return null;
    }
}

canvas.addEventListener("click", function(event) {
    
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    let tileCoordinates = getTileCoordinates(mouseX, mouseY);

    if (tileCoordinates) {
        let { tileX, tileY } = tileCoordinates;

        console.log(event.button);

        if (event.button === 0 && !paused) {
            
            mine(tileX, tileY);

        }
    }
});

async function ping() {
    const response = await fetch("/api/matchPing", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: gameId,
            userName: userName,
            score: score
        })
    })
    const data = await response.json();

    oppoScore = data.oppoScore;

    if (data.winner === oppoName) {
        box.style.borderColor = "red";
        alert("winner is "+data.winner);
        homePage()
        clearInterval(pingInterval);
    }
    if (data.winner === userName) {
        removeEventListener("beforeunload", handleBeforeUnload);
        box.style.borderColor = "green";
        alert("winner is "+data.winner);
        homePage();
        clearInterval(pingInterval);
    }
    if (data.winner === "draw") {
        removeEventListener("beforeunload", handleBeforeUnload);
        box.style.borderColor = "grey";
        alert("Match draw");
        homePage();
        clearInterval(pingInterval);
    }

    heading.innerText = (score + "   -   " + userName + "[" + youElo + "] vs " + oppoName + "[" + oppoElo + "]   -   " + oppoScore);
}

function mine(x, y) {
    
    if (board[y][x] === 1) {
        initializeBoard();
        box.style.borderColor = "red";
        lose();
        alert("Winner is "+oppoName+" :(")
        homePage();
        clearInterval(pingInterval);
        return;
    }

    let total = 0;
    const stack = [[x, y]];
    const visited = new Set();

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();

        if (visited.has(`${currentY},${currentX}`)) {
            continue;
        }
        visited.add(`${currentY},${currentX}`);

        total = 0;
        for (const [dx, dy] of directions) {
            const newX = currentX + dx;
            const newY = currentY + dy;

            if (newX >= 0 && newX < boardWidth && newY >= 0 && newY < boardHeight && board[newY][newX] === 1) {
                total++;
            }
        }

        if (total === 0) {
            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;

                if (newX >= 0 && newX < boardWidth && newY >= 0 && newY < boardHeight && board[newY][newX] !== 1 && !visited.has(`${newY},${newX}`)) {
                    stack.push([newX, newY]);
                }
            }
        }

        if (displayedBoard[currentY][currentX] != total) {
            displayedBoard[currentY][currentX] = total;
            score += 1;
        }
    }

    checkForWin();
    drawBoard();
}

async function lose() {
    const response = await fetch("/api/lose", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: gameId,
            userName: userName,
            opponent: oppoName
        })
    })
    removeEventListener("beforeunload", handleBeforeUnload);
    box.style.borderColor = "red";
    homePage();
    localStorage.clear;
}

async function draw() {
    const response = await fetch("/api/draw", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: gameId,
            userName: userName,
            opponent: oppoName
        })
    })

    if (response.status === 200) {
        removeEventListener("beforeunload", handleBeforeUnload);
        box.style.borderColor = "grey";
        homePage();
        localStorage.clear;
    }
}

setCanvasSize();
initializeBoard();
loadBoard();
drawBoard();
mine(firstMine[1], firstMine[0]);
pingInterval = setInterval(ping, 2000);

document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});

const handleBeforeUnload = (event) => {
    localStorage.removeItem("mines");
    localStorage.removeItem("id");
    localStorage.removeItem("firstMine");
    localStorage.removeItem("userName");
    localStorage.removeItem("opponent");
    lose();
};

// Add the event listener
window.addEventListener("beforeunload", handleBeforeUnload);




function homePage() {
    localStorage.removeItem("mines");
    localStorage.removeItem("id");
    localStorage.removeItem("firstMine");
    localStorage.removeItem("userName");
    localStorage.removeItem("opponent");

    window.location.assign("/");
}
