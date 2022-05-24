const userModel = require("../model/userModel");
const validator = require("../validator/validator")
const bcrypt = require("bcrypt")

const getUser = async (req, res)=>{
    try {
        const userId = req.params.userId
    
        if(!validator.isValidObjectId(userId)){
            return res.status().send({status:false, message:"Invalid UserId"})
        }

        const isUserExist = await userModel.findById(userId)

        if(!isUserExist){
            return res.status(404).send({status:false, message:"User Not Found!"})
        }

        return res.status(200).send({status:true, data:isUserExist})
        
    } catch (error) {
        res.status(500).send({error:error.message})
    }
}

module.exports = {getUser}