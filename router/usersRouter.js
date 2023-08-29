const router = require('express').Router()
const {getAllUsersCntr, getUserCntr,updateUserCntr, getCountUserCntr, profilePhotoUploadCntr, deleteUserProfileCntr} = require('../controlleurs/usersControlleur');
const {verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization} = require('../middlewares/verfyToken');
const validateObj = require('../middlewares/validateObj');
const photoUpload = require('../middlewares/photoUpload');
router.route('/profile').get(verifyTokenAndAdmin,getAllUsersCntr)
router.route('/profile/:id')
        .get(validateObj,getUserCntr)
        .put(validateObj,verifyTokenAndOnlyUser,updateUserCntr)
        .delete(validateObj,verifyTokenAndAuthorization,deleteUserProfileCntr)

//api/users/count
router.route('/count').get(verifyTokenAndAdmin,getCountUserCntr)

//api/users/profile/profile-photo-upload
router.route('/profile/profile-photo-upload')
        .post(verifyToken,photoUpload.single("image"),profilePhotoUploadCntr)

module.exports = router