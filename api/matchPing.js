const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {id, userName, score} = req.body;

    const response2 = await pool.query(
        "SELECT * FROM matches WHERE id = $1",
        [id]
    )

    if (response2.rows.length === 0) {
        res.status(400).send({"result": "match not found", "response": response2});
    }else {

        let oppoScore = 0;

        if (response2.rows[0].playerone === userName) {
            const response = await pool.query(
                "UPDATE matches SET playeronescore = $2 WHERE id = $1 AND WINNER IS NULL",
                [id, score]
            )
            oppoScore = response2.rows[0].playertwoscore;
        }
        if (response2.rows[0].playertwo === userName) {
            const response = await pool.query(
                "UPDATE matches SET playertwoscore = $2 WHERE id = $1 AND WINNER IS NULL",
                [id, score]
            )
            oppoScore = response2.rows[0].playeronescore;
        }

        res.status(200).send({"result": "request complete", "oppoScore": oppoScore, "winner": response2.rows[0].winner});
    }
};
