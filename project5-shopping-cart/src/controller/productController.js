const productModel = require("../model/productModel")
const validator = require("../validator/validator")
const saveFile = require("../aws/aws-s3")
const moment = require("moment");

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
}
// get product by filter
const getSpecificProduct = async function (req, res) {
    try {
        let data = { isDeleted: false }
        let queryDataSize = req.query.size;
        if (queryDataSize) {
            if (!(validator.isValidBody(queryDataSize)) && (validator.isValidEnum(queryDataSize))) {
                return res.status(400).send({ status: false, message: "plz Enter a valid Size" })
            }
            if (!(validator.isValidSize(queryDataSize))) {
                return res.status(400).send({ status: false, message: "Please Provide Available Sizes from S,XS,M,X,L,XXL,XL" })
            }
            data["availableSizes"] = queryDataSize.trim();
        }
        let name = req.query.name;
        if (name) {
            if (!validator.isValid(name)) {
                return res.status(400).send({ status: false, message: "plz enter a valid name" })
            }
            data["title"] = { $regex: name.trim() }
        }
        let priceGreaterThan = req.query.priceGreaterThan;
        if (priceGreaterThan) {
            if (!validator.isValid(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "plz enter a valid name" })
            }
            data["price"] = {
                $gte: priceGreaterThan
            }
        }
        let priceLessThan = req.query.priceLessThan;
        if (priceLessThan) {
            if (!validator.isValid(priceLessThan)) {
                return res.status(400).send({ status: false, message: "plz enter a valid name" })
            }
            data["price"] = {
                $lte: priceLessThan
            }
        }
        if (priceLessThan && priceGreaterThan) {
            if (!validator.isValid(priceLessThan)) {
                return res.status(400).send({ status: false, message: "plz enter a valid price" })
            }
            if (!validator.isValid(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "plz enter a valid price" })
            }
            data["price"] = { $lte: priceLessThan, $gte: priceGreaterThan }

        }
        let filerProduct = await productModel.find(data).sort({ price: req.query.priceSort })
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
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};


// GET  PRODUCT BY  ID 

const getProductById = async (req,res)=>{
    try {
        const productId  = req.params.productId
    
        if(!validator.isValidObjectId(productId)){
            return res.status(400).send({status:false, message:"Invalid product Id"})
        }
    
        const isProductExist = await productModel.findById(productId)
    
        if(!isProductExist){
            return res.status(404).send({status:false, message:"Product Not found!"})
        }
    
        return res.status(200).send({status:true, message:"Product", data:isProductExist})
        
    } catch (error) {
        res.status(500).send({status:false, message:error.message})
    }
}

//Update Product by Id

const updateProduct = async function (req, res) {
    try {
        const requestBody = req.body
        const productId = req.params.productId
        const file = req.files
        let newData = {}
        console.log(Object.keys(requestBody), file)

        //-------------dB call for product existance--------------------
        const productCheck = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productCheck) return res.status(404).send({ status: true, message: "No product found by Product Id given in path params" })

        //-----------------Empty Body check------------------
        if (requestBody && !file) {
            return res.status(400).send({ status: false, message: "Please fill at least one area to update" })
        }
        //-----------------------Destructuring------------------------
        const { title, description, price, currencyId, currencyFormat, isFreeShipping,availableSizes, productImage, style, installments, isDeleted } = requestBody

        //-------------------Deleted Denied---------------------
        if (validator.isValidBody(isDeleted)) return res.status(400).send({ status: false, message: "You are not allowed to perform delete Operation in update API, you need to hit Delete API" })

        // ------------------validation-------------------------
        if (validator.isValidBody(title)) {

            const titleExist = await productModel.findOne({ title: title }) // DB call for title existance
            console.log(titleExist);
            if (titleExist) return res.status(400).send({ status: false, message: "This 'title' name already existes!" })

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
        //-------response for no need to update things-------
        if (currencyId) return res.status(400).send({ status: false, message: "Currency Id doesn't need to update, because it has only 'INR'(indian rupee) Option, fill other fields besides" })

        if (currencyFormat) return res.status(400).send({ status: false, message: "Currency Format doesn't need to update, because it has only One symbol, fill other fields besides" })
        //---------------isFreeShopping-----------------
        if (validator.isValidBody(isFreeShipping)) {
            if (!validator.isValidBoolean(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping needs to be a Boolean" })
            newData['isFreeShipping'] = isFreeShipping
        }
        //------------------file URL----------------------
        if (file.length > 0) {
            const uploadedURL = await saveFile.uploadFiles(file[0])
            newData['productImage'] = uploadedURL
        }
        //-----------------Style-----------------------
        if (validator.isValidBody(style)) {
            if (!validator.isValidName(style)) return res.status(400).send({ status: false, message: "Please Enter a valid style, should contain at least 2 characters for word formation" })
            newData['style'] = style
        }
        //--------------Available Sizes------------------
        if(requestBody.availableSizes){
        if (validator.isValidBody(requestBody.availableSizes)) {
            let availableSizes = JSON.parse(requestBody.availableSizes)
            for (let i = 0; i < availableSizes.length; i++) {
                if (!validator.isValidEnum(availableSizes[i])) {
                    return res.status(400).send({ status: false, message: `${availableSizes[i]} not allowed!, Please enter Any of ["S", "XS", "M", "X", "L", "XXL", "XL"]` })
                }
            }
        }}
        //-----------------Installments-----------------
        if (validator.isValidBody(installments)) {
            if (!validator.isValidInstallment(installments)) return res.status(400).send({ status: false, message: "Please Enter a valid installments, upto 99 months and in 2 digits support only" })
            newData['installments'] = installments
        }

        //--------------Check for existed name------------
        const exixtCheck = await productModel.findOne({ title: title })
        if (exixtCheck) return res.status(400).send({ status: true, message: "Entered 'title' already exists, Please select another title name" })


        //---------------Updating things---------------
        const updatething = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { newData, $set: { availableSizes } },
            { new: true })
        // const updatething = await productModel.findOneAndUpdate(
        //     {_id:productId, isDeleted: false},
        //     {newData,$addToset: {availableSizes}},
        //     {new: true})
        res.status(200).send({ status: true, message: "Success", data: updatething })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};


// =========================================   DELETE   PRODUCT    ============================================
const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Enter valid Object id" })
        }
        const existProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true });
        if (!existProduct) {
            return res.status(404).send({ status: false, message: "Product not found or Allready Deleted" })
        }
        res.status(200).send({ status: false, message: "Product Deleted SuccessFully", data: existProduct })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createProduct, getProducts, deleteProduct, getProductById , updateProduct, getSpecificProduct }
// module.exports = {createProduct, getSpecificProduct, getProductById, updateProduct, deleteProduct}

