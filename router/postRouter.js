const router = require('express').Router()
const {verifyTokenAndAdmin, 
       verifyTokenAndOnlyUser, 
       verifyToken, 
       verifyTokenAndAuthorization
    } = require('../middlewares/verfyToken');
const validateObj = require('../middlewares/validateObj');
const photoUpload = require('../middlewares/photoUpload');
const { createPostCntr, 
        getAllPostsCltr, 
        getSinglePostCltr, 
        getCountPostCltr, 
        deletePostCltr, 
        updatePostCltr, 
        updatePostImageCltr, 
        toggleLikeCntr,
    } = require('../controlleurs/postControlleur');

router.route('/count').get(getCountPostCltr)

router.route('/')
          .post(verifyToken,photoUpload.single("image"),createPostCntr)
          .get(getAllPostsCltr)

router.route('/:id')
           .get(validateObj,getSinglePostCltr)
           .delete(validateObj,verifyToken,deletePostCltr)
           .put(validateObj,verifyToken,updatePostCltr)

// /api/posts/update-image/:id
router.route('/update-image/:id').put(validateObj,verifyToken,photoUpload.single("image"),updatePostImageCltr)

// count posts
///api/posts/count
// /api/posts/like/:id
router.route('/like/:id').put(validateObj,verifyToken,toggleLikeCntr)




module.exports = router