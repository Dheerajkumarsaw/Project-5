const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true, trim: true
    },
    lname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true }
})