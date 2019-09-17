//This file includes the format of which our users will be stored in our db
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//ES6 default promise
mongoose.Promise = global.Promise;

const lessonSchema = new Schema({
    //TBD what is stored in here
    type: String,
    module: String,
    name: String,
    failure: String,
    success: String,
    title: String,
    activity: String,
    referenceMaterial: String,
    screenCapture: String,
    solution: String,
    code: String
});

const Lesson = mongoose.model('lesson', lessonSchema);

module.exports = Lesson;
