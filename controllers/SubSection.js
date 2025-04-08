const SubSection = require("../models/SubSection");
const Section  = require("../models/Section");

const {uploadImageToCloudinary} = require("../utils/imageUploader")
//create subsection

exports.createSubSection = async(req,res)=>{
    try{
        //data fetch
        const{title,timeDuration,description,sectionId} = req.body;
        //extract file/video
        const video = req.files.videoFile;

        //validation

        if(!title || !timeDuration || !video || !description || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        //create sub section
        const subSectionDetails = await SubSection.create({title:title,
            tileDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        //update section with the subsection

        const updatedSection = await Section.findByIdAndUpdate(sectionId,{
            $push:{
                subSection:SubSectionDetails._id
            }
        },{new:true});
        //populate subsection

        return res.status(200).json({
            success:true,
            message:"Sub section created successfully",
            updatedSection
        })

    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in creating sub section",
            error:error.message
        })
     
    }
}

exports.updateSubSection = async (req,res)=>{

    try{
         //data fetch
    const{title,timeDuration,description,subSectionId}=req.body;

    const video = req.files.videoFile;
    //validation

    if(!title || !timeDuration || !description || !video || !subSectionId){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        });
    }

    const uploadDetails = awaituploadImageToCloudinary(video,process.env.FOLDER_NAME);

    //update sub section

    const subSection = await SubSection.findByIdAndUpdate(subSectionId,{
        title,
        description,
        timeDuration,
        video 
    },{new:true})

    return res.status(200).json({
        success:true,
        message:"Sub Section updated successfully",
    })



    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in updating sub section",
            error:error.message
        })

    }
   

}

exports.deleteSubSection = async (req,res)=>{
    try{
         //id fetch
    const {subSectionId} = req.params;

    //delete sub section

    await SubSection.findByIdAndDelete(subSectionId);

    return res.status(200).json({
        success:true,
        message:" Sub Section deleted successfully",
    })


    } catch(errror){
        return res.status(500).json({
            success:false,
            message:"Error in deleting sub section",
            error:error.message
        })

    }
   
}
