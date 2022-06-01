const orderModel = require("../model/orderModel")
const userModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const validator = require("../validator/validator")


const createOrder = async (req, res) => {
    try {
        const userId = req.params.userId
        const cart = req.body

        if(!validator.isValidBody(cart)){
            return res.status(400).send({ status: false, message: "request body is empty!" })
        }
        if(!validator.isValidObjectId(userId)){
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }

        if(!validator.isValidObjectId(cart.id)){
            return res.status(400).send({ status: false, message: "Invalid card Id" })
        }

        let isUser = await userModel.findById(userId)
        if (!isUser) {
            return res.status(404).send({ status: false, message: "User not found With given Id" })
        }

        let isCart = await cartModel.findOneAndUpdate({_id:cart.id}, {items:[], totalPrice:0, totalItems:0})
            console.log(isCart)
        if (!isCart) {
            return res.status(404).send({ status: false, message: "Cart not found With given Id" })
        }

        if (userId != isCart.userId) {
            return res.status(401).send({ status: false, message: "Given cart is not belong's to given user" })
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


module.exports = { createOrder }