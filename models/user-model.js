//This file includes the format of which our users will be stored in our db
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//ES6 default promise
mongoose.Promise = global.Promise;

const userSchema = new Schema({
    username: String,
    googleId: String,
    email: String,
    thumbnail: String,
    school: String,
    firstName: String,
    lastName: String,
    language: String,
    isUser: Boolean,
    year: Number,
    class: Number
});

const User = mongoose.model('user', userSchema);

module.exports = User;
