const productModel = require("../model/productModel")
const validator = require("../validator/validator")


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
    
        return res.status(200).send({status:true, message:"Success", data:isProductExist})
        
    } catch (error) {
        res.status(500).send({status:false, message:error.message})
    }
}


module.exports={getProductById}