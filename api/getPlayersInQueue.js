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

    const response2 = await client.query(
        "SELECT * FROM matches where winner is null"
    );

    const data = response.rows.length;
    const data2 = response2.rows.length;

    res.status(200).send({"alert": 0, "queue": data, "inGame": data2})
}