// 0 - Use the .env File
require('dotenv').config();

// 1 - Define the const
const CONST_VAL       = require('./module_constant');
const PORT            = CONST_VAL.PORT; 
const API_USER_URL    = CONST_VAL.API_USER_URL;
const API_EXPENSE_URL = CONST_VAL.API_EXPENSE_URL;

// 2 - Retreive the node modules
const express           = require('express');
const mongoose          = require('mongoose');
const path              = require('path');
const app               = express();
const userRoutes        = require('./routes/userRoute');
const expenseRoutes     = require('./routes/expenseRoute');

// 3 - Connect to Database
mongoose
  .connect(process.env.MONGODB_EXPENSE_APP_URL)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.log(`Error connecting to the database: ${error}`);
  });

// 4 - Configure the app uses
// Configure express use json format
app.use(express.json());

// 5 - Develop the API
app.use(`${API_USER_URL}`, userRoutes);         // Log In Process
app.use(`${API_EXPENSE_URL}`, expenseRoutes);   // Expense Document Process

// 6 - Home Page
// This will allow you to host your frontend files on the server, that is the localhost:5500/ would run the html file in the fronend folder
// After deployed by render, it would run by DEPLOYED_HOME_URL configured in the browser_constant.js
app.use(express.static(path.join(__dirname, 'frontend')));

// app.get('/', (req, res)=>{
//     res.send('EXPENSE APP END');
// })

// 7 - Start Server
app.listen(PORT, ()=>{
    console.log(`Server Running, PORT : ${PORT}`);
});