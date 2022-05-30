const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const ordrModel = require("../model/orderModel")


const createOrder = async (req, res)=>{
    try {
        const userId = req.params.userId
        const product = req.body
    
        let isUser = await userModel.findById(userId)
        if(!isUser){
            return res.status(404).send({status:false, message:"User not found With given Id"})
        }

        let isCart = await cartModel.findById(product.Id)
        if(!isCart){
            return res.status(404).send({status:false, message:"Product not found With given Id"})
        }

        if(userId != isCart.userId){
            return res.status(400).send({status:false, message:"Given cart is not belong's to given user"})
        }
        
    } catch (error) {
        res.
    }
}