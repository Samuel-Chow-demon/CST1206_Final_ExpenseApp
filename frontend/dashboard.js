
// 1 - Retrieve the const and utiltiy function
import {PORT, API_USER_URL, API_EXPENSE_URL} from "./browser_constant.js";
import { objectShowHideHandle,
         GetAvailableIconInfo } from './utility.js';
import { checkIfUserLoggedInValid } from './homeCheckToken.js';

// declare a global module variable for importing value from ./utility.js
let arrAllAvailIcon = [{}];
let ICON_CLASS_LARGE_SIZE = "";

const SELECT_START_YEAR                 = 1970;
const SELECT_YEAR_DEFAULT_VAL           = "Select Year"
const yearSelectDefaultHTML             = `<option value="" disabled selected>${SELECT_YEAR_DEFAULT_VAL}</option>`;
const EXPENSE_DOC_ID_ATTRIB_KEY         = "data-expense-id";
const REMOVE_BUTTON_IDENTIFIER_CLASS    = "remove-button";
const EACH_PAGE_DISPLAY_LIMIT           = 10;
const CHART_EACH_GROUP_COLOR_RGB_CG_DIFF   = 1000;


// Dashboard
const outputBannerUserName      = document.getElementById("output-banner-username");
const outputBannerLastUpdate    = document.getElementById("output-banner-lastupdate");
const outputTableArea           = document.getElementById("output-table-area");

const inputSelectYear           = document.getElementById("input-select-year");
const inputSelectMonth          = document.getElementById("input-select-month");

const dispStartEndSelection     = document.getElementById("disp-start-end-selection");
// const dispStartDocNum           = document.getElementById("disp-start-doc-num");
// const dispEndDocNum             = document.getElementById("disp-end-doc-num");
// const dispNumOfDocs             = document.getElementById("disp-num-of-docs");

const dispMonthlyExpenseChart    = document.getElementById("chart-monthly-expense");
const dispCategoryExpenseChart   = document.getElementById("chart-category-expense");


const buttonPrevPage            = document.getElementById("button-prev-page");
const buttonNextPage            = document.getElementById("button-next-page");

let curDispDocNumObj = {
    start : 0,
    end : 0,
    total : 0
};

const SELECT_YEAR = "Year";
const SELECT_MONTH = "Month";
let curDateDropDownCondition = {
    year : false,
    month : false
}

const buttonGetAllExpense       = document.getElementById("button-get-all-expense");


// ********************************************************** Function Declaration *************************************************************//

function capitalizeEveryFirstLetter(str) 
{
    // Split the string into an array of words
    const words = str.split(' ');
    
    // Capitalize the first letter of each word
    const capitalizedWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    // Join the capitalized words back into a single string
    return capitalizedWords.join(' ');
}

function initYearMonthSelectOption() 
{
    // For Year Select
    inputSelectYear.innerHTML = yearSelectDefaultHTML;

    const dateObj = new Date();
    const currentYear = dateObj.getFullYear();
    const currentMonth = dateObj.getMonth();
   
    for (let year = currentYear; year >= SELECT_START_YEAR; year--) 
    {
        inputSelectYear.innerHTML += `<option>${year}</option>`;
    }

    inputSelectYear.addEventListener("focus", (event)=>{
        event.target.selectedIndex = 1; // always focus the current year, 0 is default disabled text
    })

    // For Month Select
    inputSelectMonth.addEventListener("focus", (event)=>{
        event.target.selectedIndex = currentMonth + 1; // always focus the current month
    })
}

async function initGetUserInfo()
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
        const userLastUpdate = userInfoObj.updatedAt;

        outputBannerUserName.innerHTML = `Welcome back, ${capitalizeEveryFirstLetter(userName)}`;

        const dateObj = new Date(userLastUpdate);
        const formattedDate = dateObj.toLocaleString(undefined, {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });

        outputBannerLastUpdate.innerHTML = `Last Update : ${formattedDate}`;
    }
}

