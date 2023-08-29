const mongoose = require('mongoose')

const connectDb =  ()=>{
    mongoose.connect(process.env.URL).then(()=>{
        console.log('connect to database')
    })
    .catch(()=>console.log('error'))
}


module.exports= connectDb