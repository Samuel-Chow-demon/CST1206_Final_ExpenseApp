import {PORT, API_USER_URL, API_EXPENSE_URL} from "./browser_constant.js";
import { objectShowHideHandle, 
         objectLockUnlockHandle,
         GetAvailableIconInfo,
         eACTION, eDISPLAY,
         funcDisplayStatus,
         funcReturnLogInPageHandle } from './utility.js';
import { checkIfUserLoggedInValid } from './homeCheckToken.js';

const ICON_MODIFY_DOWN = "fa-angles-down";
const ICON_MODIFY_UP   = "fa-angles-up";

// Get the Icon Object from "./utility.js"
const iconInfoObj = await GetAvailableIconInfo();
const arrAllAvailIcon = iconInfoObj.arrAllIcon;
const ICON_CLASS_LARGE_SIZE  = iconInfoObj.size.large;
const USER_CATEGORY_NAME_KEY = "data-category-name";
const REMOVE_BUTTON_IDENTIFIER_CLASS = "remove-category";


const inputNameModify   = document.getElementById("input-name-modify");
const inputEmailModify  = document.getElementById("input-email-modify");
const inputOldPassword  = document.getElementById("input-password-old");
const inputNewPassword  = document.getElementById("input-password-new");

const iconModifyPSbutton = document.getElementById("icon-password-modify-button");

const menuChangePassword = document.getElementById("menu-change-password");
const buttonShowChangePSMenu = document.getElementById("button-show-change-password-menu");

const menuModifyOKCancelName = document.getElementById("menu-modify-ok-cancel-name");
const buttonAllowModifyName  = document.getElementById("button-allow-modify-name");
const buttonModifyOKName     = document.getElementById("button-modify-ok-name");
const buttonModifyCancelName = document.getElementById("button-modify-cancel-name");

const menuModifyOKCancelEmail = document.getElementById("menu-modify-ok-cancel-email");
const buttonAllowModifyEmail  = document.getElementById("button-allow-modify-email");
const buttonModifyOKEmail     = document.getElementById("button-modify-ok-email");
const buttonModifyCancelEmail = document.getElementById("button-modify-cancel-email");

const buttonProceedInfoChange       = document.getElementById("button-proceed-info-change");
const menuConfirmInfoChange         = document.getElementById("menu-confirm-info-change");
const buttonCloseInfoChangeMenu     = document.getElementById("button-cancel-info-change");
const dispInfoChanges               = document.getElementById("disp-info-changes");
const buttonConfirmInfoChange       = document.getElementById("button-confirm-info-change");

const dispInfoChangesStatus         = document.getElementById("disp-info-update-status");
const buttonInfoChangeFinished      = document.getElementById("button-info-change-fin");

const tableUserCategory             = document.getElementById("table-user-category");
const buttonResetCateogyTable       = document.getElementById("button-reset-category-table");

const eINFO_ITEM = {
    name : "Name",
    email : "Email",
    password : "Password",
    category : "Category"
}

let handleModifyObj = {
    origName : "",
    origEmail : "",
    origCategoryUse : [],
    modCategoryUse : []
}

async function initAccountProfilePage()
{
    /* return {
        valid,
        loginUserJSON,
        message
        };
    */
   /*
        loginUserJSON.data = {
            _id
            name,
            email,
            password,
            categoryUse : [{}],
            token,
            createdAt,
            updatedAt
        }
   */
    // Would auto sign out if check user token invalid
    const retObj = await checkIfUserLoggedInValid();

    if (retObj.valid)
    {
        const userInfoObj = retObj.loginUserJSON.data;
        const userName = userInfoObj.name;
        const userEmail = userInfoObj.email;
        const userCategoryUse = userInfoObj.categoryUse;

        inputNameModify.value = userName;
        inputEmailModify.value = userEmail;
        inputOldPassword.value = "";
        inputNewPassword.value = "";

        handleModifyObj.origName = userName;
        handleModifyObj.origEmail = userEmail;
        handleModifyObj.origCategoryUse = userCategoryUse;
        handleModifyObj.modCategoryUse = userCategoryUse;

        if (userInfoObj.guest)
        {
            inputNameModify.disabled = true;
            inputEmailModify.disabled = true;
            buttonAllowModifyName.disabled = true;
            buttonAllowModifyEmail.disabled = true;

            inputOldPassword.disabled = true;
            inputNewPassword.disabled = true;
        }

        generateUserCategoryTable(handleModifyObj.modCategoryUse);
    }
    else
    {
        inputNameModify.value = "";
        inputEmailModify.value = "";
        inputOldPassword.value = "";
        inputNewPassword.value = "";
    }
}

