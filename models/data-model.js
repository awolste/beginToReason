//This file includes the format of which our data will be stored in our db
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//ES6 default promise
mongoose.Promise = global.Promise;

const dataSchema = new Schema({
    module: String,
    name: String,
    author: String,
    milliseconds: Number,
    code: String,
    timestamp: String,
    status: String,
    explaination: String
});

const Data = mongoose.model('data', dataSchema);

module.exports = Data;
