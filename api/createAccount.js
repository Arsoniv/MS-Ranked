const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

function checkUsername(name) {
    let result = true;

    if (name.contains("nig"|| "fuck"|| "gay"|| "yann"|| "black"|| "porn")) {
        result = false;
    }

    return result;
}

module.exports = async (req, res) => {
    
    const {userName, password} = req.body;

    const client = await pool.connect();

    const users = await client.query(
        "SELECT * FROM userData WHERE username = $1",
        [userName]
    );

    if (users.rows.length === 0 && checkUsername(userName)) {

        await client.query(
            "INSERT INTO userData (username, password, elo) VALUES ($1, $2, $3)",
            [userName, password, 1000]
        )
        res.status(200).send({"alert": 0, "status": "account created"})
    } else {
        res.status(311).send({"alert": 1, "status": "username is use, try again"})
    }
}