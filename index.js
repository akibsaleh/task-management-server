const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// MiddleWares
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hfh6rjb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const tasksCollection = client.db('taskedo').collection('tasks');
    // JWT Token
    app.post('/jwt', async (req, res) => {
      const user = await req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
      res.send({ token });
    });

    // Custom middlewares

    // Verify JWT Token

    const verifyToken = async (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'UnAuthorized Access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
      });
    };

    // Get All tasks data

    app.get('/api/tasks', async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email };
      const result = await tasksCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    // get single task data
    app.get('/api/tasks/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.findOne(query);
      res.send(result);
    });

    // save task in Database
    app.post('/api/tasks', async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    // update coupon availability;

    // app.patch('/api/coupons/:id', verifyToken, verifyAdmin, async (req, res) => {
    //   const id = req.params.id;
    //   const available = req.body.available;
    //   const query = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       available: available,
    //     },
    //   };
    //   const result = await couponsCollection.updateOne(query, updateDoc, options);
    //   res.send(result);
    // });

    // update Agreement status

    // app.patch('/api/agreements/:id', verifyToken, verifyAdmin, async (req, res) => {
    //   const id = req.params.id;
    //   const status = req.body.status;
    //   const date = req.body.date;
    //   const query = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       status: status,
    //       date: date,
    //     },
    //   };
    //   const result = await agreementsCollection.updateOne(query, updateDoc, options);
    //   res.send(result);
    // });

    // update user role

    // app.patch('/api/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    //   const email = req.params.id;
    //   const role = req.body.role;
    //   const query = { email: email };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       role: role,
    //     },
    //   };
    //   const result = await usersCollection.updateOne(query, updateDoc, options);
    //   res.send(result);
    // });

    // remove members and update users

    // app.patch('/api/remove-member', verifyToken, verifyAdmin, async (req, res) => {
    //   const email = req.body.email;
    //   const filter = { email: email };
    //   const updateDoc = {
    //     $set: {
    //       role: 'user',
    //     },
    //   };
    //   const result = await usersCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // });

    // Payment Intent

    // app.post('/api/create-payment-intent', async (req, res) => {
    //   const { rent } = req.body;
    //   const amount = parseInt(rent * 100);
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: amount,
    //     currency: 'usd',
    //     payment_method_types: ['card'],
    //   });
    //   res.send({
    //     clientSecret: paymentIntent.client_secret,
    //   });
    // });

    // Payment history

    // app.post('/api/payment-history', verifyToken, async (req, res) => {
    //   const paymentInfo = req.body;
    //   const result = await paymentHistoryCollection.insertOne(paymentInfo);
    //   const agQuery = { email: paymentInfo.email };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       lastPayment: paymentInfo.paymentDate,
    //       month: paymentInfo.month,
    //     },
    //   };
    //   const agResult = await agreementsCollection.updateOne(agQuery, updateDoc, options);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
  }
}

run().catch(console.dir);

app.get('/api', (req, res) => {
  res.send('Hello World!');
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
