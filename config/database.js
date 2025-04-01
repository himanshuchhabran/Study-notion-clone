const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect= ()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=> console.log("DB Connected Succesfully"))
    .catch((error)=>{
        console.error(error);
        console.log("DB Connection failed");
        process.exit(1);
    })
}