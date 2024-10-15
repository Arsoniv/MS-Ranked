const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const { id, opponent } = req.body;

    const response = await pool.query(
        "UPDATE matches SET winner = $1 WHERE id = $2 AND WINNER IS NULL",
        [opponent, id] // $1 corresponds to opponent (winner), $2 to id
    );

    res.status(200).json({ message: "Winner updated successfully", result: response });

    await pool.end();
};
