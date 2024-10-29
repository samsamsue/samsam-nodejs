const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    content: String,
    date: {
        type: Date,
        default: Date.now
    },
});
const Item = mongoose.model('mylog', itemSchema);

module.exports = Item;
