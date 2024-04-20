
// 1 - Retrieve the utility function
import { objectShowHideHandle,
         funcReturnLogInPageHandle } from './utility.js';

const menuLogOut            = document.getElementById("menu-logout");
const buttonShowMenuLogOut  = document.getElementById("button-menu-logout");
const buttonSignOut         = document.getElementById("button-signout");
const msgCancelLogout       = document.getElementById("msg-cancel-logout");
const buttonCancelLogout    = document.getElementById("button-cancel-logout");

// Press buttonLogOut would show the MenuLogout
buttonShowMenuLogOut.addEventListener("click", (event)=>{
    objectShowHideHandle(true, menuLogOut);
});

// Press buttonSignOut really sign out, clear token and direct back to home
buttonSignOut.addEventListener("click", (event)=>{
    funcReturnLogInPageHandle();
});

// Press msgCancelLogout or buttonCancelLogout, hide back the logout menu
msgCancelLogout.addEventListener("click", (event)=>{
    objectShowHideHandle(false, menuLogOut);
});
buttonCancelLogout.addEventListener("click", (event)=>{
    objectShowHideHandle(false, menuLogOut);
});