const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender")
const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    }
});

// function to send emails

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"verification Email from StudyMinds",otp);
        console.log("Email sent successfully: ",mailResponse);
    }

    catch(error){
        console.log("Error in sending mails: ",error);
        throw error;
    }
}

otpSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("Otp",otpSchema);