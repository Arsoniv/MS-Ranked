import { userInfo } from 'os';

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

let board = [];
let boardHeight = 20;
let boardWidth = 20;
let mineCount = 80;

const crypto = require('crypto');

function secureRandom() {
    // Generate 4 random bytes and convert to a number between 0 and 1
    const randomBytes = crypto.randomBytes(4).readUInt32BE(0); // 32-bit random number
    return randomBytes / Math.pow(2, 32); // Scale to a number between 0 and 1
}


function getMines() {
    let mines = [];

    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (board[y][x] === 1) {
                mines.push([x, y]);
            }
        }
    }

    return mines;
}

function initializeBoard() {
    for (let y = 0; y < boardHeight; y++) {
        board[y] = [];
        for (let x = 0; x < boardWidth; x++) {
            board[y][x] = 0;
        }
    }
}

function createRandomBoard() {
    let xC = 0;
    let yC = 0;

    const totalTiles = boardWidth * boardHeight;
    const mineProbobility = mineCount/totalTiles;
    console.log(mineProbobility);

    while (yC < boardHeight) {
        while (xC < boardWidth) {
            let random = secureRandom();
            console.log(random);
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


export default async (req, res) => {
    await pool.connect();

    const {userName, password} = req.body;

    const selectResponse2 = await pool.query(
        "SELECT * FROM userData where userName = $1 and password = $2",
        [userName, password]
    )

    const selectResponse = await pool.query(
        "SELECT * FROM queue"
    )

    const selectResponse3 = await pool.query(
        "SELECT * FROM matches WHERE playerone = $1 OR playertwo = $1 AND winner IS NULL",
        [userName]
    )

    if (selectResponse2.rows.length > 0 && selectResponse.rows.find(userName.toString()) === undefined && selectResponse3.rows.length === 0) {
    
        if (selectResponse.rows.length === 0) {
            const insertResponse = await pool.query(
                "INSERT INTO queue (username) VALUES ($1)",
                [userName]
            )
            res.status(201).send({
                "result": "queueing...", 
                "you": userName, 
                "opponent": "unknown",
                "mines": "unknown",
                "id": "unknown"
    
            })
        }else {
            const deleteResponse = await pool.query(
                "DELETE FROM queue WHERE username = $1",
                [selectResponse.rows[0].username]
            )
    
            initializeBoard();
            createRandomBoard();
    
            const insertResponse = await pool.query(
                "INSERT INTO matches (mines, playerone, playertwo, playeronescore, playertwoscore) VALUES ($1, $2, $3, $4, $5)",
                [getMines(), selectResponse.rows[0].username, userName, 0, 0]
            )
            res.status(200).send({
                "result": "Found match", 
                "you": userName, 
                "opponent": selectResponse.rows[0].username,
                "mines": getMines,
                "id": 0
    
            })
        }
    }else {
        res.status(369).send({
            "result": "User not found or password in valid, go fuck yourself", 
            "userName": userName, 
            "password": password
        })
    }
};
