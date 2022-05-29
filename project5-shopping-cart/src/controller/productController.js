const productModel = require("../model/productModel")
const validator = require("../validator/validator")
const saveFile = require("../aws/aws-s3")
const moment = require("moment")

// ============================   CREATE  PRODUCT  =========================================
const createProduct = async function (req, res) {
    try {
        const requestBody = req.body;
        const requestFiles = req.files;
        // console.log(requestFiles)
        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, message: "Enter data in body" })
        }
        if (requestBody.isDeleted) {
            return res.status(400).send({ status: false, message: `You can't create Deleted Product Please Mark IsDleted false` })
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
        if ("style" in requestBody) {
            if (!validator.isValidBody(style)) {
                return res.status(400).send({ status: false, message: "Enter valide details in style" })
            }
            requestBody["style"] = style
        }
        if (!validator.isValidBody(availableSizes)) {
            return res.status(400).send({ status: false, message: `Enter Any of These only "S", "XS", "M", "X", "L", "XXL", "XL"` })
        }
        else {
            const size = JSON.parse(availableSizes)
            for (let i = 0; i < size.length; i++) {
                if (!validator.isValidEnum(size[i]))
                    return res.status(400).send({ status: false, message: `${size[i]} not allowed!, Only enter Any of These ["S", "XS", "M", "X", "L", "XXL", "XL"]` })
            }
            requestBody.availableSizes = size
        }
        if (!validator.isValidBody(installments) || !validator.isValidInstallment(installments)) {
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
// =============================================  GET  API  BY  QUERY  FILTER  =========================================
const getProducts = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false } //complete object details.
        const queryParams = req.query;
        if (validator.isValidBody(queryParams)) {
            const { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams;
            //validation starts.
            if (validator.isValidBody(size)) {
                filterQuery['availableSizes'] = size
            }
            //using $regex to match the subString of the names of products & "i" for case insensitive.
            if (validator.isValidBody(name)) {
                filterQuery['title'] = {}
                filterQuery['title']['$regex'] = name
                filterQuery['title']['$options'] = 'i'
            }
            //setting price for ranging the product's price to fetch them.
            if (validator.isValidBody(priceGreaterThan)) {

                if (!(!isNaN(Number(priceGreaterThan)))) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (!Object.prototype.hasOwnProperty.call(filterQuery, 'price'))
                    filterQuery['price'] = {}
                filterQuery['price']['$gte'] = Number(priceGreaterThan)
                //console.log(typeof Number(priceGreaterThan))
            }
            //setting price for ranging the product's price to fetch them.
            if (validator.isValidBody(priceLessThan)) {

                if (!(!isNaN(Number(priceLessThan)))) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (priceLessThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (!filterQuery.hasOwnProperty('price'))
                    filterQuery['price'] = {}
                filterQuery['price']['$lte'] = Number(priceLessThan)
                //console.log(typeof Number(priceLessThan))
            }
            //sorting the products acc. to prices => 1 for ascending & -1 for descending.
            if (validator.isValidBody(priceSort)) {
                if (!((priceSort == 1) || (priceSort == -1))) {
                    return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
                }
                const products = await productModel.find(filterQuery).sort({ price: priceSort })
                console.log(products)
                if (Array.isArray(products) && products.length === 0) {
                    return res.status(404).send({ productStatus: false, message: 'No Product found' })
                }
                return res.status(200).send({ status: true, message: 'Product list', data: products })
            }
        }
        const products = await productModel.find(filterQuery)
        //verifying is it an array and having some data in that array.
        if (Array.isArray(products) && products.length === 0) {
            return res.status(404).send({ productStatus: false, message: 'No Product found' })
        }
        return res.status(200).send({ status: true, message: 'Product list', data3: products })
    }
    catch (err) {
        res.status(500).send({ status: false, message: error.message })
    }
};

// ================================ GET  PRODUCT BY  ID  ================================================

const getListById = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Enter valid Product id" })
        }
        const productList = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!productList) {
            return res.status(404).send({ status: false, message: `Product Not found With ${productId} or Product is Deleted` })
        }
        res.status(200).send({ status: false, message: "Product List", data: productList })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

// =========================  PUT  API ======================================




// ANKIT BAHI YAHAN PE  PUT  API PUSH KRO STRUCTURE KRKE  SATH  ME EXPORT BHI KR DENA



// =========================================   DELETE   PRODUCT    ============================================
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: true, message: "Invalid productId" })
        }
        const deletedProductId = await productModel.findById({ _id: productId })
        if (!deletedProductId) {
            return res.status(404).send({ status: true, message: `This ${productId} productId does not exist ` })
        }
        if (deletedProductId.isDeleted !== false) {
            return res.status(404).send({
                status: true, message: `This ${productId} productId is already Deleted `
            })
        }
        await productModel.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: moment().format() } }, { new: true })
        return res.status(200).send({ status: true, message: "Deleted Successfully" })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

module.exports = { createProduct, getProducts, deleteProduct, getListById }

