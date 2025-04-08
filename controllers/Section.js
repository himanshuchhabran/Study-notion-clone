const Section = require("../models/Section");

const Course = require("../models/Course");

exports.createSection = async (req,res)=>{
    try{
        //data fetch
        const {sectionName,courseId } = req.body;

        //data validation
        if(!sectionName|| !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing entires in section"
            })
        }   
        //create section

        const newSection = await Section.create({sectionName});

        //update course by inserting object id of section
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                        courseId,
                                        {
                                            $push:{
                                                courseContent:newSection._id,
                                            }
                                        },{
                                            new:true
                                        },
        )
        //use populate to section and subsection to show instead of object id
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails
        })



    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in creating section",
            error:error.message
        })

    }
}

exports.updateSection = async (req,res)=>{
    try{
        //fetch data

        const{sectionName,sectionId  } = req.body;

        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Data missing"
            })
        }
        //update data

        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
        })

    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in updating section",
            error:error.message
        })

    }
}

exports.deleteSection = async(req,res)=>{
    try{
        //get id -> if id is sending in params
        const {sectionId} = req.params;
        //use findbyid and delete
        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in deleting section",
            error:error.message
        })

    }
}