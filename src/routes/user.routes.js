const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/authentication.controller');

//Alle routes
//UC-201
router.post('', userController.createUser);

//UC-202
router.get('', userController.getAllUsers);

//UC-203
router.get('/profile',  authController.validateToken, userController.getUserProfile);

//UC-204
router.get('/:userId', userController.getUser);

//UC-205
router.put('/:userId', userController.updateUser);

//UC-206
router.delete('/:userId', userController.deleteUser);

module.exports = router