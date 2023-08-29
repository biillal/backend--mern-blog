const {Category,validateCreateCategory} = require('../model/Category')
const asyncHandler = require('express-async-handler')



/**-------------------------------
 * @desc create new Category
 * @Route /api/categories
 * @methode POST
 * @access private (only admin)
---------------------------------*/
module.exports.createCategoryCntr = asyncHandler(async(req,res)=>{
    const {error} = validateCreateCategory(req.body);
    if(error){
        res.status(401).json({message:error.details[0].message});
    }
    const category = await Category.create({
        user:req.user.id,
        title:req.body.title,
    });
    res.status(200).json(category)
})


/**-------------------------------
 * @desc Get all Category
 * @Route /api/categories
 * @methode GET
 * @access public 
---------------------------------*/
module.exports.getAllCategoriesCntr = asyncHandler(async(req,res)=>{
    const categories = await Category.find()
    res.status(200).json(categories)
})


/**-------------------------------
 * @desc Delete Category
 * @Route /api/categories/:id
 * @methode DELETE
 * @access private (only admin) 
---------------------------------*/
module.exports.deleteCategoriyCntr = asyncHandler(async(req,res)=>{
    const categories = await Category.findByIdAndDelete(req.params.id)
    if(!categories){
        res.status(404).json({message:"category not found"})
    }
    res.status(200).json({message:"delete successfully"})
})
