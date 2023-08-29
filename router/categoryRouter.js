const router = require('express').Router()
const { verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyToken,
    verifyTokenAndAuthorization
} = require('../middlewares/verfyToken');
const validateObj = require('../middlewares/validateObj');
const { createCategoryCntr, getAllCategoriesCntr, deleteCategoriyCntr} = require('../controlleurs/categoryControlleur');

router.route('/')
         .post(verifyTokenAndAdmin,createCategoryCntr)
         .get(getAllCategoriesCntr)

router.route('/:id')
          .delete(validateObj,verifyTokenAndAdmin,deleteCategoriyCntr)

module.exports = router