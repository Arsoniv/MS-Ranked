const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {userName} = req.body;

    const response = await pool.query(
        "select username, elo from userdata where username = $1",
        [userName]
    )

    if (response.rows.length > 0) {
        const data = response.rows;

        res.status(201).send({"alert": 0, "result": data})
    }else {
        res.status(301).send({"alert": 1, "result": "Could not find user, please try again."})
    }
};

