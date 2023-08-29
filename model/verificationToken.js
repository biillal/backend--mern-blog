const mongoose = require('mongoose');


const varificationSchema = mongoose.Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    token:{
        type:String,
        required:true
    },
},{timestamps:true})

const VarificationToken = mongoose.model('varificationToken',varificationSchema);



module.exports = VarificationToken
    
