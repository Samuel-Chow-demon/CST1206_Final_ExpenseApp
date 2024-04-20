// 1 - Retrieve the import constant
import { PORT, API_EXPENSE_URL, DEPLOYED_HOME_URL } from './browser_constant.js';

const ICON_CLASS_LARGE_SIZE    = "fa-2xl";
const ICON_CLASS_MEDIUM_SIZE   = "fa-xl";

export const eACTION = {
    LOGIN : "Log In",
    SIGNUP : "Sign Up",
    USER_INFO_UPDATE : "User Info Update"
}

export const eDISPLAY = {
    LOADING : 0,
    GOOD : 1,
    FAIL : 2,
    HIDE : 3
}

export function funcReturnLogInPageHandle(promptMessage = "")
{
    // remove the token and email whatever if any fail
    if (localStorage.getItem('id') != null)
    {
        localStorage.removeItem('id');
    }

    if (localStorage.getItem('token') != null)
    {
        localStorage.removeItem('token');
    }

    if (promptMessage)
    {
        alert(promptMessage);
    }
    //window.location.href = `http://localhost:${PORT}`;
    window.location.href = `${DEPLOYED_HOME_URL}`;
}

export function funcDisplayStatus(displayDOMObj, eDisplay, eAction, message)
{
    if (displayDOMObj.classList.contains("hidden"))
    {
        displayDOMObj.classList.toggle("hidden");
    }

    switch (eDisplay)
    {
        case eDISPLAY.LOADING:
            displayDOMObj.innerHTML = `<div class="flex items-center justify-center mx-auto mt-10" role="status">
                                            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-300 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                            </svg>
                                            <span class="mx-5 text-lg">Loading...</span>
                                        </div>`;
            break;

        case eDISPLAY.GOOD:
            displayDOMObj.innerHTML = `<div class="w-12 h-12 rounded-full bg-green-200 dark:bg-green-200 p-2 flex items-center justify-center mx-auto mt-10">
                                            <svg aria-hidden="true" class="w-8 h-8 text-green-400 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                        </div>
                                        <h4 class="mt-2 mb-1 text-lg font-semibold text-center text-gray-500">${message}</h4>`;

            break;

        case eDISPLAY.FAIL:
            displayDOMObj.innerHTML = `<div class="flex mx-10 items-center p-4 mt-10 text-lg text-red-800 rounded-lg bg-red-50 dark:bg-white-100 dark:text-red-600" role="alert">
                                            <svg class="flex-shrink-0 inline w-5 h-5 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                            </svg>
                                            <div>
                                                <span class="font-medium">${eAction} Fail !</span> ${message} 
                                            </div>
                                        </div>`;
            break;

        case eDISPLAY.HIDE:
        default:
            displayDOMObj.innerHTML = "";
            if (!displayDOMObj.classList.contains("hidden"))
            {
                displayDOMObj.classList.toggle("hidden");
            }
            break;
    }
}

export function objectShowHideHandle(show, obj, funcCallWhenShow = null, funcCallWhenHide = null)
{
    if ((show && obj.classList.contains("hidden")) ||
        (!show && !obj.classList.contains("hidden")))
    {
        if (show && funcCallWhenShow)
        {
            funcCallWhenShow();
        }
        else if (!show && funcCallWhenHide)
        {
            funcCallWhenHide();
        }
        obj.classList.toggle("hidden");
    }
}

export function objectLockUnlockHandle(lock, obj, funcCallWhenUnlock = null, funcCallWhenLock = null)
{
    if ((lock && !obj.classList.contains("pointer-events-none")) ||
        (!lock && obj.classList.contains("pointer-events-none")))
    {
        obj.classList.toggle("pointer-events-none");

        if (lock && funcCallWhenLock)
        {
            funcCallWhenLock();
        }
        else if (!lock && funcCallWhenUnlock)
        {
            funcCallWhenUnlock();
        }
    }
}

export async function GetAvailableIconInfo()
{
    try {
        const allIcons = await fetch(`${API_EXPENSE_URL}/icon/all`);

        const allIconsJSON = await allIcons.json();

        return {
            arrAllIcon : allIconsJSON.data,
            size : {
                large : ICON_CLASS_LARGE_SIZE,
                medium : ICON_CLASS_MEDIUM_SIZE
            }
        };
    } catch (error) {
        return {
            arrAllIcon : [],
            error : error,
            size : {
                large : ICON_CLASS_LARGE_SIZE,
                medium : ICON_CLASS_MEDIUM_SIZE
            }
        };
    }
}