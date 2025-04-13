const router = require('express').Router();
const authenticationMiddleware = require('../middlewares/authenticationMiddleware.js');
const { createUser, loginUser, getUserProfile, deleteUser, updateUser } = require('../controllers/userController.js');

router.post('/login', loginUser);
router.post('/register', createUser);
router.delete('/delete', authenticationMiddleware, deleteUser);
router.put('/update', authenticationMiddleware, updateUser);
router.get('/profile', authenticationMiddleware, getUserProfile);

module.exports = router;