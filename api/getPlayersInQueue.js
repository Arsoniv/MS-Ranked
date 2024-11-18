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

    const data = response.rows;

    res.status(200).send({"alert": 0, "result": data})
}