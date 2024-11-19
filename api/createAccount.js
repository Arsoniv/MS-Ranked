const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

function checkUsername(name) {

    const bannedWords = ["nig", "fuck", "gay", "yann", "black", "porn", "penis", "pussy", "dick", "vagina", "cock", "arsoniv", "gger", "gga"];
    let result = true;

    if (bannedWords.some(word => name.includes(word))) {
        result = false;
    }


    return result;
}

function isAscii(str) {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127) {
            return false;
        }
    }
    return true;
}


module.exports = async (req, res) => {
    
    const {userName, password} = req.body;

    const client = await pool.connect();

    const users = await client.query(
        "SELECT * FROM userData WHERE username ILIKE $1",
        [userName]
    );

    if (users.rows.length === 0 && checkUsername(userName.toLowerCase()) && userName.length <= 12 && isAscii(userName)) {

        await client.query(
            "INSERT INTO userData (username, password, elo) VALUES ($1, $2, $3)",
            [userName, password, 1000]
        )
        res.status(200).send({"alert": 0, "status": "account created"})
    } else {
        res.status(311).send({"alert": 1, "status": "username is use or invalid, try again"})
    }
}