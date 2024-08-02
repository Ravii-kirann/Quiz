const mongoose = require('mongoose');
 
const connectDB = async () =>{
    try {
        await mongoose.connect("mongodb://localhost:27017/quizApp")
        console.log("mongoDB connected Successfully")
    } catch (error) {
        console.error('MongoDB connection error:', err);
    process.exit(1); 
    }
}

module.exports = connectDB;