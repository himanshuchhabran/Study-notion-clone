const Category = require("../models/Category");

//create Category handler function 

exports.createCategory = async (req,res)=>{
    try{
        //fetch data
        const {name,description} = req.body;
        // validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }

        //create entry in db

        const categoryDetails = await Category.create({
            name:name,
            description:description
        });
        console.log(categoryDetails);
        
        return res.status(200).json({
            success:true,
            message:"Category created successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
};

//get all Catgories Handler function

exports.showAlltags = async (req,res)=>{
    try{
        const allCategories = await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:'All categories returned successfully'
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}