import express from 'express';
import dotenv from 'dotenv';
import db from '../database.js'

dotenv.config();

const router = express.Router()

router.post('/', async (req, res) => {

    console.log(req.body)

    const { message } = req.body

    const data = db.query("INSERT INTO list_conv (title) VALUES()")

})

export default router;