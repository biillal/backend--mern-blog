const asyncHandler = require('express-async-handler')
const { User, validateRegisterUser, validateLoginUser } = require('../model/UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const VarificationToken = require('../model/verificationToken')
const sendEmail = require('../utils/sendEmail')

/**------------------------------------------
 * @desc Register new register
 * @router /api/auth/register
 * @methode post 
 * @access public 
--------------------------------------------*/

module.exports.registerUserCntr = asyncHandler(async (req, res) => {
    //validation
    const { error } = validateRegisterUser(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    //is user already exist
    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ message: 'user already exist' })
    }
    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    //new user and save to db
    let users = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    });
    await users.save()

    // create new veriefication token 
    const verifToken = new VarificationToken({
      userId:users._id,
      token:crypto.randomBytes(32).toString("hex")
    })
    await verifToken.save()
    // making the link
    const link = `http://localhost:3000/users/${users._id}/verify/${verifToken.token}`
    //puting the link  into on html 
    const htmlTemplate = `
     <div >
       <p>click to the link below to verify your email </p>
       <a href="${link}">Verify </a>
     </div>
    `;
    //send email 
    await sendEmail(users.email,"Verify your email",htmlTemplate)
    //send a response
    res.status(201).json({ message:"You sent to your an email , please verify your email address" })
})



/**------------------------------------------
 * @desc login new login
 * @router /api/auth/login
 * @method post
 * @access public 
--------------------------------------------*/

module.exports.loginUsercntr = asyncHandler(async (req, res) => {
    //validation
      const { error } = validateLoginUser(req.body)
      if (error) {
        return res.status(400).json({ message: error.details[0].message })
      }
    // 2- if user exist
      let user = await User.findOne({email:req.body.email})
      if(!user){
       return  res.status(400).json({ message: "Invalide email or password"})
      }

    //check the password
      const isPasswordMatch = await bcrypt.compare(req.body.password,user.password)
    
      if(!isPasswordMatch){
        return res.status(400).json({ message: "Invalide email or password"})
      }

    // sending email 
    if(!user.isAccontVerified){
      return res.status(400).json({message:"You sent to your an email , please verify your email address"})
    }
    //generate token jwt
       const token = user.generateAuthToken();

    // response to client
      res.status(201).json({
        _id:user._id,
        isAdmin:user.isAdmin,
        profilePhoto:user.profilePhoto,
        token,
        username:user.username
    })
})




/**------------------------------------------
 * @desc verify user account
 * @router /api/auth/:userId/verify/:token
 * @method GET
 * @access public 
--------------------------------------------*/
module.exports.verifyUserAccountCntr = asyncHandler(async(req,res)=>{
   const user = await User.findById(req.params.userId)
   if(!user){
    return  res.status(400).json({ message: "Invalide link"})
   }

   const verificationToken = await VarificationToken.findOne({
    userId:user._id,
    token:req.params.token
   })

   if(!verificationToken){
    return  res.status(400).json({ message: "Invalide link"})
   }

   user.isAccontVerified = true
   await user.save();
   
   res.status(200).json({message:"Your account verified"})
})
