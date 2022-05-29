const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const validator = require("../validator/validator")

// create cart If not Exist and Add product, if already exist Add Product Only

const cart = async (req, res)=>{
    try {
        let reqBody = req.body
        const userId = req.params.userId

        if(Object.keys(reqBody).length==0){
            return res.status(400).send({status:false, message:"Empty request body"})
        }

        const items = JSON.parse(reqBody.items)

    
        if(!validator.isValidObjectId(userId)){
            return res.status(400).send({status:false, message:"Not a valid UserId"})
        }
    
        const isUser = await userModel.findById(userId)
        if(!isUser){
            return res.status(404).send({status:false, message:"No user exist with given user Id"})
        }

        if(validator.isValidBody(items)) {
           if(validator.isValidBody(items.productId)){
               if(!validator.isValidObjectId(items.productId)){
                return res.status(400).send({ status: false, message: "Invalid Product Id" });
               }
           }
           else{
                return res.status(400).send({ status: false, message: "Product ID is Empty" });
           }
           if(items.quantity){
            //    if(typeof(items.quantity)!=Number){
                //    return res.status(400).send({ status: false, message: "Quantity is not Number Type" });
            //    }
           }
           else{
            return res.status(400).send({ status: false, message: "Quantity is not provided" });
           }
            
        }
        else{
            return res.status(400).send({ status: false, message: "Items is not given" });
        }

        const isProduct = await productModel.findOne({_id:items.productId , isDeleted:false})
        if(!isProduct){
            return res.status(404).send({status:false, message:"No Product exist with given Product Id"})
        }

        const isCartExist = await cartModel.findOne({userId:userId})  
        
        if(isCartExist){
            let count = isCartExist.totalItems + parseInt(items.quantity)
            let total = isCartExist.totalPrice + items.quantity * isProduct.price
            
            console.log(count);


            let existInCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": items.productId }, {totalPrice: total,
                $inc: {
                    
                    "items.$.quantity": items.quantity,
                },
            }, { new: true });
          
            if(existInCart){
                return res.status(200).send({status:true, message:"cart Updated", data:existInCart})
            }
            
            let updatedcart = await cartModel.findOneAndUpdate({userId:userId},
                 {$push:{items:{productId:items.productId, quantity:parseInt(items.quantity)}},
                 $inc: {
                    
                    "totalItems": +1,

                }, totalPrice:total}, {new:true})
            return res.status(200).send({status:true, message:"cart Updated", data:updatedcart})
        }
      
        let totalPrice = items.quantity* isProduct.price
    
        const newCart = {
            userId:userId,
            items:[{
                productId:items.productId,
                quantity:parseInt(items.quantity)
            }],
            totalItems: 1,
            totalPrice:totalPrice

        }
        
        const cart = await cartModel.create(newCart)
        res.status(200).send({status:true, message:" new Cart Created", data: cart})

    } catch (error) {
        console.log(error.message);
        res.status(500).send({status:false, message:error.message})   
    }
}


module.exports = {cart}