function checkIfCategoryModified()
{
    let list1 = handleModifyObj.origCategoryUse;
    let list2 = handleModifyObj.modCategoryUse;

    let differenceCategory = [];

    for (const obj1 of list1) 
    {
        // Check if objcat exists in list2
        const existsInList2 = list2.some(obj2 => obj2.name === obj1.name);

        if (!existsInList2) {
            differenceCategory.push(obj1.name);
        }
    } 
    

    // list1.sort((a, b) => a.name < b.name);
    // list2.sort((a, b) => a.name < b.name);

    // // Compare each object in the lists
    // for (let i = 0; i < list1.length; i++) {
    //     const obj1 = list1[i];
    //     const obj2 = list2[i];

    //     // Check if the properties of the objects are identical
    //     if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
    //         return false;
    //     }
    // }

    return differenceCategory;
}

function createOneCategoryUseRow(categoryUseObj)
{
    /*
    [
        {iconId,
        name}
    ]
    */
    let iconObjStr = "";

    const iconId    = categoryUseObj.iconId;
    const category  = categoryUseObj.name;
   
    if (arrAllAvailIcon)
    {
        const iconObj = arrAllAvailIcon.find((eachIcon)=>eachIcon._id === iconId);

        if (iconObj)
        {
            iconObjStr = `<i class="${iconObj.twCSS} ${ICON_CLASS_LARGE_SIZE} col-start-1 col-span-1 flex flex-col justify-center items-center" style="color: #1b3f7c;"></i>`
        }
    }

    const row = `<tr class="bg-gray-700 border-b dark:bg-gray-200 dark:border-gray-700 text-gray-900 font-medium text-sm">
                    <th scope="row" class="px-6 py-3 text-center whitespace-nowrap">
                        ${iconObjStr}
                    </th>
                    <td class="px-6 py-3 text-center whitespace-nowrap">
                        ${category}
                    </td>
                    <td class="px-6 py-3 text-center whitespace-nowrap">
                        <a href="#" ${USER_CATEGORY_NAME_KEY}=${category} class="${REMOVE_BUTTON_IDENTIFIER_CLASS} hover:text-red-700 hover:text-base">Remove</a>
                    </td>
                </tr>`;
    return row;
}

function removeAllRemoveButtonEventListener()
{
    // class "remove-button"
    const allRemoveButtons = document.querySelectorAll(`.${REMOVE_BUTTON_IDENTIFIER_CLASS}`);

    if (allRemoveButtons)
    {
        // Remove event listeners for each element
        allRemoveButtons.forEach(button => {
            const clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);
        });
    }
}

function createCategoryRemoveEventListener()
{
    const allRemoveCategoryDOM = document.querySelectorAll(`.${REMOVE_BUTTON_IDENTIFIER_CLASS}`);

    for (const eachRemoveDOM of allRemoveCategoryDOM)
    {
        eachRemoveDOM.addEventListener("click", (event)=>{
            const selectedCategory = event.target.getAttribute(USER_CATEGORY_NAME_KEY);

            handleModifyObj.modCategoryUse = handleModifyObj.modCategoryUse.filter(catObj=>catObj.name != selectedCategory);

            generateUserCategoryTable(handleModifyObj.modCategoryUse);
        });
    }

}

