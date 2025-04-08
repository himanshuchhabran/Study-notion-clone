const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User =  require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");
//capture the payment  and initiate the payment for razorpay order 

exports.capturePayment = async (req,res)=>{
    //get course Id and userid
    const {course_id} = req.body;
    const userId = req.user.id;
    //validation
    //valid courseid
    if(!course_id){
        return res.status(400).json({
            success:false,
            message:"Please provide valid course id",
        })
    }
    //valid course details
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course) {   
            return res.status(400).json({
                success:false,
                message:"Could not find the course"
            })
        }
        //check user has not done payment already
        //convert user id into object id
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled",
            })
        }
    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
    //create order
    const amount = course.price;
    const currency = "INR";
    
    const options={
        amount:amount*100,
        currency,
        reciept:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,

        }
    };

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.orderId,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            sucess:false,
            message:"could not initiate order"
        })
    }
    //return response
}


//verify signature of razorpay and server

exports.verifySignature = async(req,res)=>{
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];
    
    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature===digest){
        console.log("Payment is authorised")

        const{courseId,userId} = req.body.payload.payment.entity.notes;

        try{
        //fulfil the action     
        
        //find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            {
                _id:courseId
            },
            {
                $push:{studentsEnrolled:userId}
                
            },
            {new:true}
         );

         if(!enrolledCourse){
            return res.status(500).json({
                success:false,
                message:"course not found"
            });
         }
         console.log(enrolledCourse);

         //find the student and update the course in the list of enrolled courses
         const enrolledStudent = await User.findOneAndUpdate(
            {_id:userId},
            {
                $push:{courses:courseId}
            },
            {new:true}
        );

        console.log(enrolledStudent);

        //confirmation mail send
         const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from Study Minds",
                "Congratulations, you are onboarded into new Course",

         );
         console.log(emailResponse);

        return res.status(200).json({
            success:true,
            message:"Signature verified and course added"
        }) 
        } catch(error)
        {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }

    else{
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        });
    }

};