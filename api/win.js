const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {id, userName} = req.body;

    const response = pool.query(
        "UPDATE matches SET winner = $1 WHERE id = $2 AND WINNER IS NULL",
        [userName, id]
    )

    res.status(200).send({"result": "request complete", "response": response});
};
