const asyncHandler = require('express-async-handler');
const {Comment , validateCreateComment,validateUpdateComment} = require('../model/Comment');
const {User} = require('../model/UserModel')

/**-------------------------------
 * @desc    create New comment 
 * @router  /api/comments
 * @methode POST
 * @access  private (only logged in users)
---------------------------------*/
module.exports.createCommentCntr = asyncHandler(async(req,res)=>{
    const {error} = validateCreateComment(req.body);
    if(error){
        res.status(400).json({message:error.details[0].message});
    }

    const profile = await User.findById(req.user.id)

    const comment = await Comment.create({
        postId:req.body.postId,
        text:req.body.text,
        user:req.user.id,
        username:profile.username
    });
    res.status(200).json({comment})
})


/**-------------------------------
 * @desc    Get all comment 
 * @router  /api/comments
 * @methode GET
 * @access  private (only admin)
---------------------------------*/
module.exports.getAllCommentCntr = asyncHandler(async(req,res)=>{
    const comment = await Comment.find().populate({path:"user",model:User})
    res.status(200).json(comment)
})


/**-------------------------------
 * @desc    Delete comment 
 * @router  /api/comments/:id
 * @methode DELETE
 * @access  private (only admin or owner of the comment)
---------------------------------*/
module.exports.deleteCommentCntr = asyncHandler(async(req,res)=>{
    const comment = await Comment.findById(req.params.id);
    if(!comment){
        return res.status(404).json({message:"comment not found"})
    }

    if(req.user.isAdmin || req.user._id === req.user.toString()){
       await Comment.findByIdAndDelete(req.params.id);
       res.status(201).json({message:"comment has been deleted"})
    }else{
        res.status(403).json({message:"access denied , not allowed"})
    }
})


/**-------------------------------
 * @desc    Update comment 
 * @router  /api/comments/:id
 * @methode PUT
 * @access  private (only  owner of the comment)
---------------------------------*/
module.exports.updateCommentCntr=asyncHandler(async(req,res)=>{
    const {error} = validateUpdateComment(req.body);
    if(error){
        res.status(400).json({message:error.details[0].message});
    }

    const comment  = await Comment.findById(req.params.id);
    if(! comment){
        res.status(404).json({message:"comment not found"})
    }

    if(req.user.id !== comment.user.toString()){
        res.status(403).json({message:"access denied , only user can edit his comment"})
    }

    const updateComment = await Comment.findByIdAndUpdate(req.params.id,{
        $set:{
            text:req.body.text
        }
    },{new:true});

    res.status(200).json(updateComment)
})