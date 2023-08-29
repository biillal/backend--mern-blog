const router = require('express').Router()
const { verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyToken,
    verifyTokenAndAuthorization
} = require('../middlewares/verfyToken');
const validateObj = require('../middlewares/validateObj');
const photoUpload = require('../middlewares/photoUpload');
const { createCommentCntr, getAllCommentCntr, deleteCommentCntr, updateCommentCntr } = require('../controlleurs/commentControlleur');


router.route('/').post(verifyToken, createCommentCntr)
                 .get(verifyTokenAndAdmin, getAllCommentCntr)

router.route('/:id').delete(validateObj,verifyToken, deleteCommentCntr)
                    .put(validateObj,verifyToken,updateCommentCntr)
    

module.exports = router