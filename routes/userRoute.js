const express = require('express');
const Router = express.Router();
const userController = require('../controllers/userController');

// ------------------------- POST 
// Sign up API
Router.post('/register', userController.RegisterUser);

// Login API
Router.post('/login', userController.UserLogIn);

// Update User Category By ID
Router.post('/category', userController.UpdateUserCatByID);

// Modify User Info By ID
Router.post('/account', userController.ModifyUserInfoByID);

// -------------------------- GET
// Get All Users API
Router.get('/all', userController.GetAllUsers);

// Get Particular User API
Router.get('/:id', userController.GetUserByID);

module.exports = Router;