const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const validator = require("../validator/validator")
const userModel = require("../model/userModel")
const mongoose = require("mongoose")

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
        // Autherization
        const updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false }, { status: status }, { new: true })
        res.status(200).send({ status: true, message: "Updated", data: updatedOrder })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

module.exports = { updateOrder }
