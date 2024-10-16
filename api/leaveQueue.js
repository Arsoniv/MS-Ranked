const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {userName} = req.body;

    const response = await pool.query(
        "DELETE FROM matches WHERE username = $1",
        [userName]
    )

    res.status(200).send({"result": "request complete", "response": response});
};
