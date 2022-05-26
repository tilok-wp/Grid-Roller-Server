const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');


require('dotenv').config()
const port = process.env.PORT || 5000;

// Use middleware for data passing
app.use(cors());
app.use(express.json())


// Mongoda database connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_MONGO_NAME}:${process.env.DB_MONGO_PASS}@cluster0.2lwzs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// JWT verify
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access!' })
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.TOKEN_KEY_SECREATE, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access!' })
        }
        req.decoded = decoded
        next()
    });

}

// App API start here
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('grid_roller_database').collection('product')
        const blogCollection = client.db('grid_roller_database').collection('blog')
        const userCollection = client.db('grid_roller_database').collection('user')
        const reviewCollection = client.db('grid_roller_database').collection('review')

        const verifyAdmin = async (req, res, next) => {
            const requesterEmail = req.decoded.email
            const requesterAccount = await userCollection.findOne({ email: requesterEmail })
            if (requesterAccount.role === 'admin') {
                next()
            } else {
                return res.status(403).send({ message: 'Forbidden access!' })
            }
        }

        app.get('/product', async (req, res) => {
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
        // Add product post
        app.post('/product', async (req, res) => {
            const product = req.body
            const productInserted = await productCollection.insertOne(product)
            res.send(productInserted)
        })
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const productDetails = await productCollection.findOne(query)
            res.send(productDetails)
        })

        app.delete('/product/:_id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params._id;
            // console.log(email)
            const filter = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(filter);
            res.send(result);
        })

        // Get blog post
        app.get('/blog', async (req, res) => {
            const blogs = await blogCollection.find({}).toArray()
            res.send(blogs)
        })
        // Add blog post
        app.post('/blog', async (req, res) => {
            const blog = req.body
            const blogInserted = await blogCollection.insertOne(blog)
            res.send(blogInserted)
        })

        app.get('/review', async (req, res) => {
            const limit = parseInt(req.query.limit)
            let reviews
            if (limit) {
                reviews = await reviewCollection.find({}).limit(limit).toArray()
            } else {
                reviews = await reviewCollection.find({}).toArray()
            }
            res.send(reviews)
        })
        // Add review post
        app.post('/review', async (req, res) => {
            const review = req.body
            const reviewInserted = await reviewCollection.insertOne(review)
            res.send(reviewInserted)
        })
        // Create user and generate access token
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            // console.log(user)
            const filter = { email: email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options)
            const token = jwt.sign({ email: email }, process.env.TOKEN_KEY_SECREATE, { expiresIn: '12h' })
            // console.log(token)
            res.send({ accessToken: token, result })
        })

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        })
        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email
            // console.log(req.params)
            // const requesterEmail = req.decoded.email
            // const requesterAccount = await userCollection.findOne({ email: requesterEmail })
            if (requesterAccount.role === 'admin') {
                const filter = { email: email }
                const updatedDoc = {
                    $set: { role: 'admin' }
                }
                const result = await userCollection.updateOne(filter, updatedDoc,)
                res.send(result)
            } else {
                res.status(403).send({ message: 'Forbidden access!' })
            }
        })
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email
            const user = await userCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin'
            res.send({ admin: isAdmin })
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