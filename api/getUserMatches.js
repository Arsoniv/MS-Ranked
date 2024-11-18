const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {userName} = req.body;

    const selectResponse2 = await pool.query(
        "SELECT * FROM matches WHERE (playerone = $1 OR playertwo = $1)",
        [userName]
    )

    res.status(200).send({"result": "request complete", "response": selectResponse2.rows});
};
