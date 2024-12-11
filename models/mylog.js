const mongoose = require('mongoose');
const { link } = require('../routes/home');

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
    },
    location:{
        type:Object,
        default:null,
    },
    link:{
        type:Object,
        default:null,
    },
    emoji:{
        type:String,
        default:null,
    },
});
const Item = mongoose.model('mylog', itemSchema);

module.exports = Item;
