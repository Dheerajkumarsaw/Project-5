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




// GET  PRODUCT BY  ID 

const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product Id" })
        }

        const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!isProductExist) {
            return res.status(404).send({ status: false, message: "Product Not found! or Already Deleted" })
        }

        return res.status(200).send({ status: true, message: "Product", data: isProductExist })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//Update Product by filter
const getByQueryFilter = async function (req, res) {
    try {
        const filter = { isDeleted: false };
        const queryFilter = req.query;
        let filteredList
        if (Object.keys(queryFilter).length != 0) {
            const { size, name, priceLessThan, priceGreaterThan, priceSort } = queryFilter
            if ("size" in queryFilter) {
                const sizeParse = JSON.parse(size)
                for (let i = 0; i < sizeParse.length; i++) {
                    if (!validator.isValidEnum(sizeParse[i])) {
                        return res.status(400).send({ status: false, message: `${sizeParse[i]} not Allowed Only These S,XS,M,X,L,XXL,XL are allowed` })
                    }
                }
                filter["availableSizes"] = sizeParse
            }
            if ("name" in queryFilter) {
                if (!validator.isValidBody(name)) {
                    return res.status(400).send({ status: false, message: "Enter valid name" })
                }
                filter["title"] = {}
                filter["title"]["$regex"] = name
                filter["title"]["$options"] = "i"
            }
            if ("priceLessThan" in queryFilter && "priceGreaterThan" in queryFilter) {
                if (!validator.isValidDeciNum(priceLessThan) || !validator.isValidDeciNum(priceGreaterThan)) {
                    return res.status(400).send({ status: false, message: "Enter priceLessThan or priceGreaterThan only Number" })
                }
                filter["price"] = {}
                filter["price"]["$gt"] = priceGreaterThan;
                filter["price"]["$lt"] = priceLessThan
            }
            else {
                if ("priceGreaterThan" in queryFilter) {
                    if (!validator.isValidBody(priceGreaterThan)) {
                        return res.status(400).send({ status: false, message: "Enter priceGreateThan only Number" })
                    }
                    filter["price"] = {}
                    filter["price"]["$gt"] = priceGreaterThan
                }
                if ("priceLessThan" in queryFilter) {
                    if (!validator.isValidBody(priceLessThan)) {
                        return res.status(400).send({ status: false, message: "Enter priceLessThan only Number" })
                    }
                    filter["price"] = {}
                    filter["price"]["$lt"] = priceLessThan
                }
            }
        }
        // -----------------------    FOR   SORTING  DOCS  ACCORDING TO reqPriceSort  --------------------------
        if ("priceSort" in queryFilter) {
            if (queryFilter.priceSort != -1 && queryFilter.priceSort != 1)
                return res.status(400).send({ status: false, message: "Enter pricesort only -1 or 1" })
            // filter["priceSort"] = priceSort
            filteredList = await productModel.find(filter).sort({ price: queryFilter.priceSort });
        } else {
            filteredList = await productModel.find(filter)//.sort({ price: queryFilter.priceSort });
        }
        //  ======== DB CALL =======
        if (filteredList.length == 0) {
            return res.status(404).send({ status: false, message: "No Document found for the given Filteration" })
        }
        res.status(200).send({ status: true, message: "product list", data: filteredList })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//=================PUT API=========================
const updateProduct = async function (req, res) {
    try {
        const requestBody = req.body
        const productId = req.params.productId
        const file = req.files
        let newData = {}
        console.log(file)

        //-------------dB call for product existance--------------------
        const productCheck = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productCheck) return res.status(404).send({ status: true, message: "No product found by Product Id given in path params" })

        //-----------------Empty Body check------------------
        if (Object.keys(requestBody).length == 0 && !validator.isValidBody(file)) {
            return res.status(400).send({ status: false, message: "Please fill at least one area to update" })
        }
        if (Object.keys(requestBody).length > 0) {
            //-----------------------Destructuring------------------------
            const { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, installments, isDeleted } = requestBody

            //-------------------Deleted Denied---------------------
            if (validator.isValidBody(isDeleted)) return res.status(400).send({ status: false, message: "You are not allowed to perform delete updation in 'Update API', you need to hit Delete API" })

            // ------------------Title-------------------------
            if (validator.isValidBody(title)) {

                const titleExist = await productModel.findOne({ title: title }) // DB call for title existance
                console.log(titleExist);
                if (titleExist) return res.status(400).send({ status: false, message: "This 'title' name already existes!" })

                if (!validator.isValidName(title)) return res.status(400).send({ status: false, message: "Please Enter a valid title should contain at least 2 characters for word formation" })
                newData['title'] = title
            }

            //------------------Description-------------------
            if (validator.isValidBody(description)) {
                if (!validator.isValidName(description)) return res.status(400).send({ status: false, message: "Please Enter a valid description, should contain at least 2 characters for word formation" })
                newData['description'] = description
            }
            //------------------Price-------------------
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

            //-----------------Style-----------------------
            if (validator.isValidBody(style)) {
                if (!validator.isValidName(style)) return res.status(400).send({ status: false, message: "Please Enter a valid style, should contain at least 2 characters for word formation" })
                newData['style'] = style
            }
            //--------------Available Sizes------------------
            if (requestBody.availableSizes) {
                if (validator.isValidBody(requestBody.availableSizes)) {
                    let availableSizes = JSON.parse(requestBody.availableSizes)
                    for (let i = 0; i < availableSizes.length; i++) {
                        if (!validator.isValidEnum(availableSizes[i])) {
                            return res.status(400).send({ status: false, message: `${availableSizes[i]} not allowed!, Please enter Any of ["S", "XS", "M", "X", "L", "XXL", "XL"]` })
                        }
                    }console.log(availableSizes)
                    newData["availableSizes"]= availableSizes
                }
            }
            //-----------------Installments-----------------
            if (validator.isValidBody(installments)) {
                if (!validator.isValidInstallment(installments)) return res.status(400).send({ status: false, message: "Please Enter a valid installments, upto 99 months and in 2 digits support only" })
                newData['installments'] = installments
            }
        }
        //------------------file URL----------------------
        if (!validator.isValidBody(file) && file===[]) {
            if(Object.keys(file).length==0){
                return res.status(400).send({status: false, message:"Please select a pic to upload as profile Picture"})
            }
            else{
            const uploadedURL = await saveFile.uploadFiles(file[0])
            newData['productImage'] = uploadedURL
            }
        }


        // //--------------Check for existed name------------
        // const exixtCheck = await productModel.find({ title: title })
        // if (exixtCheck) return res.status(400).send({ status: true, message: "Entered 'title' already exists, Please select another title name" })


        //---------------Updating things---------------
        const updatething = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            {$set: newData },
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

module.exports = { createProduct, getProductById, getByQueryFilter, updateProduct, deleteProduct }
// module.exports = {createProduct, getSpecificProduct, getProductById, updateProduct, deleteProduct}

