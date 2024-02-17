const mongoose = require("mongoose");

let medicineSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    exp: {
        type: String, 
        required: true
    }
})

module.exports = mongoose.model('medicine', medicineSchema);