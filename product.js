const express = require("express");
const app = express();
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json());


app.listen(3000, () => {
  console.log("Server is running on port 3000 : http://localhost:3000");
});

app.get("/", (req, res) => {
  res.send("Hello, World!. akin product development server is running fine now.");
});



// In-memory storage
let products = [];
let nextId = 1;

/**
 * CREATE a product
 * POST /products
 */
app.post("/products", (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      message: "Product name and price are required"
    });
  }

  const product = {
    id: nextId++,
    name,
    price,
    description: description || ""
  };

  products.push(product);
  res.status(201).json(product);
});

/**
 * GET all products
 * GET /products
 */
app.get("/products", (req, res) => {
  res.json(products);
});

/**
 * GET product by ID
 * GET /products/:id
 */
app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

/**
 * UPDATE a product
 * PUT /products/:id
 */
app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, price, description } = req.body;

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (description !== undefined) product.description = description;

  res.json(product);
});

/**
 * DELETE a product
 * DELETE /products/:id
 */
app.delete("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deleted = products.splice(index, 1);
  res.json({
    message: "Product deleted successfully",
    product: deleted[0]
  });
});

