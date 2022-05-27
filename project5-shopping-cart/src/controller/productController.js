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


//------------Put API's----------------------

const updateProduct = async function (req, res) {
    try {
        const requestBody= req.body
        const productId = req.params.productId
        const file = req.files
        let newData = {}
        
        //-------------dB call for product existance--------------------
        const productCheck = await productModel.findOne({_id: productId, isDeleted:false})
        if(!productCheck) return res.status(404).send({ status: true, message: "No product found by Product Id given in path params" })

        //-----------------------Destructuring------------------------
        const{title,description,price,currencyId,currencyFormat,isFreeShipping,productImage,style,availableSizes,installments,isDeleted} = requestBody

        //-----------------Empty Body check------------------
        if((Object.keys(requestBody).length ==0) && (file.length==0)){
            return res.status(400).send({ status: false, message: "Please fill at least one area to update" })
        }
        // ------------------validation-------------------------
        if (validator.isValidBody(title)) {

            const titleExist = await productModel.findOne({title: title}) // DB call for title existance
            if(titleExist) return res.status(400).send({status: false, message:"This 'title' name already existes!"})
            
            if (!validator.isValidName(title)) return res.status(400).send({ status: false, message: "Please Enter a valid title should contain at least 2 characters for word formation" })
            newData['title'] = title
        }

        if (validator.isValidBody(description)) {
            if (!validator.isValidName(description)) return res.status(400).send({ status: false, message: "Please Enter a valid description, should contain at least 2 characters for word formation" })
            newData['description'] = description
        }

        if (validator.isValidBody(price)) {
            if (!validator.isValidDeciNum(price)) return res.status(400).send({ status: false, message: "Please Enter a valid price." })
            newData['price'] = price
        }

        if (currencyId) return res.status(400).send({ status: false, message:"Currency Id doesn't need to update, because it has only 'INR'(indian rupee) Option, fill other fields besides"})
        
        if (currencyFormat) return res.status(400).send({ status: false, message:"Currency Format doesn't need to update, because it has only One symbol, fill other fields besides"})

        if (validator.isValidBody(isFreeShipping)) {
            if (!validator.isValidBoolean(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping needs to be a Boolean" })
            newData['isFreeShipping'] = isFreeShipping
        }

        if(file.length >0){
            const uploadProductImage = await saveFile.uploadFiles(file[0])
            newData['productImage'] = uploadedURL
        }
        
        if (validator.isValidBody(style)) {
            if (!validator.isValidName(style)) return res.status(400).send({ status: false, message: "Please Enter a valid style, should contain at least 2 characters for word formation" })
            newData['style'] = style
        }
        if (validator.isValidBody(availableSizes)) {
            if (!validator.isValidEnum(availableSizes)) return res.status(400).send({ status: false, message: 'Please SELECT a valid availableSize from list ["XS", "S", "M", "L", "X", "XL", "XXL" ]' })
            newData['availableSizes'] = availableSizes
        }
        if (validator.isValidBody(installments)) {
            if (!validator.isValidInstallment(installments)) return res.status(400).send({ status: false, message: "Please Enter a valid installments, upto 99 months and in 2 digits support only" })
            newData['installments'] = installments
        }

    }
    catch (err) {
        res.status(500).send({ status: false, message: error.message })
    }
}


