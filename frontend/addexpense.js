
// 1 - Retrieve the const and utiltiy function
import {PORT, API_USER_URL, API_EXPENSE_URL} from "./browser_constant.js";
import { objectShowHideHandle,
         GetAvailableIconInfo } from './utility.js';
import { checkIfUserLoggedInValid } from './homeCheckToken.js';
import { refreshTableDisplayAfterAddNewExpense } from './dashboard.js';

// Get the Icon Object from "./utility.js"
const iconInfoObj = await GetAvailableIconInfo();
const arrAllAvailIcon = iconInfoObj.arrAllIcon;
const ICON_CLASS_LARGE_SIZE  = iconInfoObj.size.large;

const ICON_CLASS_DEFAULT = "fa-solid fa-user-plus fa-beat " + ICON_CLASS_LARGE_SIZE;
const ICON_ID_ATTRIB_KEY = "data-iconID";

const CATEGORY_DEFAULT_VAL = "Select A Category"
const categoryOptionDefaultHTML = `<option value="" disabled selected>${CATEGORY_DEFAULT_VAL}</option>`;


// Expense Menu
const menuExpense            = document.getElementById("menu-add-expense");
const buttonShowMenuExpense  = document.getElementById("button-menu-expense");
const buttonCancelAddExpense = document.getElementById("button-cancel-add-expense");
const buttonAddExpenseRec    = document.getElementById("button-add-expense-record");

// For expense document record
const inputAddIcon  = document.getElementById("input-add-icon");
const inputCost     = document.getElementById("input-cost");
const inputDate     = document.getElementById("input-date");
const inputTime     = document.getElementById("input-time");
const inputCAT      = document.getElementById("input-category");
const inputReceiver = document.getElementById("input-receiver");
const inputDescription = document.getElementById("input-description");

// For modal New Category Menu
const modalNewCategory          = document.getElementById("new-category-modal");
const formNewCategory           = document.getElementById("new-category-form");
const inputNewCAT               = document.getElementById("input-new-category");
const buttonAddCATMenu          = document.getElementById("button-add-category-menu");
const buttonCancelAddCategory   = document.getElementById("button-cancel-add-category");
const buttonAddIcon             = document.getElementById("button-add-icon");

// For modal Add Icon Menu
const modalAddIcon              = document.getElementById("add-icon-modal");
const buttonCancelAddIcon       = document.getElementById("button-cancel-add-icon");
const gridShowAvailIcon         = document.getElementById("show-avail-icon-grid");

// Processing Variable
var bEverAddNewCategory = false;
var currUserCategory = [{}];

// ********************************************************** Function Declaration *************************************************************//
function resetAllExpenseEntry()
{
    // reset inputAddIcon to class ICON_CLASS_DEFAULT, id = null
    updateExpenseSelectedIcon(ICON_CLASS_DEFAULT, null);
    inputCost.value = "";

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // since months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    //const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    // Format the date as yyyy-mm-dd
    const formattedDate = `${year}-${month}-${day}`;
    inputDate.value = formattedDate;

    // Format the time as hh:mm
    //const formattedTime = `${hours}:${minutes}:${seconds}`;
    const formattedTime = `${hours}:${minutes}`;
    inputTime.value = formattedTime;

    inputCAT.value = "";
    inputReceiver.value = "";
    inputDescription.value = "";
}

function updateCurUserCategory(categoryName, iconIDValue)
{
    let catAlreadyExisted = currUserCategory.find(catObj=>catObj.name === categoryName);

    if (catAlreadyExisted)
    {
        catAlreadyExisted.iconId = iconIDValue ? iconIDValue : "";
    }
    // if not exist, push to add new
    else
    {
        currUserCategory.push({
            iconId : iconIDValue ? iconIDValue : "",
            name : categoryName
        });
    }
}

// categoryUse : [{
//     iconId : {type: mongoose.Schema.Types.ObjectId, ref: 'categoryIcon'},
//     name : {type: String, required : true, unique: true}
// }]
function updateAddExpenseCategoryOption(categoryListObj)
{
    inputCAT.innerHTML = categoryOptionDefaultHTML;

    for (const catObj of categoryListObj)
    {
        inputCAT.innerHTML += `<option>${catObj.name}</option>`;
    }
}

async function getUserCategory()
{
    // Clear first
    currUserCategory.length = 0;

    const retObj = await checkIfUserLoggedInValid();

    if (retObj.valid)
    {
        currUserCategory = retObj.loginUserJSON.data.categoryUse;
        updateAddExpenseCategoryOption(currUserCategory);
    }
}

