const express = require('express');
const cors = require('cors');
const app = express();


require('dotenv').config()
const port = process.env.PORT || 5000;

// Use middleware for data passing
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Grid roller server is running...!')
})



app.listen(port, () => {
    console.log('Grid roller server running port on: ', port)
})