async function generateUserCategoryTable(arrCategoryUse)
{
    let allUserCategoryHTML = "";

     // Clear all previous created Remove expense button event listener
     removeAllRemoveButtonEventListener();

    for (const eachCATObj of arrCategoryUse)
    {
        allUserCategoryHTML += createOneCategoryUseRow(eachCATObj);
    }
    tableUserCategory.innerHTML = allUserCategoryHTML;
    // Wait for the next browser repaint using requestAnimationFrame, ensure the new remove object class existed
    await new Promise(resolve => requestAnimationFrame(resolve));

    createCategoryRemoveEventListener()
}

function proceedInfoChangeCheckEntry()
{
    let warn = "";
    let listChangeItems = [];

    if (!inputNameModify.value)
    {
        warn += "Name Cannot Empty";
    }
    else
    {
        if (inputNameModify.value != handleModifyObj.origName)
        {
            listChangeItems.push({
                name : eINFO_ITEM.name,
                old : handleModifyObj.origName,
                new : inputNameModify.value
            });
        }
    }

    if (!inputEmailModify.value)
    {
        warn += "Email Cannot Empty";
    }
    else
    {
        if (inputEmailModify.value != handleModifyObj.origEmail)
        {
            listChangeItems.push({
                name : eINFO_ITEM.email,
                old : handleModifyObj.origEmail,
                new : inputEmailModify.value
            });
        }
    }

    if ((inputNewPassword.value && !inputOldPassword.value) ||
        (inputOldPassword.value && !inputNewPassword.value))
    {
        warn += "Modify Password Requires Both Values";
    }
    else
    {
        if (inputNewPassword.value != "")
        {
            listChangeItems.push({
                name : eINFO_ITEM.password,
                old : "************",
                new : "New Password"
            });
        }
    }

    const diffCategory = checkIfCategoryModified();
    if (diffCategory.length > 0)
    {
        listChangeItems.push({
            name : `${eINFO_ITEM.category} (Would <span class="inline text-red-700 mx-2"> NOT </span> change PREV expense record)`,
            old : `${diffCategory.join(', ')}`,
            new : `Removed`
        });
    }

    if (!warn)
    {
        if (!listChangeItems.length)
        {
            warn = "No Info Changed";
        }   
    }

    return {
        warn,
        listChangeItems
    };
}
 
function createInfoChangesRowHTML(itemName, oldValue, NewValue)
{
    const changeInfoHTML = `
    <label class="block col-start-1 col-span-7 text-xl font-medium leading-6 text-gray-900 m-2 mt-4 text-center border-b-2 border-gray-400 flex justify-center items-center h-10 overflow-visible">${itemName}</label>
    <span class="block col-start-1 col-span-3 text-lg font-medium leading-6 text-gray-900 m-2 text-center bg-gray-100 rounded-md flex flex-col justify-center h-10">${oldValue}</span>
    <div class="col-start-4 col-span-1 flex flex-col justify-center items-center mt-2"><i class="fa-solid fa-arrow-right-long fa-xl" style="color: #848991;"></i></div>
    <span class="block col-start-5 col-span-3 text-lg font-medium leading-6 text-gray-900 m-2 text-center bg-gray-100 rounded-md flex flex-col justify-center h-10 text-red-700">${NewValue}</span>`;

    return changeInfoHTML;
}

function proceedChanges()
{
    funcDisplayStatus(dispInfoChangesStatus, eDISPLAY.HIDE, eACTION.USER_INFO_UPDATE, "");

    const checkChangeObj = proceedInfoChangeCheckEntry();

    dispInfoChanges.innerHTML = "";

    if (checkChangeObj.warn != "")
    {
        alert(checkChangeObj.warn);
    }
    else
    {
        let allItemChangesHTML = "";
        for (const eachItem of checkChangeObj.listChangeItems)
        {
            /*
            name : eINFO_ITEM.password,
            old : "************"
            new : "New Password"
            */

            allItemChangesHTML += createInfoChangesRowHTML(eachItem.name, eachItem.old, eachItem.new)
        }
        dispInfoChanges.innerHTML = allItemChangesHTML;

        objectShowHideHandle(true, menuConfirmInfoChange);
    }
}