async function getAllExpense(start)
{
    // Would auto sign out if check user token invalid
    const retObj = await checkIfUserLoggedInValid();

    if (retObj.valid)
    {
        const userInfoObj = retObj.loginUserJSON.data;
        const userId = userInfoObj._id;

        try {

            // URL/all/:id/:start/:pagesize
            const userExpense = await fetch(`${API_EXPENSE_URL}/all/${userId}/${start}/${EACH_PAGE_DISPLAY_LIMIT}`);
            
            const userExpenseJSON = await userExpense.json();
            /*
            message : "Query Expense Documents Successfully",
            total : totalDocCount,
            start : startIndex + 1,
            end : startIndex + pageSize,
            data : queryExpenses,
            catCount : categoryCountQuery,
            dateCount : dateCountQuery
            */
    
            if (userExpenseJSON)
            {
                if (userExpense.status === 200)
                {
                    const returnStart = userExpenseJSON.start;

                    //console.log(userExpenseJSON.catCount);

                    updateDisplayTableArea(createOneTableDocuments(userExpenseJSON.data, returnStart, userExpenseJSON.total));

                    updateDashBoardExpenseTrendChart(userExpenseJSON.dateCount);

                    updateDashBoardCategoryExpenseChart(userExpenseJSON.catCount);
                }
                else
                {
                    alert(`Message : ${userExpenseJSON.message}\nError : ${userExpenseJSON.error}`);
                }
            }
        }
        catch(error)
        {
            alert(`Error : ${error}`);
        }
    }
}

async function getYearMonthExpense(start, year, month)
{
    // Would auto sign out if check user token invalid
    const retObj = await checkIfUserLoggedInValid();

    if (retObj.valid)
    {
        const userInfoObj = retObj.loginUserJSON.data;
        const userId = userInfoObj._id;

        try {

            // URL/documents/:id/:year/:month/:start/:pagesize
            const userExpense = await fetch(`${API_EXPENSE_URL}/documents/${userId}/${year}/${month}/${start}/${EACH_PAGE_DISPLAY_LIMIT}`);
            
            const userExpenseJSON = await userExpense.json();
            /*
            message : "Query Expense Documents Successfully",
            total : totalDocCount,
            start : startIndex + 1,
            end : startIndex + pageSize,
            year : selectedYear,
            month : selectedMonth,
            data : queryExpenses,
            catCount : categoryCountQuery,
            dateCount : dateCountQuery
            */
    
            if (userExpenseJSON)
            {
                if (userExpense.status === 200)
                {
                    const returnStart = userExpenseJSON.start;
                    //console.log(userExpenseJSON.data, userExpenseJSON.year, userExpenseJSON.month, returnStart, userExpenseJSON.total);
                    updateDisplayTableArea(createOneTableDocuments(userExpenseJSON.data, returnStart, userExpenseJSON.total), false);

                    updateDashBoardExpenseTrendChart(userExpenseJSON.dateCount);

                    updateDashBoardCategoryExpenseChart(userExpenseJSON.catCount);
                }
                else
                {
                    alert(`Message : ${userExpenseJSON.message}\nError : ${userExpenseJSON.error}`);
                }
            }
        }
        catch(error)
        {
            alert(`Error : ${error}`);
        }
    }
}

// To be called in addexpense.js
export function refreshTableDisplayAfterAddNewExpense()
{
    getAllExpense(-1); // enter "-1" to show last page record
}

