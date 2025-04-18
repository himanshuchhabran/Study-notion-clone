const RatingAndReview = require("../models/RatingAndReview");
const course = require("../models/Course");
const Course = require("../models/Course");
const mongoose = require("mongoose");

//create Rating 
exports.createRating = async (req,res)=>{
    try{    

        //get user id   
        const userId = req.user.id;
        //fetch data
        const {rating, review, courseId} = req.body;
        //check if user is enrolled
        const courseDetails = await Course.findOne(
                            {_id:courseId,studentEnrolled:{$elemMatch: {$eq: userId}},
                         });

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course"
            })
        }
        //check if user already rated 
        const alreadyReviewed = await RatingAndReview.findOne({
                                            user:userId,
                                            course:courseId,
        })
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user",
            })
        }
        // create rating nd review 
        const ratingReview = await RatingAndReview.create({
                                            rating,
                                            review,
                                            course:courseId,
                                            user:userId
        });

        //update course with rating and review
        const updatedCourseDetails =  await Course.findByIdAndUpdate({_id:courseId},{
                        $push:{ratingAndReviews:ratingReview._id}

        },{new:true})
        console.log(updatedCourseDetails); 
        return res.status(200).json({
            success:true,
            message:"Rating and Review created successfully",
            ratingReview

        })
    } catch(error){ 
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in creating rating and review"
        })

    }
}


//get average rating 

exports.getAverageRating = async(req,res)=>{
    try{
            // get course ID
            const courseId = req.body.courseId;

            //calculate average rating
            
            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: mongoose.Types.ObjectId(courseId),
                    }
                },
                {
                    $group:{
                        _id:null,
                        averageRating:{ $avg:"$rating"}
                    }
                }
            ])
            //return rating

            if(result.length>0){
                return res.status(200).json({
                    success:true,
                    averageRating:result[0].averageRating,
                })
            }

            //if no rating exist
            return res.status(200).json({
                success:true,
                message:"average rating is 0,no rating is given",
                averageRating:0
            })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


//getAll rating and reviews

exports.getAllRating = async(req,res)=>{
    try{
         const allReviews = await RatingAndReview.find({})
                                .sort({rating:"desc"})
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image"
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName"
                                })
                                .exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })  

    }
}