const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {userName} = req.body;

    const selectResponse = await pool.query(
        "SELECT * FROM queue WHERE username = $1",
        [userName]
    )

    const selectResponse2 = await pool.query(
        "SELECT * FROM matches WHERE (playerone = $1 OR playertwo = $1) AND winner IS NULL",
        [userName]
    )

    if (selectResponse2.rows.length > 0) {
        if (selectResponse2.rows[0].playerone === userName) {
            res.status(200).send({
                "result": "Found match",
                "you": selectResponse2.rows[0].playerone,
                "opponent": selectResponse2.rows[0].playertwo,
                "mines": selectResponse2.rows[0].mines,
                "id": selectResponse2.rows[0].id,
                "firstMine": selectResponse2.rows[0].firstmine,
                "oppoElo": selectResponse2.rows[0].elo2,
            })
        } else {
            res.status(200).send({
                "result": "Found match",
                "you": selectResponse2.rows[0].playertwo,
                "opponent": selectResponse2.rows[0].playerone,
                "mines": selectResponse2.rows[0].mines,
                "id": selectResponse2.rows[0].id,
                "firstMine": selectResponse2.rows[0].firstmine,
                "oppoElo": selectResponse2.rows[0].elo1,
            })
        }
    }else if (selectResponse.rows.length > 0) {
        const updateResponse2 = await pool.query(
            "UPDATE queue SET time = EXTRACT(EPOCH FROM NOW()) WHERE username = $1",
            [userName]
        )
        res.status(201).send({"result": "In queue..."})
    }else {
        res.status(301).send({"result": "Not in queue or in game, get fucked"})
    }
};
