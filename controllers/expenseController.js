const userModel = require('../models/user');
const expenseModelCollection = require('../models/expense');

const iconModel     = expenseModelCollection.iconModel;
const expenseModel  = expenseModelCollection.expenseModel;


const GetAllIcons = async (req, res)=>{

    try {
        const icons = await iconModel.find();
        return res.status(200).json({
            message : "All Icons",
            data : icons
        })
    }
    catch (error) {
        return res.status(500).json({
            message : "Get All Icons Fail",
            error
        })
    }
}

const AddNewExpense = async (req, res)=>{

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
    const infoBody = req.body;
    const userId = infoBody.id;

    // Check if any mandatory item missing
    var strItemMissed = "";
    if (!infoBody.category)
    {
        strItemMissed += "Category";
    }
    if (!infoBody.receiver)
    {
        strItemMissed += ", ";
        strItemMissed += "Receiver";
    }
    if (!infoBody.date)
    {
        strItemMissed += ", ";
        strItemMissed += "Date";
    }

    if (strItemMissed) 
    {
        return res.status(400).json({
            message : `Entry ${strItemMissed} Missing`
        })
    }

    // Check if Account Exist
    const userExisted = await userModel.findOne({
        _id : userId
    });

    if (!userExisted)
    {
        return res.status(401).json({
            message : `User ${userId} NOT existed.`
        });
    }

    // Create a new document
    const newExpense = new expenseModel({
        accountId : userId,
        iconId : infoBody.iconId,
        category : infoBody.category,
        receiver : infoBody.receiver,
        description : infoBody.description,
        cost : infoBody.cost,
        date : infoBody.date
    })

    // Send to Database
    try 
    {
        const createdNewExpense = await newExpense.save();
        return res.status(201).json({
            message : "New Expense Added Successfully",
            data : createdNewExpense
        });
    }
    catch (error)
    {
        return res.status(500).json({
            message : "Error When Create New Expense",
            error
        });
    }
}

const GetAllMatchedExpense = async (req, res)=>{

    // URL/documents/:id/:year/:month/:start/:pagesize
    const userId        = req.params.id;
    const selectedYear  = +req.params.year;         // Need change to number
    const selectedMonth = +req.params.month;        // Need change to number
    let startIndex    = req.params.start - 1;       // -1 already change to number
    const pageSize    = +req.params.pagesize;       // use + change to number

    // allow passing startIndex < 0 means want to display last page
    if (!userId || selectedYear < 1970 || selectedMonth <= 0 || selectedMonth > 12 ||
        pageSize <= 0)
    {
        return res.status(400).json({
            message : `Condition Invalid`,
            year : selectedYear,
            month : selectedMonth,
            startIdx : startIndex,
            pageLimit : pageSize
        });
    }

    // Check if Account Exist
    const userExisted = await userModel.findOne({
        _id : userId
    });

    if (!userExisted)
    {
        return res.status(401).json({
            message : `User ${userId} NOT existed.`
        });
    }

    try {

        // Get the Total Count of Documents that match the user ID
        const totalDocCountQuery = await expenseModel.aggregate([
            {
                $match: {
                    accountId : userId,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$date" }, selectedYear] },
                            { $eq: [{ $month: "$date" }, selectedMonth] }
                        ]
                    }
                }
            },
            {
                $count: "totalDocCount"
            }
        ]).exec();

        // Get the Grouped Cost Count of Category
        const categoryCountQuery = await expenseModel.aggregate([
            {
                $match: {
                    accountId : userId,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$date" }, selectedYear] },
                            { $eq: [{ $month: "$date" }, selectedMonth] }
                        ]
                    }
                }
            },
            // Group by category and calculate the total cost for each category
            {
                $group: {
                  _id: "$category",
                  totalCostByCategory: { $sum: "$cost" }
                }
            },
            {
                $sort : {_id : 1}
            }
        ]).exec();

        // Get the Grouped Cost Count By Year and Month
        const dateCountQuery = await expenseModel.aggregate([
            {
                $match: {
                    accountId : userId,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$date" }, selectedYear] },
                            { $eq: [{ $month: "$date" }, selectedMonth] }
                        ]
                    }
                }
            },
            //Group by year and month and calculate the total cost for each group
            {
                $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    totalCostByMonth: { $sum: "$cost" }
                }
            },
            // Sort by the month before push each year data
            {
                $sort : {
                    "_id.month" : 1
                }
            },
            // Group by year and create a list of yearly grouped month data
            {
                $group: {
                    _id: "$_id.year",
                    yearlyData: {
                        $push: {
                            month: "$_id.month",
                            totalCost: "$totalCostByMonth"
                        }
                    }
                }
            },
            // then sort by the latest year
            {
                $sort : {
                    _id : -1
                }
            }
        ]).exec();

        const totalDocCount = totalDocCountQuery.length > 0 ? totalDocCountQuery[0].totalDocCount : 0;

        // Means want to get the last page data
        if (startIndex < 0)
        {
            const totalPageFilled = Math.trunc(totalDocCount / pageSize);
            const lastPageRemainDoc =  Math.trunc(totalDocCount % pageSize);

            startIndex = (pageSize * totalPageFilled); // Index start from 0

            // if not exceed the last fulfilled page, the last fullfiled page is the last page
            // shift back to the first of the last fulfilled page
            if (lastPageRemainDoc === 0)
            {
                startIndex -= pageSize;
            }

            //console.log(startIndex, pageSize, totalPageFilled, lastPageRemainDoc);
        }

        const queryExpenses = await expenseModel.aggregate([
            {
                $match: {
                    accountId : userId,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$date" }, selectedYear] },
                            { $eq: [{ $month: "$date" }, selectedMonth] }
                        ]
                    }
                }
            },
            {
                $sort: { date: 1 } // Sort by ascending order of the date field
            },
            {
                $skip : startIndex
            },
            {
                $limit : pageSize
            }
        ]).exec();
      
        //console.log("Filtered expenses:", expenses);

        return res.status(200).json({
            message : "Query Expense Documents Successfully",
            total : totalDocCount,
            start : startIndex + 1,
            end : startIndex + pageSize,
            year : selectedYear,
            month : selectedMonth,
            data : queryExpenses,
            catCount : categoryCountQuery,
            dateCount : dateCountQuery
        });
      } 
      catch (error) 
      {
        return res.status(500).json({
            message : "Error When Query Expense Documents",
            error
        });
      }
}

