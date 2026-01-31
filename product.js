const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let products = [];
let users = [];
let nextId = 1;

/* =======================
   AUTH MIDDLEWARE
======================= */

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

/* =======================
   AUTH ROUTES
======================= */

app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    username,
    password: hashedPassword,
    role: role || "user",
  });

  res.json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token });
});

/* =======================
   PRODUCT ROUTES
======================= */

// READ – any authenticated user
app.get("/products", authenticate, (req, res) => {
  res.json(products);
});

app.get("/products/:id", authenticate, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

// CREATE – admin only
app.post("/products", authenticate, authorize("admin"), (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price required" });
  }

  const product = {
    id: nextId++,
    name,
    price,
    description: description || "",
  };

  products.push(product);
  res.status(201).json(product);
});

// UPDATE – admin only
app.put("/products/:id", authenticate, authorize("admin"), (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, price, description } = req.body;
  if (name) product.name = name;
  if (price) product.price = price;
  if (description) product.description = description;

  res.json(product);
});

// DELETE – admin only
app.delete("/products/:id", authenticate, authorize("admin"), (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deleted = products.splice(index, 1);
  res.json({ message: "Product deleted", product: deleted[0] });
});

/* =======================
   SERVER
======================= */

app.get("/", (req, res) => {
  res.send("Akin product development server running successfully 🚀");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});


