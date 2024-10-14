const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    
    const {username, password, displayname, color} = req.body;

    const client = await pool.connect();

    const users = await client.query(
        "SELECT * FROM userData WHERE username = $1",
        [username]
    );

    if (users.rows.length === 0) {

        await client.query(
            "INSERT INTO userData (username, password, displayname, color) VALUES ($1, $2, $3, $4)",
            [username, password, displayname, color]
        )
        res.status(200).send({"alert": 0, "status": "account created"})
    } else {
        res.status(311).send({"alert": 1, "status": "username is use, try again"})
    }
}