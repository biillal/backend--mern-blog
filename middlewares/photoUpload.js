const path = require('path')
const multer = require('multer')


// photo Storage
const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toDateString().replace(/:/g, "-") + file.originalname)
        } else {
            cb(null, false)
        }
    }
})


//photo upload middleware
const photoUpload = multer({
    storage:photoStorage,
    fileFilter:function(req,file,cb){
        if(file.mimetype.startsWith('image')){
            cb(null,true)
        }else{
            cb({message:"Unssuperted file format"},false)
        }
    },
    limits:{fileSize:1024 * 1024} //1 megabyte
})


module.exports = photoUpload