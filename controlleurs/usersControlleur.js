const asyncHandler = require('express-async-handler')
const { User, validateUpdateUser } = require('../model/UserModel')
const bcrypt = require('bcrypt')
const path = require('path')
const { cloudinarayRemoveImage, cloudinarayUploadImage, cloudinarayRemoveMultipleImage } = require('../utils/cloudinary')
const fs = require('fs')
const { Post } = require('../model/Post')
const { Comment } = require('../model/Comment');


/**------------------------------------------
 * @desc Get all users profile
 * @router /api/users/profile
 * @methode GET 
 * @access private (only admin)
--------------------------------------------*/
module.exports.getAllUsersCntr = asyncHandler(async (req, res) => {
    const users = await User.find().populate({ path: "posts", model: Post });
    res.status(201).json({ result: users.length, users })
});



/**------------------------------------------
 * @desc Get user profile
 * @router /api/users/profile/:id
 * @methode GET 
 * @access public
--------------------------------------------*/
module.exports.getUserCntr = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate({ path: "posts", model: Post });
    if (!user) {
        return res.status(402).json({ message: "user not found" })
    }

    res.status(201).json(user)
});


/**------------------------------------------
 * @desc Update user profile
 * @router /api/users/profile/:id
 * @methode put 
 * @access private (only user himself)
--------------------------------------------*/
module.exports.updateUserCntr = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = validateUpdateUser(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message })
    }

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
    }

    const updateUser = await User.findByIdAndUpdate(id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio
        }
    }, { new: true }).select("-password")

    res.status(201).json(updateUser)
})


/**------------------------------------------
 * @desc Get user Count
 * @router /api/users/count
 * @methode GET 
 * @access private (only admin)
--------------------------------------------*/
module.exports.getCountUserCntr = asyncHandler(async (req, res) => {
    const count = await User.count();
    res.status(201).json({ count: count })
});


/**------------------------------------------
 * @desc Profile Photo Upload
 * @router /api/users/profile/profile-photo-upload
 * @methode POST 
 * @access private (only logged in user)
--------------------------------------------*/
module.exports.profilePhotoUploadCntr = asyncHandler(async (req, res) => {
    //1-validation
    if (!req.file) {
        res.status(400).json({ message: "no file provided" })
    }
    // 2. get the path to the image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    // 3. upload to cloudinaray
    const result = await cloudinarayUploadImage(imagePath)
    console.log(result)
    // 4. get the user from DB
    const user = await User.findById(req.user.id)
    // 5. delete the old profile photo if exist
    if (user.profilePhoto.publicId !== null) {
        await cloudinarayRemoveImage(user.profilePhoto.publicId)
    }
    // 6. change the profilephoto field in the DB 
    user.profilePhoto = {
        url: result.secure_url,
        publucId: result.public_id
    }
    await user.save()

    // 7.send response to client
    res.status(200).json({
        message: "your profile photo uploaded successfully",
        profilePhoto: { url: result.secure_url, publicId: result.public_id }
    })
    //8.Remove image from the server
    fs.unlinkSync(imagePath)
})



/**------------------------------------------
 * @desc Delete user profile (Account)
 * @router /api/users/profile/:id
 * @methode DELETE 
 * @access private (only admin or user himself)
--------------------------------------------*/
module.exports.deleteUserProfileCntr = asyncHandler(async (req, res) => {
    // 1. get user from DB
    const user = await User.findById(req.params.id)
    if (!user) {
        res.status(404).json({ message: "user not found" })
    }
    // @TODO - 2. get all posts from DB
    const post = await Post.find({ user: user._id })
    console.log("post ", post)
    // @TODO - 3. get the public id from the post
    const publicIds = post.map((post) => post.image.publicId)
    console.log(publicIds)
    // @TODO - 4. delete all post image from cloudinary that belong to this user
    if (publicIds?.length > 0) {
        await cloudinarayRemoveMultipleImage(publicIds)
    }

    // 5. delete profile pucture from cloudinary
    if (user.profilePhoto.publucId !== null) {
        await cloudinarayRemoveImage(user.profilePhoto.publucId)
    }
    // @TODO - 6. delete user posts & comments 
    await Post.deleteMany({ user: user._id });
    await Comment.deleteMany({ user: user._id })

    // 7. delete the user himself
    await User.findByIdAndDelete(req.params.id)
    // 8. send a response to the client
    res.status(200).json({ message: "your profile has been deleted" })
})