function setUpAllAvailableIconsMenu()
{
    if (arrAllAvailIcon)
    {
        gridShowAvailIcon.innerHTML = "";

        for (const eachIconObj of arrAllAvailIcon)
        {
            gridShowAvailIcon.innerHTML += `<div ${ICON_ID_ATTRIB_KEY}="${eachIconObj._id}" class="h-16 w-16 bg-gray-300 flex flex-col justify-center items-center m-2 rounded-lg hover:bg-sky-400">
                                                <i class="${eachIconObj.twCSS} ${ICON_CLASS_LARGE_SIZE}"></i>
                                            </div>`;
        }
    }
    else
    {
        console.log(`Retrieve Available Icon Error : ${iconInfoObj.error}`)
    }
}

function updateExpenseSelectedIcon(iconClassCSS, iconID)
{
    // Set the selected icon Class to the Expense Menu icon obj class
    inputAddIcon.className = iconClassCSS;

    // Also set the icon id as attribute to the Expense Menu icon obj
    inputAddIcon.setAttribute(ICON_ID_ATTRIB_KEY, iconID);
}

function setAllAvailIconEvent()
{
    const arrAllIconDivObj = gridShowAvailIcon.querySelectorAll("div");

    for (const iconDivDOM of arrAllIconDivObj)
    {
        iconDivDOM.addEventListener("click", (event)=>{

            // Assume the event is trigger by the parent div
            let iconDivObj = event.target;
            let iconObj = iconDivObj.querySelector("i");

            // If it is trigger the child proporgation, event.target is child <i> object
            if (event.target != iconDivDOM)
            {
                iconObj = event.target;
                iconDivObj = iconObj.parentNode;
            }

            const iconID = iconDivObj.getAttribute(ICON_ID_ATTRIB_KEY);
            updateExpenseSelectedIcon(iconObj.className, iconID);

            // If already select the icon before select the category
            // then update the category with the id
            if (inputCAT.value &&
                inputCAT.value != CATEGORY_DEFAULT_VAL)
            {
                updateCurUserCategory(inputCAT.value, iconID);
            }

            // Exit the Select icon modal
            objectShowHideHandle(false, modalAddIcon);

            //console.log(currUserCategory);
        });
    }
}

function checkAddExpenseRecValidity()
{
    let warnStr = "";
    if (!inputCost.value)
    {
        warnStr += "Cost";
    }
    if (!inputDate.value)
    {
        warnStr += (warnStr ? "," : "");
        warnStr += "Date"
    }
    if (!inputTime.value)
    {
        warnStr += (warnStr ? "," : "");
        warnStr += "Time"
    }
    if (!inputCAT.value || inputCAT.value === CATEGORY_DEFAULT_VAL)
    {
        warnStr += (warnStr ? "," : "");
        warnStr += "Category"
    }
    if (!inputReceiver.value)
    {
        warnStr += (warnStr ? "," : "");
        warnStr += "Receiver"
    }

    return warnStr;
}

// Set Create Expense Record Event
async function createExpenseRecord(event)
{
    const userObj = await checkIfUserLoggedInValid();

    if (userObj.valid)
    {
        // 1 - Update User Category
        const userID        = userObj.loginUserJSON.data._id;
        const iconIDStr     = inputAddIcon.getAttribute(ICON_ID_ATTRIB_KEY);
        const categoryName  = inputCAT.value;

        /*{
            id : Account_Object_id,
            iconId : iconIDValue
            catName : categoryName}
        }*/
        const updateCATObj = {
            id : userID,
            iconId : iconIDStr,
            catName : categoryName
        };

        //console.log(updateCATObj);

        try {
            const updatedUser = await fetch(`${API_USER_URL}/category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateCATObj)
            });
    
            const updatedUserJSON = await updatedUser.json();

            //console.log(updatedUserJSON);

            // Update Category Success
            if (updatedUserJSON &&
                updatedUser.status === 200)
            {
                // 2 - Create Expense Document
                const receiverName       = inputReceiver.value;
                const descriptionContent = inputDescription.value;
                const costValue          = inputCost.value;

                const dateTimeString     = `${inputDate.value}T${inputTime.value}`;
                const dateObj            = new Date(dateTimeString);

                // Convert UTC Date object to the Browser Time Zone
                const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const options = { timeZone: userTimeZone, hour12: false };
                const dateTimeMongoose = dateObj.toLocaleString('en-US', options);

                /*
                {
                    id : Account_Object_id,
                    iconId
                    category,       : require
                    receiver,       : require
                    description,
                    cost,           : require, can be 0
                    date            : require
                }
                */
                const createExpenseObj = {
                    id : userID,
                    iconId : iconIDStr,
                    category : categoryName,
                    receiver : receiverName,
                    description : descriptionContent,
                    cost : costValue,
                    date : dateTimeMongoose
                };

                const createdExpense = await fetch(`${API_EXPENSE_URL}/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(createExpenseObj)
                })

                const createdExpenseJSON = await createdExpense.json();

                if (!createdExpenseJSON ||
                    createdExpense.status != 201)
                {
                    if (createdExpenseJSON)
                    {
                        alert(`${createdExpenseJSON.message}`);
                    }
                    else
                    {
                        alert(`Wait Create New Expense Document Fail`);
                    }
                    return;
                }
                else
                {
                    // All Good to close the Expense Menu
                    objectShowHideHandle(false, menuExpense);

                    // Then refresh the DashBoard Table
                    refreshTableDisplayAfterAddNewExpense();
                }
            }
            else
            {
                if (updatedUserJSON)
                {
                    alert(`${updatedUserJSON.message}`);
                }
                else
                {
                    alert(`Wait Update Category Fail`);
                }
                return;
            }
        }
        catch(error)
        {
            alert(`Error : ${error}`);
        }
    }
};




