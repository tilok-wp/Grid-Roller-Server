const express = require('express');
const cors = require('cors');
const app = express();


require('dotenv').config()
const port = process.env.PORT || 5000;

// Use middleware for data passing
app.use(cors());
app.use(express.json())


// Mongoda database connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_MONGO_NAME}:${process.env.DB_MONGO_PASS}@cluster0.2lwzs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// App API start here
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('grid_roller_database').collection('product')

        app.get('/products', async (req, res) => {
            const limit = parseInt(req.query.limit)
            const query = {}
            let products
            if (limit) {
                products = await productCollection.find(query).limit(limit).toArray()
            } else {

                products = await productCollection.find(query).toArray()
            }
            res.send(products)
        })

    }
    finally { }
}
run().catch(console.dir)

// App API End here









app.get('/', (req, res) => {
    res.send('Grid roller server is running...!')
})
app.listen(port, () => {
    console.log('Grid roller server running port on: ', port)
})