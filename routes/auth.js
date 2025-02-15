const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword } = require('../controllers/auth');

const router = express.Router();
const { protect } = require('../middleware/auth')
router.post('/register',register);
router.post('/forgotpassword',forgotPassword);
router.put('/resetpassword/:resettoken',resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword)
router.post('/login',login);
router.get('/me',protect, getMe);


module.exports = router;

