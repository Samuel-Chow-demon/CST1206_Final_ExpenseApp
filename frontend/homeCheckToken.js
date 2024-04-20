
// 1 - Retrieve the const
import {PORT, API_USER_URL} from './browser_constant.js';
import { funcReturnLogInPageHandle } from './utility.js';

export async function checkIfUserLoggedInValid()
{
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');

    const funcReturn = (valid, loginUserJSON, message)=>{

        return {
                valid,
                loginUserJSON,
                message
                };
    }

    if (!token || !id)
    {
        funcReturnLogInPageHandle(`User Token Not Found`);
        return funcReturn(false, null, `User Token Not Found`);
    }

    // Fetch Get to Database to check if the latest token in the database matched to client storage
    try {
        const loggedinUser = await fetch(`${API_USER_URL}/${id}`);
        
        const loginUserJSON = await loggedinUser.json();

        if (loginUserJSON)
        {
            //console.log(loginUserJSON.data.token, " ", token);
            if (token != loginUserJSON.data.token)
            {
                funcReturnLogInPageHandle(`New User Login Detected.`);
                return funcReturn(false, loginUserJSON, `New User Login Detected.`);
            }
            return funcReturn(true, loginUserJSON, ``);
        }
        else
        {
            funcReturnLogInPageHandle(`User Token Comparison Fail`);
            return funcReturn(false, null, `User Token Comparison Fail`);
        }
    }
    catch(error)
    {
        funcReturnLogInPageHandle(`User Token Comparison Error : ${error}`);
        return funcReturn(false, null, `User Token Comparison Error : ${error}`);
    }
}

// Set the login checking to when the page is initiated
// -- able for checking of Backward or Forward page action back to the home page
window.onpageshow = function(event) 
{
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
      // This condition checks if the page is being loaded from the cache (e.g., when navigating back)
      // You can add your script here to perform some checks
      checkIfUserLoggedInValid();
    }
};
