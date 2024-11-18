const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    const client = await pool.connect();

    const response = await client.query(
        "SELECT * FROM queue"
    );

    if (response.rows.length > 0) {
        const data = response.rows;

        res.status(200).send({"alert": 0, "result": data})
    }else {
        res.status(201).send({"alert": 1, "result": "Could not find user, please try again or register."})
    }
}