// ********************************************************** Implementation *************************************************************//

// Setup All Available Icon for Selection Menu, and set each icon select event
setUpAllAvailableIconsMenu();
setAllAvailIconEvent();

// Press button "Add Expense" would show the MenuExpense
buttonShowMenuExpense.addEventListener("click", (event)=>{
    bEverAddNewCategory = false;
    objectShowHideHandle(true, menuExpense, resetAllExpenseEntry);
    getUserCategory();
});
// Press "Cross" icon  hide back the Expense menu
buttonCancelAddExpense.addEventListener("click", (event)=>{

    var bConfirmExit = true;
    if (bEverAddNewCategory)
    {
        bConfirmExit = confirm("Sure To Cancel ? New Added Category Would Not Be Stored\nUnless New Expense Created.");
    }

    if (bConfirmExit)
    {
        objectShowHideHandle(false, menuExpense);
    }
});

buttonAddIcon.addEventListener("click", (event)=>{
    objectShowHideHandle(true, modalAddIcon);
});

buttonCancelAddIcon.addEventListener("click", (event)=>{
    objectShowHideHandle(false, modalAddIcon);
});

buttonAddCATMenu.addEventListener("click", (event)=>{
    objectShowHideHandle(true, modalNewCategory);
});
buttonCancelAddCategory.addEventListener("click", (event)=>{
    objectShowHideHandle(false, modalNewCategory);
});

// When Add New Category
formNewCategory.addEventListener("submit", (event)=>{

    event.preventDefault();
    if (!inputNewCAT.value)
    {
        alert("Empty Content Detected!");
    }
    else
    {
        const newCategoryName = inputNewCAT.value;
        const catAlreadyExisted = currUserCategory.find(catObj=>catObj.name === newCategoryName);
        if (catAlreadyExisted)
        {
            alert(`Category ${newCategoryName} Already Existed!`);
        }
        else
        {
            updateCurUserCategory(newCategoryName, null);
            updateAddExpenseCategoryOption(currUserCategory);
            objectShowHideHandle(false, modalNewCategory);
            bEverAddNewCategory = true;

            //console.log(currUserCategory);
        }
    }
});

// When category selected, check and update the icon if necessary
inputCAT.addEventListener("change", (event)=>{

    const categorySelected = event.target.value;

    const userCATObj = currUserCategory.find((eachCATObj)=>eachCATObj.name === categorySelected);

    // default is the current Selected Icon, if not yet selected, it should be ICON_CLASS_DEFAULT, id = null
    let iconClassCSS = inputAddIcon.className;
    let iconID = inputAddIcon.getAttribute(ICON_ID_ATTRIB_KEY);

    //console.log(iconClassCSS, iconID);
    if (userCATObj && userCATObj.iconId)
    {
        const userIconFound = arrAllAvailIcon.find((eachIconObj)=>eachIconObj._id === userCATObj.iconId);

        if (userIconFound)
        {
            iconClassCSS = `${userIconFound.twCSS} ${ICON_CLASS_LARGE_SIZE}`;
            iconID = userCATObj.iconId;
        }
    }

    //console.log(iconClassCSS, iconID);
    updateExpenseSelectedIcon(iconClassCSS, iconID);

    updateCurUserCategory(categorySelected, iconID);

    //console.log(currUserCategory);
});

// Button Add the Expense Record
buttonAddExpenseRec.addEventListener("click", (event)=>{

    const warnStr = checkAddExpenseRecValidity();

    if (warnStr)
    {
        alert(`Please Ensure ${warnStr} Is / Are Non-Empty Or Selected`);
    }
    else
    {
        createExpenseRecord(event);
    }

});