const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();

app.use('/', require('./routes/index'));

app.listen(port, () => {
  console.log(`App listening at http://127.0.0.1:${port}`);
});


const uri = 'mongodb+srv://yiroonli:44MCcTCDpCTuswwQ@samsam-db.r9u42.mongodb.net/samsam?retryWrites=true&w=majority&appName=samsam-db';

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected successfully!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
});