// Set Create Expense Record Event
async function updateAccoutUserInfo(event)
{
    const userObj = await checkIfUserLoggedInValid();

    if (userObj.valid)
    {
        let flagIsUpdateSuccess = false;
        
        const userID        = userObj.loginUserJSON.data._id;
        const updateName    = inputNameModify.value;
        const updateEmail   = inputEmailModify.value;
        const updateOldPS   = inputOldPassword.value;
        const updateNewPS   = inputNewPassword.value;
        const updateCategory = handleModifyObj.modCategoryUse;

        /*{
            id : Account_Object_id,
            name : accName,                 // can be set as null for not to update
            email : accEmail,               // can be set as null for not to update
            oldpassword : accOrigPassword
            password : accPassword,         // can be set as null for not to update
            catUse : categoryUse
        }*/
        const updateUserInfoObj = {
            id : userID,
            name : updateName,
            email : updateEmail,
            oldpassword : updateOldPS,
            password : updateNewPS,
            catUse : updateCategory
        };

        // Disable and Hide the Confirm and Close Button First
        objectShowHideHandle(false, buttonConfirmInfoChange);
        objectShowHideHandle(false, buttonCloseInfoChangeMenu);
        objectLockUnlockHandle(true, buttonConfirmInfoChange);
        objectLockUnlockHandle(true, buttonCloseInfoChangeMenu);


        funcDisplayStatus(dispInfoChangesStatus, eDISPLAY.LOADING, eACTION.USER_INFO_UPDATE, "");
        // Wait for the next browser repaint using requestAnimationFrame
        await new Promise(resolve => requestAnimationFrame(resolve));

        try {
            const updatedUser = await fetch(`${API_USER_URL}/account`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateUserInfoObj)
            });
    
            const updatedUserJSON = await updatedUser.json();

            //console.log(updatedUserJSON);

            // Update User Info Success
            if (updatedUserJSON)
            {
                if (updatedUser.status === 200)
                {
                    //updatedUserJSON
                    /*
                    message : "Update User Info Success",
                    data : {
                        id : userUpdated._id,
                        newUserInfo : userUpdated
                    }*/

                    const messageSuccess = `${updatedUserJSON.message}<br>Press OK to Login Again.`;

                    funcDisplayStatus(dispInfoChangesStatus, eDISPLAY.GOOD, eACTION.USER_INFO_UPDATE, messageSuccess);
                    // Wait for the next browser repaint using requestAnimationFrame
                    await new Promise(resolve => requestAnimationFrame(resolve));

                    flagIsUpdateSuccess = true;

                    // Here Display the OK button for Logout
                    objectShowHideHandle(true, buttonInfoChangeFinished);
                }
                else
                {
                    funcDisplayStatus(dispInfoChangesStatus, eDISPLAY.FAIL, eACTION.USER_INFO_UPDATE, `<br>${updatedUserJSON.message}`);
                    // Wait for the next browser repaint using requestAnimationFrame
                    await new Promise(resolve => requestAnimationFrame(resolve));
                }
            }
            else
            {
                //alert(`Wait Update User Info Fail`);

                funcDisplayStatus(dispInfoChangesStatus, eDISPLAY.FAIL, eACTION.USER_INFO_UPDATE, `<br>Wait Update User Info Fail`);
                // Wait for the next browser repaint using requestAnimationFrame
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
        }
        catch(error)
        {
            //alert(`Error : ${error}`);
            funcDisplayStatus(dispInfoChangesStatus, eDISPLAY.FAIL, eACTION.USER_INFO_UPDATE, `<br>Server Error : ${error}`);
        }

        // If not update success enable and display back the confirm and close button
        if (!flagIsUpdateSuccess)
        {
            objectShowHideHandle(true, buttonConfirmInfoChange);
            objectShowHideHandle(true, buttonCloseInfoChangeMenu);
            objectLockUnlockHandle(false, buttonConfirmInfoChange);
            objectLockUnlockHandle(false, buttonCloseInfoChangeMenu);
        }
    }
};



