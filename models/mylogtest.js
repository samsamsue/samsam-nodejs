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
    },
    location:{
        type:Object,
        default:null,
    }
});
const Item = mongoose.model('mylogtest', itemSchema);

module.exports = Item;
