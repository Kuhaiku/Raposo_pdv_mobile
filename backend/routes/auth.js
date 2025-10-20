const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/register', register);
router.get('/verifyemail/:token', verifyEmail);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;