const GetAllExpense = async (req, res)=>{

    // URL/all/:id/:start/:pagesize
    const userId      = req.params.id;
    let startIndex    = req.params.start - 1;   // -1 already change to number
    const pageSize    = +req.params.pagesize;   // use + change to number

    // allow passing startIndex < 0 means want to display last page
    if (!userId || pageSize <= 0)
    {
        return res.status(400).json({
            message : `Condition Invalid`,
            id : userId,
            startIdx : startIndex,
            pageLimit : pageSize
        });
    }

    // Check if Account Exist
    const userExisted = await userModel.findOne({
        _id : userId
    });

    if (!userExisted)
    {
        return res.status(401).json({
            message : `User ${userId} NOT existed.`
        });
    }

    try {

        // Get the Total Count of Documents that match the user ID
        const totalDocCountQuery = await expenseModel.aggregate([
            {
                $match: {
                    accountId: userId
                }
            },
            {
                $count: "totalDocCount"
            }
        ]).exec();

        // Get the Grouped Cost Count of Category
        const categoryCountQuery = await expenseModel.aggregate([
            {
                $match: {
                    accountId: userId
                }
            },
            // Group by category and calculate the total cost for each category
            {
                $group: {
                  _id: "$category",
                  totalCostByCategory: { $sum: "$cost" }
                }
            },
            {
                $sort : {_id : 1}
            }
        ]).exec();

        // Get the Grouped Cost Count By Year and Month
        const dateCountQuery = await expenseModel.aggregate([
            {
                $match: {
                    accountId: userId
                }
            },
            //Group by year and month and calculate the total cost for each group
            {
                $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    totalCostByMonth: { $sum: "$cost" }
                }
            },
            // Sort by the month before push each year data
            {
                $sort : {
                    "_id.month" : 1
                }
            },
            // Group by year and create a list of yearly grouped month data
            {
                $group: {
                    _id: "$_id.year",
                    yearlyData: {
                        $push: {
                            month: "$_id.month",
                            totalCost: "$totalCostByMonth"
                        }
                    }
                }
            },
            // then sort by the latest year
            {
                $sort : {
                    _id : -1
                }
            }
        ]).exec();

        const totalDocCount = totalDocCountQuery.length > 0 ? totalDocCountQuery[0].totalDocCount : 0;

        // Means want to get the last page data
        if (startIndex < 0)
        {
            const totalPageFilled = Math.trunc(totalDocCount / pageSize);
            const lastPageRemainDoc =  Math.trunc(totalDocCount % pageSize);

            startIndex = (pageSize * totalPageFilled); // Index start from 0

            // if not exceed the last fulfilled page, the last fullfiled page is the last page
            // shift back to the first of the last fulfilled page
            if (lastPageRemainDoc === 0)
            {
                startIndex -= pageSize;
            }

            //console.log(startIndex, pageSize, totalPageFilled, lastPageRemainDoc);
        }

        //console.log(typeof(startIndex), typeof(pageSize), userId);

        // Get the limited size data that matched the user ID
        const queryExpenses = await expenseModel.aggregate([
            
            {
                $match: {
                    accountId : userId
                }
            },
            {
                $sort: { date: 1 } // Sort by ascending order of the date field
            },
            {
                $skip : startIndex
            },
            {
                $limit : pageSize
            }
        ]).exec();
      
        //console.log("Filtered expenses:", expenses);

        return res.status(200).json({
            message : "Query Expense Documents Successfully",
            total : totalDocCount,
            start : startIndex + 1,
            end : startIndex + pageSize,
            data : queryExpenses,
            catCount : categoryCountQuery,
            dateCount : dateCountQuery
        });
      } 
      catch (error) 
      {
        return res.status(500).json({
            message : "Error When Query Expense Documents",
            error
        });
      }
}

const RemoveExpenseByID = async (req, res)=>{

     // URL/delete/:expense-id
     const expenseId = req.params.expense_id;

     try
     {
        console.log("server", expenseId);
        const removedExpense = await expenseModel.findByIdAndDelete(expenseId);

        if (!removedExpense) {
            return res.status(404).json({
                message : `Expense Document ${expenseId} NOT existed.`
            });
        }
        else
        {
            return res.status(200).json({
                message : "Remove Expense Document Successfully",
                data : removedExpense
            });
        }
     }
     catch (error)
     {
        return res.status(500).json({
            message : "Error When Remove Expense Document",
            error
        });
     }
}

module.exports = {
    GetAllIcons,
    AddNewExpense,
    GetAllMatchedExpense,
    GetAllExpense,
    RemoveExpenseByID
}