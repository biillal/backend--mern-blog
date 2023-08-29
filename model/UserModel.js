const mongoose = require('mongoose')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const userShema = mongoose.Schema({
    username:{
        type:String,
        required:[true,"username is required"],
        trim:true,
        minLength:2,
        maxLength:32,
        unique:true
    },
    email:{
        type:String,
        required:[true,"email is required"],
        trim:true,
        minLength:5,
        maxLength:32,
        unique:true
    },
    password:{
        type:String,
        required:[true,"password is required"],
        trim:true,
        minLength:8,
    },
    profilePhoto:{
        type:Object,
        default:{
            url:"https://pixabay.com/static/img/profile_image_dummy.svg",
            publucId:null
        }
    },
    bio:{
        type:String
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isAccontVerified:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// populate posts
userShema.virtual("posts",{
    ref:"Post",
    foreignField:"user",
    localField:"_id"
})

//ganerate auth token
userShema.methods.generateAuthToken = function(){
    return jwt.sign({id:this._id , isAdmin:this.isAdmin},process.env.SECRET_KEY)
}

//user model
const User = mongoose.model('user',userShema)

// validate register user
function validateRegisterUser(obj){
    const shema = joi.object({
        username: joi.string().trim().min(2).max(32).required(),
        email:joi.string().trim().min(5).max(32).required().email(),
        password:joi.string().trim().min(8).required(),
    })
    return shema.validate(obj)
}
// validate login user
function validateLoginUser(obj){
    const shema = joi.object({
        email:joi.string().trim().required().email(),
        password:joi.string().trim().required(),
    })
    return shema.validate(obj)
}
// validate update user

function validateUpdateUser(obj){
    const shema = joi.object({
        username: joi.string().trim().min(2).max(32),
        password:joi.string().trim().min(8),
        bio:joi.string()
    })
    return shema.validate(obj)
}

module.exports ={
     User,
     validateRegisterUser,
     validateLoginUser,
     validateUpdateUser
}