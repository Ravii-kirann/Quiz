const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question :{type:String,required:true},
    answers : {type : [String], required : true},
    correctAnswerIndex : {type : Number , required : true},
    
})

const Question = mongoose.model('Question',questionSchema)

module.exports = Question;