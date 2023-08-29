const path = require('path')
const asyncHandler = require("express-async-handler")
const {Post,validateCreatePost,validateUpdatePost}=require('../model/Post')
const fs = require('fs')
const {cloudinarayRemoveImage ,cloudinarayUploadImage} = require('../utils/cloudinary')
const {User} = require('../model/UserModel')
const {Comment} = require('../model/Comment')

/**-------------------------------
 * @desc    create New post 
 * @router  /api/posts/create
 * @methode POST
 * @access  private (only admin)
---------------------------------*/
module.exports.createPostCntr = asyncHandler(async(req,res)=>{
    // 1. validation for image
       if(!req.file){
        res.status(400).json({message:"no image provided"})
       }
    // 2. validation for data
       const {error} = validateCreatePost(req.body)
       if(error){
        res.status(400).json({message:error.details[0].message})
       }
    // 3. upload image
       const imagePath = path.join(__dirname,`../images/${req.file.filename}`)
       const result = await cloudinarayUploadImage(imagePath)
    // 4. create new post ans save if to DB 
       const post = await Post.create({
           title:req.body.title,
           description:req.body.description,
           category:req.body.category,
           user:req.user.id,
           image:{
              url:result.secure_url,
              publicId:result.public_id
           }
       })
    // 5. send respose to the client
       res.status(200).json({post})
    // 6. remove image from server
       fs.unlinkSync(imagePath)
});


/**--------------------------------
 * @desc Get all posts
 * @Route /api/posts
 * @methode GET
 * @access public
----------------------------------*/
module.exports.getAllPostsCltr = asyncHandler(async(req,res)=>{
    const POSR_PER_PAGE= 3
    const {pageNumber , category} = req.query
    let posts;
    if(pageNumber){
        posts = await Post.find()
                           .skip((pageNumber - 1) * POSR_PER_PAGE)
                           .limit(POSR_PER_PAGE)
                           .populate({ path: 'user', model: User })
                           .populate({path:'comments',model:Comment})
    }else if(category){
        posts = await Post.find({category}).sort({createdAt:-1})
                          .populate({ path: 'user', model: User })
                          .populate({path:'comments',model:Comment})
    }else{
        posts = await Post.find()
                            .sort({createdAt:-1}).populate({ path: 'user', model: User })
                            .populate({path:'comments',model:Comment})
    }

    res.status(200).json({result:posts.length,posts:posts})
})


/**--------------------------------
 * @desc Get single posts
 * @Route /api/posts/:id
 * @methode GET
 * @access public
----------------------------------*/
module.exports.getSinglePostCltr = asyncHandler(async(req,res)=>{
    const post = await Post.findById(req.params.id)
                           .populate({ path: 'user', model: User })
                           .populate({path:'comments',model:Comment});
    if(!post){
      return res.status(404).json({message:"post not found"})
    }

    res.status(200).json(post)
})


/**--------------------------------
 * @desc Get Count posts
 * @Route /api/posts/count
 * @methode GET
 * @access public
----------------------------------*/
module.exports.getCountPostCltr = asyncHandler(async(req,res)=>{
   const count = await Post.count();
   res.status(200).json({count:count})
})


/**--------------------------------
 * @desc Delete posts
 * @Route /api/posts/:id
 * @methode DELETE
 * @access private (only user himself or admin)
----------------------------------*/
module.exports.deletePostCltr = asyncHandler(async(req,res)=>{
   const post = await Post.findById(req.params.id);
   if(!post){
     return res.status(404).json({message:"post not found"})
   }
   if(req.user.isAdmin || req.user.id === post.user.toString()){
      await Post.findByIdAndDelete(req.params.id);
      await cloudinarayRemoveImage(post.image.publicId)

      // @TODO - delete all comments that belong to this post
      await Comment.deleteMany({postId:post._id}) 
      
      res.status(200).json({message:"post has been deleted successfully " , postId : post._id})
   }else{
      res.status(403).json({message:"access denied , forbidden"})
   }

   res.status(200).json({post:post})
})



/**--------------------------------
 * @desc Update posts
 * @Route /api/posts/:id
 * @methode PUT
 * @access private (only owner of the post)
----------------------------------*/
module.exports.updatePostCltr = asyncHandler(async(req,res)=>{
   // 1. validation
     const {error} = validateUpdatePost(req.body)
     if(error){
       res.status(404).json({message:error.details[0].message})
     }

   // 2. get the post from DB and check if the post exist
     const post = await Post.findById(req.params.id);
     if(!post){
        res.status(404).json({message:"post not found"})
     }
   
   // 3. check if this post belong to logged in user
     if(req.user.id !== post.user.toString()){
        return res.status(404).json({message:"access denied , your are not allowed"})
     }

   // update post
     const updatePost = await Post.findByIdAndUpdate(req.params.id,{
       $set:{
         title:req.body.title,
         description:req.body.description,
         category:req.body.category
       }
     },{new:true}).populate({path:"user",model:User});

   res.status(200).json({updatePost})
});
 

/**--------------------------------
 * @desc Update photo posts
 * @Route /api/posts/upload-image/:id
 * @methode PUT
 * @access private (only owner of the post)
----------------------------------*/
module.exports.updatePostImageCltr = asyncHandler(async(req,res)=>{
   // 1. validation
     if(!req.file){
        res.status(404).json({message:"no image provided"})
     }

   // 2. get the post from DB and check if the post exist
     const post = await Post.findById(req.params.id);
     if(!post){
        res.status(404).json({message:"post not found"})
     }
   
   // 3. check if this post belong to logged in user
     if(req.user.id !== post.user.toString()){
        return res.status(404).json({message:"access denied , your are not allowed"})
     }

   // 4. update post image
     await cloudinarayRemoveImage(post.image.publicId)

   // 5. upload new post
     const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
     const result = await cloudinarayUploadImage(imagePath)

   // 6. update post image
     const updatePost = await Post.findByIdAndUpdate(req.params.id,{
       $set:{
         image:{
            url:result.secure_url,
            publicId:result.public_id
         }
       }
     },{new:true}).populate({path:"user",model:User});

   // 7. send response to client
     res.status(200).json({updatePost})

   // 8. remove image from  the server
     fs.unlinkSync(imagePath)


});


/**--------------------------------
 * @desc Toggle like
 * @Route /api/posts/like/:id
 * @methode PUT
 * @access private (only logged in user)
----------------------------------*/
module.exports.toggleLikeCntr = asyncHandler(async(req,res)=>{
   let post = await Post.findById(req.params.id);
   if(!post){
      res.status(404).json({message:"post not found"})
   }

   const isPostAlreadyLiked = post.likes.find((user)=> user.toString() === req.user.id)
   console.log(isPostAlreadyLiked)
   if(isPostAlreadyLiked){
      post = await Post.findByIdAndUpdate(req.params.id,{
         $pull:{
            likes:req.user.id
         }
      },{new : true})
   }else{
      post = await Post.findByIdAndUpdate(req.params.id,{
         $push:{
            likes:req.user.id
         }
      },{new: true})
   }
   res.status(200).json(post)
})