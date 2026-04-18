const mongoose = require("mongoose");

function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("server is connected to DB")
    })
    .catch(err =>{
        console.log("Error connecting to DB",err.message);
        process.exit(1) //if server cant connect to db, we stop the server immediately otherwise it will just consume our resources
    })
}

module.exports = connectDB;
