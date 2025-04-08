const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updateProfile = async(req,res)=>{
    try{    
        //get data
        const {dateOfBirth="",about="",gender,contactNumber} = req.body;
        const id = req.user.id;
        //validation

        if(!contactNumber || !gender ||!id){
            return res.status(400).json({
                success:false,
                message:"Data missing "
            })
        }
        //find profile and update

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        
        await profileDetails.save(); 
        //return rsponse
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails
        })
        
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in creating profile",
            error:error.message
        })

    }
}

//delete 

exports.deleteAccount  = async(req,res)=>{
    try{
        //get id 
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        //delete profile 

        await Profile.findByIdAndDelete({_id:userDetails.additionDetails});
        //delete user   

        await User.findByIdAndDelete({_id:id});

        //todo unenroll from all enrolled courses
        //scheduling the account deletion
        return res.status(200).json({
            success:true,
            message:"User deleted successfully"
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in deleting account",
            error:error.message
        })

    }
}


exports.getAllUserDetails = async (req,res)=>{
    try{
        const id = req.user.id;
        //validationa nd get user details 
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully"
        })
        
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in fetching data",
            error:error.message
        })


    }
   


}