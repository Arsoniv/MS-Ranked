const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default async (req, res) => {
    await pool.connect();

    const {id, userName, opponent} = req.body;

    const selectResponse = await pool.query(
        "SELECT * from matches where id = $1 and winner is null",
        [id]
    )

    let playerOne = (selectResponse.rows[0].playerone === userName);

    function isHigherScore() {
        const {playeronescore, playertwoscore} = selectResponse.rows[0];
        return playerOne
            ? playeronescore >= playertwoscore
            : playeronescore <= playertwoscore;
    }


    if (selectResponse.rows.length > 0 && isHigherScore()) {

        const response3 = await pool.query(
            "SELECT * from userdata where username = $1",
            [userName]
        )

        const userNameElo = response3.rows[0].elo;

        const response4 = await pool.query(
            "SELECT * from userdata where username = $1",
            [opponent]
        )

        const opponentElo = response4.rows[0].elo;


        const response = await pool.query(
            "UPDATE matches SET winner = $1 WHERE id = $2 AND winner IS NULL",
            ["draw", id]
        )

        res.status(200).send({"result": "request complete"});
    } else {
        res.status(408).send({"result": "draw not permitted"});
    }
};
