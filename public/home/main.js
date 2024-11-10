
let first = false;
let intervalNumber = 0;
const button = document.getElementById("button");
const nameIn = document.getElementById("nameIn");
const passIn = document.getElementById("passIn");
const middleMenu = document.getElementById("middleMenu");
async function createAccount() {

    const response = await fetch("api/createAccount", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value,
            password: passIn.value
        })
    })

    if (response.status === 200) alert("account created");
    if (response.status === 311) alert("Username in use, please use another name or log in.");
}

async function queue() {
    button.innerText = "loading...";
    const response = await fetch("api/queue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value,
            password: passIn.value
        })
    })
    if (response.status === 201) {
        button.innerText = "Queueing...";
        intervalNumber = setInterval(queuePing, 1000);
    }
    if (response.status === 200) {
        button.innerText = "Match found!";
        first = true;
        queuePing();
    }
    if (response.status === 369) {
        button.innerText = "Queue Failed! (reload)";
    }
}

async function getPlayersInQueue() {

}

async function queuePing() {
    const response = await fetch("api/pingQueue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value
        })
    })

    if (response.status === 200) {
        const data = await response.json();
        console.log(data);

        button.innerText = "Match found!";
        clearInterval(intervalNumber);

        localStorage.setItem("mines", JSON.stringify(data.mines));
        localStorage.setItem("id", data.id);
        localStorage.setItem("firstMine", JSON.stringify(data.firstMine));


        if (first) {
            localStorage.setItem("userName", data.opponent);
            localStorage.setItem("opponent", data.you);
        }else {
            localStorage.setItem("userName", data.you);
            localStorage.setItem("opponent", data.opponent);
        }

        
            
        setTimeout(changeLocation, 1000)
    }

    function changeLocation() {
        location = "play/";
    }

    

}

async function leaveQueue() {
    const response = await fetch("/api/leaveQueue", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value
        })
    })
}

window.addEventListener('beforeunload', function (event) {
    leaveQueue();
});


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");



let score = 0;
let fillStyle = "#eeeeee";
let fillStyle2 = "#999999";
let textFillStyle = "#222222";
let boardWidth = 20;
let boardHeight = 20;
let tileSeperation = 2;
let tileWidth = 20;
let mines = 80;

const box = document.getElementById("box");
box.innerText = "Practice Mode   ["+score+"]";

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

function createRandomBoard() {
    let xC = 0;
    let yC = 0;

    const totalTiles = boardWidth * boardHeight;
    const mineProbobility = mines/totalTiles;
    console.log(mineProbobility);

    while (yC < boardHeight) {
        while (xC < boardWidth) {
            const random = Math.random();
            if (random <= mineProbobility) {
                board[yC][xC] = 1;
            }else {
                board[yC][xC] = 0;
            }
            xC++;
        } 
        xC = 0;  
        yC++;
    }
}

function setCanvasSize() {
    canvas.width = 442;
    canvas.height = 442;
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
                ctx.fillText(displayedBoard[yC][xC], (xC * (tileSeperation + tileWidth)) + tileSeperation + 10, (yC * (tileSeperation + tileWidth)) + tileSeperation + 10);
            }
            xC++;
        } 
        xC = 0;  
        yC++;
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

        if (event.button === 0) {
            
            mine(tileX, tileY);

        }
    }
});

async function checkForWin() {
    let xC = 0;
    let yC = 0;

    let hasWon = true;

    while (yC < boardHeight) {
        while (xC < boardWidth) {
            if (board[yC][xC] != 1) {
                if (displayedBoard[yC][xC] != 10) {
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
        box.style.backgroundColor = "green";
    }
}


async function login() {
    const response102 = await fetch("api/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: nameIn.value,
            password: passIn.value
        })
    })

    const data = response102.json();

    console.log(data);

    if (response102.status === 200) {
        middleMenu.innerHTML = '';
        middleMenu.innerText = (data.result.username +"  -  "+data.result.elo);
    }else {
        if (data["alert"] === 1) {
            alert(data["result"]);
        }
    }

}

function createStartingPos() {
    let x1 = Math.floor(Math.round(Math.random()*(boardWidth-4))+2)
    let y1 = Math.floor(Math.round(Math.random()*(boardHeight-4))+2)

    console.log("x "+x1+"  y "+y1)

    displayedBoard[x1][y1] = 0;

    board[x1-1][y1-1] = 0;
    board[x1-1][y1] = 0;
    board[x1-1][y1+1] = 0;
    board[x1][y1-1] = 0;
    board[x1][y1] = 0;
    board[x1][y1+1] = 0;
    board[x1+1][y1-1] = 0;
    board[x1+1][y1] = 0;
    board[x1+1][y1+1] = 0;

    mine(y1, x1);

    drawBoard();
}

function mine(x, y) {
    
    if (board[y][x] === 1) {
        box.style.backgroundColor = "red";
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

    box.innerText = "Practice Mode       ["+score+"]";

    checkForWin();
    drawBoard();
}

function reset() {
    initializeBoard();
    createRandomBoard();
    drawBoard();
    createStartingPos();
    
    score = 0;

    box.innerText = "Practice Mode   ["+score+"]";
    box.style.backgroundColor = "#999999"
}


setCanvasSize();
initializeBoard();
createRandomBoard();
drawBoard();
createStartingPos();


window.addEventListener('resize', () => {
    setCanvasSize();
    drawBoard();
});

document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});