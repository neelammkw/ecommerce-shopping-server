const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authMiddleware = require('./middleware/auth'); // Your custom middleware

const app = express();

// Middleware
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
const usersRoutes = require('./routes/user'); 
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const subcategoryRoutes = require('./routes/subcategories');
const cart = require('./routes/cart');
const reviews = require('./routes/reviews');
const order = require('./routes/order');
const mylist = require('./routes/mylist');
const search = require('./routes/search');
const dashboard = require('./routes/dashboard');
const notifications = require('./routes/notifications');


app.use("/uploads", express.static("uploads"));
app.use(`/api/categories`, categoryRoutes);
app.use(`/api/subcategories`, subcategoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/user`, usersRoutes);
app.use(`/api/cart`, cart);
app.use(`/api/review`, reviews);
app.use(`/api/my-list`, mylist);
app.use(`/api/order`, order);
app.use(`/api/search`, search);
app.use(`/api`, dashboard);
app.use(`/api/notifications`, notifications);

// Database
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Database Connection is Ready...');
  })
  .catch((err) => {
    console.log(err);
  });

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
