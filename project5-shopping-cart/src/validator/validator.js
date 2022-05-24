const mongoose = require("mongoose");

const isValidBody = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
};

const isValidPhone = function (value) {
    const regx = /^[6-9]\d{9}$/
    return regx.test(value)
};

const isValidEmail = function (value) {
    const regx = /^([a-z0-9]+@[a-z]+\.[a-z]{2,3})?$/
    return regx.test(value)
};

const isValidPin = function (value) {
    const regx = /^[0-9]{6}$/
    return regx.test(value)
};

const isValidObjectId = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
};

const isValidPass = function (password) {
    const regx = /^[0-9a-zA-Z!@#$%&*]{8,15}$/
    return regx.test(password)
};

const isValidName = function (value){
    const regx= /^[A-Za-z ]{2,10}$/
    return regx.test(value)
}

module.exports = { isValidBody, isValidEmail, isValidObjectId, isValidPass, isValidPhone, isValidPin, isValidName }