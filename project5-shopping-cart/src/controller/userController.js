const userModel = require("../model/userModel");
const validator = require("../validator/validator")
const bcrypt = require("bcrypt");
const router = require("../route/route");

//----------------------PUT Api's------------------------
const updateUser = async function(req, res){
    try{
        const requestBody = req.body
        const userId = req.params.userId
        let newData = {}
        //-------------Empty Validation------------
        if(Object.keys(requestBody).length==0){
            return res.status(400).send({status: false, message:"Please fill areas to update"})
        }
        //Destructuring
        const {fname, lname, email, phone,address, password} = requestBody

        //-----------validation-------------
        if(validator.isValidBody(fname)){
            if(!validator.isValidName(fname))return res.status(400).send({status: false, message:"Please Enter a valid First Name"})
            newData['fname'] = fname
        }
        if(validator.isValidBody(lname)){
            if(!validator.isValidName(lname))return res.status(400).send({status: false, message:"Please Enter a valid Last Name"})
            newData['lname'] = lname
        }
        if(validator.isValidBody(email)){
            if(!validator.isValidEmail(email))return res.status(400).send({status: false, message:"Please Enter a valid Email ID"})
            newData['email'] = email
        }
        if(validator.isValidBody(phone)){
            if(!validator.isValidName(phone))return res.status(400).send({status: false, message:"Please Enter a valid phone numbe"})
            newData['phone'] = phone
        }
        if(validator.isValidBody(password)){
            if(!validator.isValidPass(password))return res.status(400).send({status: false, message:"Please Enter a valid Password, would have min 8 and max 15 characters"})
            newData['password'] = password
        }
//-----------------address's Input and validation check-------------------
        if (validator.isValidBody(address)){
            const parsedAddress = JSON.parse(address) // Parsing to object form

            if(address.shipping.street){
                newData.address.shipping['street'] = parsedAddress.shipping.street
            }
            if(address.shipping.city){
                if(!validator.isValidName(address.shipping.city)) return res.status(400).send({status: false, message:"Please Enter a valid City"})
                newData.address.shipping['city'] = parsedAddress.shipping.city
            }
            if(address.shipping.pincode){
                if(!validator.isValidPin(address.shipping.pincode))return res.status(400).send({status: false, message:"Please Enter a valid Pin Code"})
                newData.address.shipping['pincode'] = parsedAddress.shipping.pincode
            }

            if(address.billing.street){
                newData.address.billing['street'] = parsedAddress.billing.street
            }
            if(address.billing.city){
                if(!validator.isValidName(address.billing.city)) return res.status(400).send({status: false, message:"Please Enter a valid City"})
                newData.address.billing['city'] = parsedAddress.billing.city
            }
            if(address.billing.pincode){
                if(!validator.isValidPin(address.billing.pincode))return res.status(400).send({status: false, message:"Please Enter a valid Pin Code"})
                newData.address.billing['pincode'] = parsedAddress.billing.pincode
            }
        }

        //--------Authentication here-----------

        //---------Already Exixts for phone and email data --DB Check-----

        //---------updation perform in DB-------------

    }
    catch(err){
        res.status(500).send({status: false, Error:err.message})
    }
}
module.exports ={updateUser}