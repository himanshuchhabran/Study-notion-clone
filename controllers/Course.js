const Course = require("../models/Course");

const Tag = require("../models/Tags");

const  User  = require("../models/User");

const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createcourse handler

exports.createCourse = async(req,res)=>{
        try{

            //fetch data

            const {courseName, courseDescription,whatYouWillLearn,price,tag}= req.body;

            //get thumbnail

            const thumbnail = req.files.thumbnailImage;

            //validation
            if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
                return res.status(400).json({
                    success:false,
                    message:"All fields are required"
                })
            }

            //check for instructor

            const userId = req.user.id;
            const instructorDetails = await User.findById(userId);
            console.log("Instruction details: ",instructorDetails);

            if(!instructorDetails){
                return res.status(404).json({
                    sucess:false,
                    message:"Instructor details not found"
                })
            }

            //check given tag is valid or not

            const tagDetails = await Tag.findById(tag);
            if(!tagDetails){
                return res.status(404).json({
                    sucess:false,
                    message:"Tag details not found"
                })
            }

            // upload image to cloudinary
            const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)
            
            //create n  entry for new course
            const newCourse = await Course.create({
                courseName,
                courseDescription,
                instructor:instructorDetails._id,
                whatYouWillLearn:whatYouWillLearn,
                price,
                tag:tagDetails._id,
                thumbnail:thumbnail.secure_url,

            })

            //add the new course to the user schema of instructor
            await User.findByIdAndUpdate(
                {_id:instructorDetails._id},
                {
                    $push: {
                        courses:newCourse._id,
                    }
                },{
                    new:true,   
                }
            ); 

            //update the Tag schema 

            return res.status(200).json({
                success:true,
                message:"Course created successfully",
                data:newCourse
            })
        } catch(error){
            console.error(error);
            return res.status(500).json({
                success:false,
                message:"Failed to create Course",
                error:error.message

            })
        }
}


//getAllcourses handle function

exports.showAllCourses = async (req,res)=>{
    try{
        const allCourses = await Course.find({},{courseName:true,price:true,
            thumbnail:true,instructor:true,ratingAndReviews:true,studentsEnrolled:true
        }).populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Can not fetch course data",
            error:error.message
        })
    }


}