const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    content: String,
    date: {
        type: Date,
        default: Date.now
    },
    mediaList:{
        type:Array,
        default:[],
    },
    type:{
        type:String,
        default:'image',
        enum:['image','video','audio',]
    }
});
const Item = mongoose.model('mylog', itemSchema);

module.exports = Item;
