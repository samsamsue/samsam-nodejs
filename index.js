const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();

app.use('/', require('./routes/home'));

app.listen(port, () => {
  console.log(`App listening at http://127.0.0.1:${port}`);
});


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
});