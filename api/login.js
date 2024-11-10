const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {userName, password} = req.body;

    const response = await pool.query(
        "select * from userdata where username = $1 and password = $2",
        [userName, password]
    )

    if (response.rows.length > 0) {
        const data = response.rows[0];

        const response2 = await pool.query(
            "DELETE FROM queue WHERE username = $1",
            [userName]
        )

        res.status(201).send({"alert": 0, "result": data})
    }else {
        res.status(201).send({"alert": 1, "result": "Could not find user, please try again or register."})
    }
};

