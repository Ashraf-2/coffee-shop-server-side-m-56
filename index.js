const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleweare
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bx5otjq.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //database collections
    // const coffeeCollection = client.db("coffeeDB").collection('coffee');
    const coffeeCollection = client.db("coffeeDB")
    const coffeCL = coffeeCollection.collection('coffee');
    // const userCollection = client.db("userDB").collection('user');
    const userCl = coffeeCollection.collection('user'); 
    //coffee related CRUD operations
    
    app.get('/coffee',async(req,res)=> {
        const cursor = coffeCL.find(); //coffeecl modified
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/coffee/:id',async(req,res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await coffeCL.findOne(query);  //cl modiefed
        res.send(result);
    })

    app.post('/coffee', async(req,res)=> {
        const newCoffee = req.body;
        console.log(newCoffee);
        const result = await coffeCL.insertOne(newCoffee);  //cl modiefied
        res.send(result);
    })


    app.put('/coffee/:id',async(req,res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedCOffee = req.body;

      const coffee1 = {
        $set: {
          name:updatedCOffee.name,
          quantity:updatedCOffee.quantity,
          supplier:updatedCOffee.supplier,
          taste:updatedCOffee.taste,
          details:updatedCOffee.details, 
          category:updatedCOffee.category, 
          photo_url:updatedCOffee.photo_url
        }
      }
      const result  = await coffeCL.updateOne(filter,coffee1,options) //cl mod
      res.send(result);
    })

    app.delete('/coffee/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCl.deleteOne(query);
      res.send(result);
    })


    //user related CRUD operations - apis

    //**QUESTION: why not app.get() function like the top most above of coffee management crud?
    app.post('/user',async(req,res)=> {
      const newUser = req.body;
      console.log('user:',newUser);
      const result = await userCl.insertOne(newUser);
      res.send(result)
    })

    app.get('/user',async(req,res) => {
      const cursor = userCl.find();
      const users = await cursor.toArray();
      res.send(users);
    })

    app.delete('/user/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCl.deleteOne(query);
      res.send(result);
    })

    //for lastlogged in
    app.patch('/user',async(req,res) => {
      const user = req.body;
      const filter = {email: user.email}
      const updateDoc = {
        $set: {
          lastloggedAt: user.lastloggedAt
        }
      }
      const result = await userCl.updateOne(filter,updateDoc)
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=> {
    res.send('Coffee making server is running');
})

app.listen(port,()=> {
    console.log(`coffee server is running on: ${port}`)
})