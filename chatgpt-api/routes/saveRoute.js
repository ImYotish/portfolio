import express from 'express';
import dotenv from 'dotenv';
import db from '../database.js'

dotenv.config();

const router = express.Router()

router.post('/', async (req, res) => {

    console.log('Save route body:', req.body)

    const { message } = req.body

    // TODO: implement save logic properly (placeholder query kept as-is)
    const data = db.query("INSERT INTO chat_list (titre) VALUES()")

    return res.json({ success: true })

})

export default router;