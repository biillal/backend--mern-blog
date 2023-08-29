const jwt = require('jsonwebtoken')

// verify token
function verifyToken(req, res, next) {
    const authToken = req.headers.authorization
    if (authToken) {
        const token = authToken.split(" ")[1]
        try {
            const decodedPayload = jwt.verify(token, process.env.SECRET_KEY)
            req.user = decodedPayload
            next()
        } catch (error) {
            res.status(401).json({ message: "Invalid token, access denied" })
        }
    } else {
        res.status(401).json({ message: "no token provided, access denied" })
    }
}

// verify token & admin
function verifyTokenAndAdmin(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.isAdmin){
            next()
        }else{
            res.status(403).json({message:'not allowed , only admin'})
        }
    })
}

// verify token & only user himself
function verifyTokenAndOnlyUser(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.id === req.params.id){
            next()
        }else{
            res.status(403).json({message:'not allowed , only user himself'})
        }
    })
}


// verify token & Authorization
function verifyTokenAndAuthorization(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next()
        }else{
            res.status(403).json({message:'not allowed , only user himself and admin'})
        }
    })
}


module.exports= {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization
}