const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: "postgres://default:d73vEaflDBKN@ep-lingering-sky-a7pftccr-pooler.ap-southeast-2.aws.neon.tech:5432/verceldb?sslmode=require",
});


function calculateElo(player1Rating, player2Rating, player1Won, kFactor = 32, maxChange = 28) {
    // Calculate expected scores based on current ratings
    const expectedScore1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
    const expectedScore2 = 1 / (1 + Math.pow(10, (player1Rating - player2Rating) / 400));

    // Actual scores based on the outcome (1 if player 1 wins, 0 if player 2 wins)
    const actualScore1 = player1Won ? 1 : 0;
    const actualScore2 = player1Won ? 0 : 1;

    // Adjust ratings based on the outcome
    let ratingChange1 = kFactor * (actualScore1 - expectedScore1);
    let ratingChange2 = kFactor * (actualScore2 - expectedScore2);

    // Apply the max change limit
    ratingChange1 = Math.max(-maxChange, Math.min(maxChange, ratingChange1));
    ratingChange2 = Math.max(-maxChange, Math.min(maxChange, ratingChange2));

    const newPlayer1Rating = player1Rating + ratingChange1;
    const newPlayer2Rating = player2Rating + ratingChange2;

    return {
        newPlayer1Rating: Math.round(newPlayer1Rating),
        newPlayer2Rating: Math.round(newPlayer2Rating),
    };
}

export default async (req, res) => {
    await pool.connect();

    const { id, userName, opponent } = req.body;


    const selectResponse = await pool.query(
        "SELECT * from matches where id = $1 and winner is null",
        [id]
    )

    if (selectResponse.rows.length > 0) {
        const response3 = await pool.query(
            "SELECT * from userdata where username = $1",
            [userName]
        )

        const response4 = await pool.query(
            "SELECT * from userdata where username = $1",
            [opponent]
        )

        let winnerRating = response4.rows[0].elo;
        let loserRating = response3.rows[0].elo;

        const resultElo = calculateElo(winnerRating, loserRating, true, 24);

        winnerRating = resultElo.newPlayer1Rating;
        loserRating = resultElo.newPlayer2Rating;

        const response = await pool.query(
            "UPDATE matches SET winner = $1 WHERE id = $2 AND winner IS NULL",
            [opponent, id]
        )

        const response5 = await pool.query(
            "UPDATE userdata set elo = $2 where username = $1",
            [userName, loserRating]
        )

        const response6 = await pool.query(
            "UPDATE userdata set elo = $2 where username = $1",
            [opponent, winnerRating]
        )

        res.status(200).send({"result": "request complete", "response": response});
    } else {
        res.status(408).send({"result": "match not found"});
    }



};