// **************************************** Implementation ******************************************** //

buttonShowChangePSMenu.addEventListener("click", (event)=>{

    if (iconModifyPSbutton.classList.contains(ICON_MODIFY_DOWN))
    {
        iconModifyPSbutton.classList.toggle(ICON_MODIFY_DOWN);
        iconModifyPSbutton.classList.add(ICON_MODIFY_UP);
    }
    else if (iconModifyPSbutton.classList.contains(ICON_MODIFY_UP))
    {
        iconModifyPSbutton.classList.toggle(ICON_MODIFY_UP);
        iconModifyPSbutton.classList.add(ICON_MODIFY_DOWN);
    }
    menuChangePassword.classList.toggle("hidden");
});

// For Name Modify
buttonAllowModifyName.addEventListener("click", (event)=>{

    objectLockUnlockHandle(false, inputNameModify, ()=>{

        if (buttonAllowModifyName.disabled)
        {
            return;
        }

        inputNameModify.focus();
        buttonAllowModifyName.classList.toggle("hidden");
        menuModifyOKCancelName.classList.toggle("hidden");
    });
});
buttonModifyOKName.addEventListener("click", (event)=>{

    objectLockUnlockHandle(true, inputNameModify, null, ()=>{
        buttonAllowModifyName.classList.toggle("hidden");
        menuModifyOKCancelName.classList.toggle("hidden");
    });
});
buttonModifyCancelName.addEventListener("click", (event)=>{

    objectLockUnlockHandle(true, inputNameModify, null, ()=>{

        inputNameModify.value = handleModifyObj.origName;

        buttonAllowModifyName.classList.toggle("hidden");
        menuModifyOKCancelName.classList.toggle("hidden");
    });
});

// For Email Modify
buttonAllowModifyEmail.addEventListener("click", (event)=>{

    objectLockUnlockHandle(false, inputEmailModify, ()=>{

        if (buttonAllowModifyEmail.disabled)
        {
            return;
        }

        inputEmailModify.focus();
        buttonAllowModifyEmail.classList.toggle("hidden");
        menuModifyOKCancelEmail.classList.toggle("hidden");
    });
});
buttonModifyOKEmail.addEventListener("click", (event)=>{

    objectLockUnlockHandle(true, inputEmailModify, null, ()=>{
        buttonAllowModifyEmail.classList.toggle("hidden");
        menuModifyOKCancelEmail.classList.toggle("hidden");
    });
});
buttonModifyCancelEmail.addEventListener("click", (event)=>{

    objectLockUnlockHandle(true, inputEmailModify, null, ()=>{

        inputEmailModify.value = handleModifyObj.origEmail;

        buttonAllowModifyEmail.classList.toggle("hidden");
        menuModifyOKCancelEmail.classList.toggle("hidden");
    });
});

buttonProceedInfoChange.addEventListener("click", (event)=>{
    proceedChanges();
});
buttonCloseInfoChangeMenu.addEventListener("click", (event)=>{
    objectShowHideHandle(false, menuConfirmInfoChange);
});

buttonConfirmInfoChange.addEventListener("click", (event)=>{
    updateAccoutUserInfo();
});
buttonInfoChangeFinished.addEventListener("click", (event)=>{
    funcReturnLogInPageHandle();
});

buttonResetCateogyTable.addEventListener("click", (event)=>{
    handleModifyObj.modCategoryUse = handleModifyObj.origCategoryUse;
    generateUserCategoryTable(handleModifyObj.origCategoryUse);
})



await initAccountProfilePage();








