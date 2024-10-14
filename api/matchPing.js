const { Pool } = require('pg');
import { put } from "@vercel/blob";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    
    const {gameId, userName} = req.body;

    const client = await pool.connect();

    

    /*
    data structure:

    let data = {
        "board": [
            [],
            [],
            [],
            [],
            []
        ],
        "status": 1,
        "winner": "",
        "playerOne": "",
        "playerTwo": "",
        "playerOneScore": 0,
        "playerTwoScore": 0,
    }
    */

    await put("matches/"+gameId, data, { access: 'public' });
}