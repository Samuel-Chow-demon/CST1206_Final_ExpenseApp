const express = require('express');
const Router = express.Router();
const expenseController = require('../controllers/expenseController');

// -------------------------------- POST 
// Create New Expense Document
Router.post('/create', expenseController.AddNewExpense);

// -------------------------------- GET
// Get All category icon API
Router.get('/icon/all', expenseController.GetAllIcons);

// Get Condition Matched Expense Documents
Router.get('/documents/:id/:year/:month/:start/:pagesize', expenseController.GetAllMatchedExpense);
// Get All Expense by account user id
Router.get('/all/:id/:start/:pagesize', expenseController.GetAllExpense);

// --------------------------------- DELETE
// Delete the Expense Document by its _id
Router.delete('/delete/:expense_id', expenseController.RemoveExpenseByID);


module.exports = Router;