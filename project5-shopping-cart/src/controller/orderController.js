const orderModel = require("../model/orderModel")
const userModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const validator = require("../validator/validator")


const createOrder = async (req, res) => {
    try {
        const userId = req.params.userId
        const cartId = req.body.cartId

        if(!validator.isValidBody(cartId)){
            return res.status(400).send({ status: false, message: "request body is empty!" })
        }
        if(!validator.isValidObjectId(userId)){
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }

        if(!validator.isValidObjectId(cartId)){
            return res.status(400).send({ status: false, message: "Invalid card Id" })
        }

        let isUser = await userModel.findById(userId)
        if (!isUser) {
            return res.status(404).send({ status: false, message: "User not found With given Id" })
        }

        let isCart = await cartModel.findOneAndUpdate({_id:cartId}, {items:[], totalPrice:0, totalItems:0})
        if (!isCart) {
            return res.status(404).send({ status: false, message: "Cart not found With given Id" })
        }
        if(isCart.totalItems==0){
            return res.status(400).send({status:false, message:"Card does not have any Items, Can't create orders ! "})
        }
        if (userId != isCart.userId) {
            return res.status(401).send({ status: false, message: "Given cart is not belong's to given user" })
        }
        //------------ Authorization Here -------------
        if (req.loggedInUser != userId) {
            return res.status(401).send({ status: false, message: " You are Unautherize" })
        } 
        let isOrderExist = await orderModel.findOne({userId:userId})
        if(isOrderExist){
            return res.status(400).send({status:false, message:"Order is Already Placed!"})
        }
        let totalsum = 0
        let allItems = isCart.items
        const makeSum = allItems.forEach(element => {
            totalsum = totalsum + element.quantity
        });
        console.log(totalsum);

        const newOrder = {
            userId: userId,
            items: isCart.items,
            totalPrice: isCart.totalPrice,
            totalItems: isCart.totalItems,
            totalQuantity: totalsum,
            cancellable: true,
        }

        const Order = await orderModel.create(newOrder)

        res.status(200).send({ status: true, message: "Order created!", data: Order })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


// ================  update  order  =========================

const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        const orderId = req.body.orderId
        const status = req.body.status
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter valid Object id" })
        }
        if (!validator.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "Enter valid order id" })
        }
        const existUser = await userModel.findById(userId)
        if (!existUser) {
            return res.status(404).send({ status: false, message: "User not found" })
        }
        const existOrder = await orderModel.findOne({ isDeleted: false, _id: orderId })
        if (!existOrder) {
            return res.status(404).send({ status: false, message: "order not found" })
        }
        if (!validator.isValidOrderEnum(status)) {
            return res.status(400).send({ status: false, message: "Enter only any of these pending, completed, cancled" })
        }
        if (userId != existOrder.userId) {  // also  autherization
            return res.status(401).send({ status: false, message: "trying to make change by defferent user" })
        }
        if (status == "cancled") {
            if (!existOrder.cancellable) {
                return res.status(400).send({ status: false, message: "This order is not cancellable " })
            }
            if (existOrder.cancellable) {
                if (existOrder.status == status) {
                    return res.status(400).send({ status: false, message: "You can not cancle order again" })
                }
                const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false }, { status: status }, { new: true })
                return res.status(200).send({ status: true, message: "Updated status", data: updateOrder })
            }
        }
        if (existOrder.status == "completed") {
            return res.status(400).send({ status: false, message: "This order is not updatable " })
        }
        //================ Autherization  ===============
        if (req.loggedInUser != userId) {
            return res.status(401).send({ status: false, message: " You are Unautherize" })
        } 
        const updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false }, { status: status }, { new: true })
        res.status(200).send({ status: true, message: "Updated", data: updatedOrder })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

module.exports = { createOrder, updateOrder }
