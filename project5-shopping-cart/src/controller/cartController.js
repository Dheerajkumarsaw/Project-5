//  -----------------------     GET  API   ----------------------------------

const getList = async function (req, res) {
    try {
        const requestParams = req.query;
        const filter = { isDeleted: false };
        if (requestParams) {

        }
        const productList = await productModel.find(filter)
        res.status(200).send({ status: true, message: "Product List", data: productList })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

//-----------------------------     GET  API  BY PRODUCTID      ---------------------------------------

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

//-----------------------------------------   UPDATE  PRODUCT   --------------------------

const updateProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        const updateFeilds = req.body;
        const requestFiles = req.files;
        const filter = {}
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Enter valid Product Id" })
        }
        if (updateFeilds && requestFiles.length == 0) {
            return res.status(400).send({ status: false, message: "You have to enter Atleast one Field to update" })
        }
        if (updateFeilds) {
            const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = updateFeilds
        }
        if (requestFiles.length != 0) {
            const uploadedURL = await saveFile.uploadFiles(requestFiles[0])
            filter["productImage"] = uploadedURL
        }

        // exist  db call
        const existProduct = await productModel.findOne({ isDeleted: false, _id: productId });
        if (!existProduct) {
            return res.status(404).send({ status: false, message: "Product not found or Deleted" })
        }
        const updatedProduct = await productModel.findByIdAndUpdate(productId, filter, { new: true }) ///doubt  to  use fdByidAndUpdate
        res.status(200).send({ status: true, message: "Updated Docs", data: updatedProduct })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

//  -------------------------------------   DELETE  API     -------------------------------------

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Enter valid Product Id" })
        }
        const existProduct = await productModel({ _id: productId, isDeleted: false });
        if (!existProduct) {
            return res.status(404).send({ status: false, message: "Product Not Found or Allreadey Deletd" })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}