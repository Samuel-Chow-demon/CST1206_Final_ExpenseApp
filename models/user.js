const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    name : {
        type: String,
        required : true
    },
    email : {
        type: String,
        required : true,
        unique: true
    },
    password : {
        type: String,
        required : true
    },
    // Each Account can design own Category Name with linked to the desire Icon from our categoryIcon Collection table
    categoryUse : [{
        iconId : {type: mongoose.Schema.Types.ObjectId, ref: 'categoryIcon'},
        name : {type: String, required : true, unique: true}
    }],
    token : {
        type : String
    }

}, {
    timestamps : true
})

const userModel = mongoose.model('Account', userSchema);

module.exports = userModel;