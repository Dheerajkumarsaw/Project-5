const productModel = require("../model/productModel");
const validator = require("../validator/validator");
const saveFile = require("../aws/aws-s3")
const moment = require("moment")


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

const getSpecificProduct = async function (req, res) {
    try{
        let data = {
            isDeleted: false
        }
        let queryDataSize = req.query.size;
        if (queryDataSize) {
            if (!(validator.isValid(queryDataSize)) && (validator.isValidSize(queryDataSize))) {
                return res.status(400).send({status: false, message:"plz Enter a valid Size"})
            }
            if(!(validator.isValidSize(queryDataSize))) {
                return res.status(400).send({status:false, message:"Please Provide Available Sizes from S,XS,M,X,L,XXL,XL"})
            }
            data["availableSizes"] = queryDataSize.trim();
        }
        let name = req.query.name;
        if (name) {
            if (!validator.isValid(name)) {
                return res.status(400).send({status: false, message:"plz enter a valid name"})
            }
            data["title"] = {$regex: name.trim()}
        }
        let priceGreaterThan = req.query.priceGreaterThan;
        if (priceGreaterThan) {
            if (!validator.isValid(priceGreaterThan)) {
                return res.status(400).send({status: false, message:"plz enter a valid name"})
            }
            data["price"] = {
                $gte: priceGreaterThan
            }
        }
        let priceLessThan = req.query.priceLessThan;
        if (priceLessThan) {
            if (!validator.isValid(priceLessThan)) {
                return res.status(400).send({status: false, message:"plz enter a valid name"})
            }
            data["price"] = {
                $lte: priceLessThan
            }
        }
        if( priceLessThan && priceGreaterThan){
            if(!validator.isValid(priceLessThan)){
                return res.status(400).send({status: false, message:"plz enter a valid price"})
            }
            if(!validator.isValid(priceGreaterThan)){
                return res.status(400).send({status: false, message:"plz enter a valid price"})
            }
            data["price"] = {$lte:priceLessThan,$gte:priceGreaterThan}
    
        }
        let filerProduct = await productModel.find(data).sort({price: req.query.priceSort})
        if (filerProduct.length === 0) {
            return res.status(400).send({
                status: true,
                message: "No product found"
            })
        }
        return res.status(200).send({
            statu: true,
            message: "products you want",
            data: filerProduct
        })
    }catch(error){
        return res.status(500).send ({status:false, message: error.message})
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: true, message: "Invalid productId" })
        }
        const deletedProductId = await productModel.findById({_id: productId})
        if (!deletedProductId) {
            return res.status(404).send({ status: true, message: `This ${productId} productId does not exist ` })
        }
        if (deletedProductId.isDeleted !== false) {
            return res.status(404).send({ status: true, message: `This ${productId} productId is already Deleted `
            })
        }
        await productModel.findByIdAndUpdate({_id: productId }, { $set: { isDeleted: true, deletedAt: moment().format()}}, { new: true})
        return res.status(200).send({status: true, message: "Deleted Successfully" })
    } catch (err) {
        return res.status(500).send({ status: false,Error: err.message})
    }
}
module.exports = { createProduct, getSpecificProduct, deleteProduct  }


