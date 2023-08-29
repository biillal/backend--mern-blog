const router = require('express').Router()
const {registerUserCntr,loginUsercntr, verifyUserAccountCntr} = require('../controlleurs/authControlleur')

router.post('/register',registerUserCntr)

router.post('/login',loginUsercntr)

// verified account
router.get('/:userId/verify/:token',verifyUserAccountCntr)

module.exports = router