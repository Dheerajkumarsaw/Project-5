const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const validator = require("../validator/validator")

// create cart If not Exist and Add product, if already exist Add Product Only

const createCart = async (req, res) => {
    try {
        let reqBody = req.body
        const userId = req.params.userId
        const items = JSON.parse(reqBody.items)

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Not a valid UserId" })
        }

        const isUser = await userModel.findById(userId)
        if (!isUser) {
            return res.status(404).send({ status: false, message: "No user exist with given user Id" })
        }

        if (Object.keys(reqBody).length == 0) {
            return res.status(400).send({ status: false, message: "Data should be provide" });
        }
        console.log(items)

        if (validator.isValidBody(items)) {
            if (validator.isValidBody(items.productId)) {
                if (!validator.isValidObjectId(items.productId)) {
                    return res.status(400).send({ status: false, message: "Invalid Product Id" });
                }
            }
            else {
                return res.status(400).send({ status: false, message: "Product ID is Empty" });
            }
            if (items.quantity) {
                //    if(typeof(items.quantity)!=Number){
                //    return res.status(400).send({ status: false, message: "Quantity is not Number Type" });
                //    }
            }
            else {
                return res.status(400).send({ status: false, message: "Quantity is not provided" });
            }

        }
        else {
            return res.status(400).send({ status: false, message: "Items is not given" });
        }

        const isProduct = await productModel.findOne({ _id: items.productId, isDeleted: false })
        if (!isProduct) {
            return res.status(404).send({ status: false, message: "No Product exist with given Product Id" })
        }

        const isCartExist = await cartModel.findOne({ userId: userId })

        if (isCartExist) {
            let count = isCartExist.totalItems + parseInt(items.quantity)
            let total = isCartExist.totalPrice + items.quantity * isProduct.price

            console.log(count);


            let existInCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": items.productId }, {
                totalPrice: total,
                $inc: {

                    "items.$.quantity": +1,
                },
            }, { new: true });

            if (existInCart) {
                return res.status(200).send({ status: true, message: "cart Updated", data: existInCart })
            }

            let updatedcart = await cartModel.findOneAndUpdate({ userId: userId },
                {
                    $push: { items: { productId: items.productId, quantity: parseInt(items.quantity) } },
                    totalItems: count, totalPrice: total
                }, { new: true })
            return res.status(200).send({ status: true, message: "cart Updated", data: updatedcart })
        }

        let totalPrice = items.quantity * isProduct.price

        const newCart = {
            userId: userId,
            items: [{
                productId: items.productId,
                quantity: parseInt(items.quantity)
            }],
            totalItems: items.quantity,
            totalPrice: totalPrice

        }

        const cart = await cartModel.create(newCart)
        res.status(200).send({ status: true, message: " new Cart Created", data: cart })

    } catch (error) {
        console.log(error.message);
        res.status(500).send({ status: false, message: error.message })
    }
};
// ================================  GET  CART    ==================================
const getCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid User id " })
        }
        const existUser = await userModel.findById(userId);
        if (!existUser) {
            return res.status(404).send({ status: false, message: "User Does Not Exist" })
        }
        const existCart = await cartModel.findOne({ userId: userId })
        if (!existCart) {
            return res.status(404).send({ status: false, message: `Cart Does Not Exist for this ${userId} userId` })
        }
        // if (req.loggedInUser != userId) {
        //     return res.status(401).send({ status: false, message: "Unautherize to make changes" })
        // }
        const productDetails = []
        const productsIds = existCart.items
        for (let i = 0; i < productsIds.length; i++) {
            productDetails.push(await productModel.findById(productsIds[i].productId))
        }
        // const productDetails = await productModel.find()
        //// kaise access kre ek cart me multiple product k id hoga

        res.status(200).send({ status: true, message: "Cart Summary here", data: productDetails })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

// ====================================  PUT  API  =======================================


// ANKIT BAHI YAHAN PE  PUT  API PUSH KRO STRUCTURE KRKE  SATH  ME EXPORT BHI KR DENA




//  =======================================   DELETE   CART  ================================
const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter Valid Userid" })
        }
        const existCart = await cartModel.findOne({ userId: userId });
        if (!existCart || existCart.totalItems == 0) {
            return res.status(404).send({ status: false, message: "Cart Does Not Exist Or Allready Deleted" })
        }
        // if (req.loggedInUser != userId) {
        //     return res.status(401).send({ status: false, message: "Unautrherize To Make Changes" })
        // }
        await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [0], totalItems: 0, totalPrice: 0 } }, { new: true });
        res.status(200).send({ status: false, message: "Cart Deleted SuccessFully" })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createCart, getCart, deleteCart }