async function removeExpenseDocument(expenseId)
{
    // Would auto sign out if check user token invalid
    const retObj = await checkIfUserLoggedInValid();

    //console.log(expenseId);

    if (retObj.valid)
    {
        try {

            const response = await fetch(`${API_EXPENSE_URL}/delete/${expenseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const responseJSON = await response.json();
    
            if (responseJSON)
            {
                if (response.status === 200)
                {
                    //console.log(responseJSON.data);
                }
                else
                {
                    alert(`Message : ${responseJSON.message}`);
                }
            }
            else
            {
                alert(`Server Response Fail`);
            }
        }
        catch(error)
        {
            alert(`Error : ${error}`);
        }
    }
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

function createAllRemoveButtonEventListener()
{
    // class "remove-button"
    const allRemoveButtons = document.querySelectorAll(`.${REMOVE_BUTTON_IDENTIFIER_CLASS}`);

    //console.log(allRemoveButtons);

    if (allRemoveButtons)
    {
        // create event listeners for each element
        allRemoveButtons.forEach(button => {
            
            button.addEventListener("click", (event)=>{

                const removeExpenseID = event.target.getAttribute(EXPENSE_DOC_ID_ATTRIB_KEY);

                removeExpenseDocument(removeExpenseID);

                getAllExpense(1);
            });
        });
    }
}

function createOneDocumentRow(expenseDocObj)
{
    let iconObjStr = "";

    const expenseId = expenseDocObj._id;
    const iconId    = expenseDocObj.iconId;
    const category  = expenseDocObj.category;
    const receiver  = expenseDocObj.receiver;
    const description = expenseDocObj.description;
    const amount = expenseDocObj.cost;

    const dateObj = new Date(expenseDocObj.date);
    const dateString = dateObj.toDateString();          // Date string
    const timeString = dateObj.toLocaleTimeString();    // Time string with browser time zone 

    if (arrAllAvailIcon)
    {
        const iconObj = arrAllAvailIcon.find((eachIcon)=>eachIcon._id === iconId);

        if (iconObj)
        {
            iconObjStr = `<i class="${iconObj.twCSS} ${ICON_CLASS_LARGE_SIZE} col-start-1 col-span-1 flex flex-col justify-center items-center" style="color: #1b3f7c;"></i>`
        }
    }

    const row = `<tr class="bg-gray-700 border-b dark:bg-gray-200 dark:border-gray-700 text-gray-900 font-medium text-sm">
                    <th scope="row" class="px-6 py-3 whitespace-nowrap">
                        <div class="grid grid-cols-2 gap-1 flex flex-col justify-center h-auto w-auto">
                            ${iconObjStr}
                            <span class="col-start-2 col-span-1">${category}</span>
                        </div>
                    </th>
                    <td class="px-6 py-3 text-center whitespace-nowrap">
                        ${receiver}
                    </td>
                    <td class="px-6 py-3 text-center">
                        ${description}
                    </td>
                    <td class="px-6 py-3 text-center whitespace-nowrap">
                        ${amount}
                    </td>
                    <td class="px-6 py-3 text-center whitespace-nowrap">
                        ${dateString}
                    </td>
                    <td class="px-6 py-3 text-center whitespace-nowrap">
                        ${timeString}
                    </td>
                    <td class="px-6 py-3 text-center whitespace-nowrap">
                        <a href="#" ${EXPENSE_DOC_ID_ATTRIB_KEY}=${expenseId} class="${REMOVE_BUTTON_IDENTIFIER_CLASS} hover:text-red-700 hover:text-base">Remove</a>
                    </td>
                </tr>`;
    return row;
}

function createOneTableDocuments(allRelatedExpenseDocObj, start, total, specificDate = null)
{
    let dateHeader = "";
    let allDocuments = "";

    if (specificDate)
    {
        dateHeader = 
        `<tr>
            <th colspan="7" class="px-6 text-center text-xl rounded-t-lg border-b border-gray-100">
                ${specificDate}
            </th>
        </tr>`;
    }

    if (allRelatedExpenseDocObj &&
        allRelatedExpenseDocObj.length &&
        total > 0)
    {
        for (let eachExpenseObj of allRelatedExpenseDocObj)
        {
            allDocuments += createOneDocumentRow(eachExpenseObj);
        }

        updateTableStartEndSelectionText(start, start + allRelatedExpenseDocObj.length - 1, total);
    }
    else
    {
        updateTableStartEndSelectionText(0, 0, 0);
    }

    let table = 
    `<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-100 uppercase bg-gray-700">
            ${dateHeader}
            <tr class="whitespace-nowrap">
                <th scope="col" class="px-6 py-3 text-center">
                    Category
                </th>
                <th scope="col" class="px-6 py-3 text-center">
                    Receiver
                </th>
                <th scope="col" class="px-6 py-3 text-center">
                    Description
                </th>
                <th scope="col" class="px-6 py-3 text-center">
                    Amount ($)
                </th>
                <th scope="col" class="px-6 py-3 text-center">
                    Date
                </th>
                <th scope="col" class="px-6 py-3 text-center">
                    Time
                </th>
                <th scope="col" class="px-6 py-3 text-center">
                </th>
            </tr>
        </thead>
        <tbody>
           ${allDocuments}
        </tbody>
    </table>`

    return table;
}

function updateTableStartEndSelectionText(start, end, total)
{
    dispStartEndSelection.innerHTML = 
    `Showing <span class="font-semibold text-gray-500 dark:text-white"> ${start} </span> to <span class="font-semibold text-gray-500 dark:text-white"> ${end} </span> of <span class="font-semibold text-gray-500 dark:text-white"> ${total} </span> Entries`;

    curDispDocNumObj = {start, end, total};
    //console.log(curDispDocNumObj);
}

async function updateDisplayTableArea(arrAllTablesHTML, bClearYearMonthSelection = true)
{
    if (bClearYearMonthSelection)
    {
        // Clear the Year and Month Selection
        inputSelectYear.value = "";
        inputSelectMonth.value = "";
    }

    // Clear all previous created Remove expense button event listener
    removeAllRemoveButtonEventListener();

    // update new content
    outputTableArea.innerHTML = arrAllTablesHTML;
    // Wait for the next browser repaint using requestAnimationFrame, ensure the new remove object class existed
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Add New Remove Button Event Listener
    createAllRemoveButtonEventListener();
}

function checkAndGetYearMonthSelectedExpense(event, selection, flagToCheck)
{
   // for both Year and Month had Selection
    if (flagToCheck &&
        inputSelectYear.value != "" &&
        inputSelectMonth.value != "")
    {
        //console.log(selection, curDateDropDownCondition, inputSelectYear.value, inputSelectMonth.value);
        getYearMonthExpense(1, inputSelectYear.value, inputSelectMonth.value);   // start from the 1st record
    } 
}

function setYearMonthSelectionConditionFlag(event, selection, flagObj)
{
    switch (selection)
    {
        case SELECT_YEAR:
            flagObj.year = true;
            break;
        case SELECT_MONTH:
            flagObj.month = true;
            break;
        default:
            break;
    }
    //console.log(selection, curDateDropDownCondition);
}

function clearYearMonthSelectionConditionFlag(event, selection, flagObj)
{
    switch (selection)
    {
        case SELECT_YEAR:
            flagObj.year = false;
            break;
        case SELECT_MONTH:
            flagObj.month = false;
            break;
        default:
            break;
    }
    //console.log(selection, curDateDropDownCondition);
}

function getRandomRGBString(opacity = 1)
{
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return {
        solid : `rgb(${r}, ${g}, ${b})`,
        opacity : `rgba(${r}, ${g}, ${b}, ${opacity})`
    };
}

function getUnlikeRGBStringList(numberOfUnlikeColor, minDistance, opacity = 1)
{
    const colorDistance = (color1, color2)=>{
        const rDiff = color1.solid.r - color2.solid.r;
        const gDiff = color1.solid.g - color2.solid.g;
        const bDiff = color1.solid.b - color2.solid.b;
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    };

    const colors = [];
    while (colors.length < numberOfUnlikeColor) {
        const color = getRandomRGBString(opacity);
        if (!colors.some(c => colorDistance(c, color) < minDistance)) {
            colors.push(color);
        }
    }
    return colors;
}

function updateDashBoardExpenseTrendChart(arrYearlyMonthsExpense)
{
    /*
    objYearlyMonthsExpense ->
    [
        {
            _id : 2024,
            yearlyData : [
                {month : 1, totalCost : 100},
                {month : 2, totalCost : 200},
                ....
            ]
        },
        {
            _id : 2023,
            yearlyData : [
                {month : 1, totalCost : 10},
                {month : 2, totalCost : 700},
                ....
            ]
        }
        ...
    ]
    */

    if (dispMonthlyExpenseChart)
    {
        // Destroy the previous generated first
        if (dispMonthlyExpenseChart.chart)
        {
            dispMonthlyExpenseChart.chart.destroy();
        }

        let arrYearMontlyDataObj = [];

        // Color RGB Center of Gravity Difference at least 100
        const arrUnlikeRGBStr = getUnlikeRGBStringList(arrYearlyMonthsExpense.length, CHART_EACH_GROUP_COLOR_RGB_CG_DIFF);

        for (const [index, eachYear] of arrYearlyMonthsExpense.entries())
        {
            let allMonthExpense = Array(12).fill(0.0);

            for (const eachMonth of eachYear.yearlyData)
            {
                const monthIndex = eachMonth.month - 1;  // -1 auto change from string to number
                const monthCost = Number((+eachMonth.totalCost).toFixed(2));
                allMonthExpense[monthIndex] = monthCost;
            }

            arrYearMontlyDataObj.push({

                label: `${eachYear._id}`,
                data: allMonthExpense,
                fill: true,
                borderColor: arrUnlikeRGBStr[index].solid,
                tension: 0.1
            });
        }

        const monthlyTrendData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: arrYearMontlyDataObj
        };

        // Create monthly expense trend line chart
        const ctx = dispMonthlyExpenseChart.getContext('2d');
        const monthlyTrendChart = new Chart(ctx, {
            type: 'line',
            data: monthlyTrendData,
            options: {
                title: {
                display: true,
                text: 'Monthly Expense Trend'
                },
                scales: {
                        y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Expense (CAD)'
                        }
                    }
                }
            }
        });

        dispMonthlyExpenseChart.chart = monthlyTrendChart;
    }
}

function updateDashBoardCategoryExpenseChart(arrCategoryExpense)
{
    /*
    arrCategoryExpense->
    [
        {
            _id : "Food",
            totalCostByCategory : 1200
        },
        {
            _id : "Bank",
            totalCostByCategory : 10000
        }
        ....
    ]
    */
    if (dispCategoryExpenseChart)
    {
        // Destroy the previous generated first
        if (dispCategoryExpenseChart.chart)
        {
            dispCategoryExpenseChart.chart.destroy();
        }

        let listCategory = [];
        let listCategoryValue = [];
        let backgroundclr = [];
        let borderclr = [];

        // Color RGB Center of Gravity Difference at least 100
        const arrUnlikeRGBStr = getUnlikeRGBStringList(arrCategoryExpense.length, CHART_EACH_GROUP_COLOR_RGB_CG_DIFF, 0.5);

        for (const [index, eachCategory] of arrCategoryExpense.entries())
        {
            listCategory.push(eachCategory._id);
            listCategoryValue.push(eachCategory.totalCostByCategory);
            backgroundclr.push(arrUnlikeRGBStr[index].opacity);
            borderclr.push(arrUnlikeRGBStr[index].solid);
        }

        const categoryExpensesData = {

            labels: listCategory,
            datasets: [{
                label: 'Category Expenses',
                data: listCategoryValue,
                backgroundColor : backgroundclr,
                borderColor : borderclr,
                // backgroundColor: [
                //   'rgba(255, 99, 132, 0.5)',
                //   'rgba(54, 162, 235, 0.5)',
                //   'rgba(255, 206, 86, 0.5)',
                //   'rgba(75, 192, 192, 0.5)',
                //   'rgba(153, 102, 255, 0.5)'
                // ],
                // borderColor: [
                //   'rgba(255, 99, 132, 1)',
                //   'rgba(54, 162, 235, 1)',
                //   'rgba(255, 206, 86, 1)',
                //   'rgba(75, 192, 192, 1)',
                //   'rgba(153, 102, 255, 1)'
                // ],
                borderWidth: 1
            }]
        };

        // Create category chart
        const categoryCtx = dispCategoryExpenseChart.getContext('2d');
        const categoryExpenseChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: categoryExpensesData,
            options: {
                title: {
                    display: true,
                    text: 'Category Expenses'
                },
                // plugins : {
                //         datalabels: { // Configuration for the datalabels plugin
                //         display: true,
                //         color: 'black', // Color of the value text
                //         formatter: (value, context) => {
                //             return context.chart.data.labels[context.dataIndex] + ': ' + value; // Format: label: value
                //         }
                //     }
                // }
            }
        });

        dispCategoryExpenseChart.chart = categoryExpenseChart;
    }
}

async function initDashBoardTableAndData()
{
    const iconInfoObj = await GetAvailableIconInfo();

    // Store the imported value to global module variable
    arrAllAvailIcon         = iconInfoObj.arrAllIcon;
    ICON_CLASS_LARGE_SIZE   = iconInfoObj.size.large;

    // Create An Emtpy Table First
    await updateDisplayTableArea(createOneTableDocuments(null, 0, 0));

    // Try to Get All Record and Display When Log In
    await getAllExpense(1);   // start from the 1st record
}



// ********************************************************** Implementation *************************************************************//

// Button Get All Expense
buttonGetAllExpense.addEventListener("click", (event)=>{
    getAllExpense(1);   // start from the 1st record
});

// Selection Get Selected Year And Month Expense
// Need to ensure the drop Down is Open to capture the "Click" Selection for trigger data display
inputSelectYear.addEventListener("mousedown", (event)=>{
    setYearMonthSelectionConditionFlag(event, SELECT_YEAR, curDateDropDownCondition);
});
inputSelectMonth.addEventListener("mousedown", (event)=>{
    setYearMonthSelectionConditionFlag(event, SELECT_MONTH, curDateDropDownCondition);
});

// Check the "blur" to clear the flag
inputSelectYear.addEventListener("blur", (event)=>{
    clearYearMonthSelectionConditionFlag(event, SELECT_YEAR, curDateDropDownCondition);
});
inputSelectMonth.addEventListener("blur", (event)=>{
    clearYearMonthSelectionConditionFlag(event, SELECT_MONTH, curDateDropDownCondition);
});


// When the second click or the data changed to trigger the data capture
inputSelectYear.addEventListener("change", (event)=>{
    checkAndGetYearMonthSelectedExpense(event, SELECT_YEAR, curDateDropDownCondition.year);
});
inputSelectMonth.addEventListener("change", (event)=>{
    checkAndGetYearMonthSelectedExpense(event, SELECT_MONTH, curDateDropDownCondition.month);
});
inputSelectYear.addEventListener("click", (event)=>{
    checkAndGetYearMonthSelectedExpense(event, SELECT_YEAR, curDateDropDownCondition.year);
});
inputSelectMonth.addEventListener("click", (event)=>{
    checkAndGetYearMonthSelectedExpense(event, SELECT_MONTH, curDateDropDownCondition.month);
});

// Button Go Next Page
buttonNextPage.addEventListener("click", (event)=>{

    // condition 1 - when there had documents are displayed
    // condition 2 - when not at the last page, at last page -> end >= total
    if (curDispDocNumObj.total > 0 &&
        curDispDocNumObj.end < curDispDocNumObj.total)
    {
        // for Year and Month Selection Display
        if (inputSelectYear.value != "" &&
            inputSelectMonth.value != "")
        {
            getYearMonthExpense(curDispDocNumObj.end + 1, inputSelectYear.value, inputSelectMonth.value);
        }
        // Else is to display all, with the next start to be prev end + 1
        else
        {
            getAllExpense(curDispDocNumObj.end + 1);
        }
    }
});

// Button Go Prev Page
buttonPrevPage.addEventListener("click", (event)=>{

    // condition 1 - when there had documents are displayed
    // condition 2 - when not at the first page, at first page -> start < EACH_PAGE_DISPLAY_LIMIT
    if (curDispDocNumObj.total > 0 &&
        curDispDocNumObj.start > EACH_PAGE_DISPLAY_LIMIT)
    {
        // for Year and Month Selection Display
        if (inputSelectYear.value != "" &&
            inputSelectMonth.value != "")
        {
            getYearMonthExpense(curDispDocNumObj.start - EACH_PAGE_DISPLAY_LIMIT, inputSelectYear.value, inputSelectMonth.value);
        }
        // Else is to display all, with the next start to be (prev start - EACH_PAGE_DISPLAY_LIMIT)
        else
        {
            getAllExpense(curDispDocNumObj.start - EACH_PAGE_DISPLAY_LIMIT);
        }
    }
});


await initGetUserInfo();
initYearMonthSelectOption();
await initDashBoardTableAndData();