const express = require('express');
const cors = require('cors');
require('./db/config')
const User = require('./db/User');
const app = express();
const Product = require('./db/product');

const jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';

app.use(express.json());
app.use(cors())

app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password
  res.send(result)
})

app.post("/login", async (req, resp) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      jwt.sign({user}, jwtKey, {expiresIn: '2h'}, (err, token) => {
        if (err) {
          resp.send({ result: "Somthing went wrong" })
        }
        resp.send({user, auth: token})
      })
            
    } else {
        resp.send({ result: "No User found" })
    }
  } 
});

app.post("/add-product", async(req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result)
})

app.get("/products", async (req, resp) => {
  const products = await Product.find();
  if (products.length > 0) {
      resp.send(products)
  } else {
      resp.send({ result: "No Product found" })
  }
});

app.delete("/product/:id", async (req, resp) => {
  let result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result)
});

app.get("/product/:id", async (req, resp) => {
  let result = await Product.findOne({ _id: req.params.id })
  if (result) {
      resp.send(result)
  } else {
      resp.send({ "result": "No Record Found." })
  }
})

app.put('/product/:id', async (req, res) => {
  let result = await Product.updateOne(
    {_id: req.params.id},
    {
      $set : req.body
    }
    )
    res.send(result);
});

app.get("/search/:key", async (req, resp) => {
  let result = await Product.find({
      "$or": [
          {
              name: { $regex: req.params.key }  
          },
          {
              company: { $regex: req.params.key }
          },
          {
              category: { $regex: req.params.key }
          }
      ]
  });
  resp.send(result);
})


app.listen(5000);