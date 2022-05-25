const productModel = require("../model/productModel");
const validator = require("../validator/validator");
const saveFile = require("../aws/aws-s3")


const createProduct = async function (req, res) {
    try {
        const requestBody = req.body;
        const requestFiles = req.files;
        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, message: "Enter data in body" })
        }
        if (requestFiles.length == 0) {
            return res.status(400).send({ status: false, message: "Enter Files to be uploadp" })
        }
        const { title, description, price, currencyId, currencyFormat, availableSizes, installments, style } = requestBody //destructuring
        // validations
        if (!validator.isValidBody(title)) {
            return res.status(400).send({ status: false, message: "Enter Title Alphabets" });
        }
        if (!validator.isValidBody(description)) {
            return res.status(400).send({ status: false, message: "Enter Description" })
        }
        if (!validator.isValidBody(price) || !validator.isValidDeciNum(price)) {
            return res.status(400).send({ status: false, message: "Enter Price Any Combination of Number or Decimal" })
        }
        if (currencyId) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "Enter Currency Id Only 'INR' Either Not Enter" })
            }
        } else {
            requestBody.currencyId = "INR"
        }
        if (currencyFormat) {
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: `Enter CurrencyFormate Only '₹' Either Not Enter` })
            }
        } else {
            requestBody.currencyFormat = "₹"
        }
        if (style) {
            if (!validator.isValidBody(style)) {
                return res.status(400).send({ status: false, message: "Enter valide details in style" })
            }
        }
        if (!validator.isValidBody(availableSizes) || !validator.isValidEnum(availableSizes)) {
            return res.status(400).send({ status: false, message: `Enter Any of These only "S", "XS", "M", "X", "L", "XXL", "XL"` })
        }
        if (!validator.isValidBody(installments) || !/^[0-9]$/.test(installments)) {
            return res.status(400).send({ status: false, message: "Enter installments only Number " })
        }
        if (requestBody.isDeleted) {
            requestBody.deletedAt = Date.now()
        }
        const uploadedURL = await saveFile.uploadFiles(requestFiles[0]);
        requestBody.productImage = uploadedURL;

        const existProduct = await productModel.findOne({ title: title })
        if (existProduct) {
            return res.status(400).send({ status: false, message: "Use different title" })
        }
        const createdProduct = await productModel.create(requestBody);
        res.status(201).send({ status: true, message: "Product Created SuccessFully", data: createdProduct })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

module.exports = { createProduct }


