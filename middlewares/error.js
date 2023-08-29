// error notfound middleware
const notFound = (req,res,next)=>{
    const error = new Error(`not found - ${req.originalUrl}`)
    res.status(404);
    next(error)
}


// Error Handler Middleware
const errorHandler = (err,req,res,next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message:err.message,
        stack:err.stack
    })
}



module.exports = {
    errorHandler,
    notFound
}