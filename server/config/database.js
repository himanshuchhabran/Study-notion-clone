const mongoose = require("mongoose");
require("dotenv").config();

exports.connect= ()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=> console.log("DB Connected Succesfully"))
    .catch((error)=>{
        console.error(error);
        console.log("DB Connection failed");
        process.exit(1);
    })
}