const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const port = 5000;
// middleware
// const corsOptions = {
//   origin: "*",
//   credentials: true,
//   optionSuccessStatus: 200,
// };

app.use(cors({
  origin: [
    'http://localhost:5174',
    "https://foods-donation.netlify.app"
 
],
credentials: true
}))

// app.use(cors());
app.use(express.json());
app.use(cookieParser());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xrrjj6y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// const verifyToken = (req, res, next) => {
//   const token = req?.cookies?.token;
//   // console.log('token in the middleware', token);
//   // no token available
//   if (!token) {
//       return res.status(401).send({ message: 'unauthorized access' })
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//       if (err) {
//           return res.status(401).send({ message: 'unauthorized access' })
//       }
//       req.user = decoded;
//       next();
//   })
// }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const featureFoods = client.db("foodDonation").collection("featureFood");
    const requestFoods = client.db("foodDonation").collection("requestFoods");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logging out", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    app.get("/homeFood", async (req, res) => {
      const homeFoodFeatures = await featureFoods.find().toArray();
      // console.log(homeFoodFeatures);
      res.send(homeFoodFeatures);
    });

    app.get("/featureFood", async (req, res) => {
      const foodFeatures = await featureFoods.find().toArray();
      // console.log(foodFeatures);
      res.send(foodFeatures);
    });
    app.get("/featureFood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await featureFoods.findOne(query);
      res.send(result);
    });

    app.get("/AddFoodRequest", async (req, res) => {
      const foodRequests = await requestFoods.find().toArray();
      console.log(foodRequests);
      res.send(foodRequests);
    });

    // food added
    app.post("/AddFood", async (req, res) => {
      const Food = req.body;
      console.log(Food);
      const result = await featureFoods.insertOne(Food);
      console.log(result);
      res.send(result);
    });
    // food request added
    app.post("/AddFoodRequest", async (req, res) => {
      const Food = req.body;
      console.log(Food);
      console.log("hello");
      const result = await requestFoods.insertOne(Food);
      console.log(result);
      res.send(result);
    });
    app.post("/food/click", async (req, res) => {
      const { foodId } = req.body;
      const filter = { _id: new ObjectId(foodId) };
      const updatedService = await featureFoods.findOneAndUpdate(
        filter,
        { $inc: { clickCount: 1 } },
        { returnDocument: 'after' }
      );
      console.log(foodId,filter,updatedService);
      res.send(updatedService);
    });

    // request delete

    app.delete("/AddFoodRequest/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await requestFoods.deleteOne(Food);
      console.log(result);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`server port is runnining on port ${port}`);
});
