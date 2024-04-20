const mongoose = require('mongoose');

// Collection "expenses" in mongoDB
const expenseSchema = mongoose.Schema({

    accountId : {
        type: String,
        required : true
    },
    iconId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categoryIcon'
    },
    category : {
        type : String,
        required : true
    },
    receiver : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    cost : {
        type : Number,
        min : 0,
        required : true
    },
    date : {
        type : Date,
        required : true
    }

}, {
    timestamps : true
})

// Collection "categoryIcons" in mongoDB
const catIconSchema = mongoose.Schema({

    twCSS : {
        type: String,
        required : true
    },
})

const expenseModel = mongoose.model('Expense', expenseSchema);
const iconModel = mongoose.model('categoryIcon', catIconSchema);

module.exports = {
    expenseModel,
    iconModel
}