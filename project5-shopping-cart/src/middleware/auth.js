const jwt = require("jsonwebtoken")
const userModel = require('../model/userModel')


const authentication = async function(req, res, next){
    try{
        const token = req.headers.authorization.split(" ")[1]
        console.log(token)
        if(!token) return res.status(400).send({status: false, message:"Token not found! "})

        const decodedToken = jwt.decode(token, "weAreIndians")
        if(!decodedToken) return res.status(401).send({status: false, message: "you are not Authenticated !"})

        req.loggedInUser = decodedToken.userId
        
        next();

    }catch(err){
        res.status(500).send({status:false, message: err.message})
    }
}
module.exports = {authentication}