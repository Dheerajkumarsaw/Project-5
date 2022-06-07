const mongoose = require("mongoose");

const isValidBody = function (value) {
    if (typeof value == "undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    if (typeof value === "Number" && value.trim().length === 0) return false
    return true
};

const isValidPhone = function (value) {
    const regx = /^[6-9]\d{9}$/
    return regx.test(value)
};

const isValidEmail = function (value) {
    const regx = /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/
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

const isValidName = function (value) {
    const regx = /^[A-Za-z0-9 ]{2,}$/
    return regx.test(value)
};

const isValidDeciNum = function (value) {
    const regx = /^[0-9]\d*(\.\d+)?$/
    return regx.test(value)
};

const isValidEnum = function (value) {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(value) !== -1
};

const isValidInstallment = function (value) {
    const regx = /^[0-9]{1,2}$/;
    return regx.test(value);
}

const isValidBoolean = function (value) {
    return ["true", "false"].indexOf(value) !== -1
}

const isValidBinary = function (value) {
    return [1, 0].indexOf(value) !== -1
}

const isValidFile = function (value) {
    return [1].indexOf(value) !== -1
}

const validQuantity = function isInteger(value) {
    if (value < 1) return false
    if (isNaN(Number(value))) return false
    if (value % 1 == 0) return true
}

const isValidOrderEnum = function (value) {
    return ["pending", "completed", "cancelled"].indexOf(value) !== -1
}

let checkImage = (img) => {
    let imageRegex = /(jpeg|png|jpg)$/
    return imageRegex.test(img)
}


module.exports = {
    isValidBody, isValidEmail, isValidObjectId, isValidPass, isValidPhone,
    isValidPin, isValidName, isValidDeciNum, isValidEnum, isValidBoolean,
    isValidInstallment, isValidBinary, validQuantity, isValidFile, isValidOrderEnum,checkImage
}

