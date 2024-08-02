const mongoose = require('mongoose');
 
const connectDB = async () =>{
    try {
        await mongoose.connect("mongodb+srv://ravikiranjayanthi5555:ravi12345@cluster0.wqlsyot.mongodb.net/")
        console.log("mongoDB connected Successfully")
    } catch (error) {
        console.error('MongoDB connection error:', error);
    process.exit(1); 
    }
}

module.exports = connectDB;