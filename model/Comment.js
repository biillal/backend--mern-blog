const mongoose = require('mongoose');
const joi = require('joi');

const commentSchema = mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    }

},{timestamps:true})

const Comment = mongoose.model("comment",commentSchema)

//validation post comment
const validateCreateComment = function(obj){
    const schema = joi.object({
        postId:joi.string().required(),
        text:joi.string().trim().required()
    });
    return schema.validate(obj)
}

//validation update comment
const validateUpdateComment = function(obj){
    const schema = joi.object({
        text:joi.string().trim().required()
    });
    return schema.validate(obj)
}

module.exports = {
    Comment,
    validateCreateComment,
    validateUpdateComment
}