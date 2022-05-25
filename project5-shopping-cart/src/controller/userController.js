const userModel = require("../model/userModel");
const validator = require("../validator/validator")
const bcrypt = require("bcrypt");
const saveFile = require("../aws/aws-s3");
const jwt = require("jsonwebtoken")

//----------------------PUT Api's------------------------
const updateUser = async function (req, res) {
    try {
        const requestBody = req.body
        const userId = req.params.userId
        let newData = {}
        //---------------dB call for UserID check-----------------
        const userCheck = await userModel.findOne({ _id: userId })
        if (!userCheck) return send.status(404).send({ status: true, message: "No user found by User Id given in path params" })

        //-------------Empty Validation------------
        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, message: "Please fill areas to update" })
        }
        //-------------Destructuring--------------
        const { fname, lname, email, phone, address, password } = requestBody

        //-----------validation-------------
        if (validator.isValidBody(fname)) {
            if (!validator.isValidName(fname)) return res.status(400).send({ status: false, message: "Please Enter a valid First Name" })
            newData['fname'] = fname
        }
        if (validator.isValidBody(lname)) {
            if (!validator.isValidName(lname)) return res.status(400).send({ status: false, message: "Please Enter a valid Last Name" })
            newData['lname'] = lname
        }
        if (validator.isValidBody(email)) {
            if (!validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "Please Enter a valid Email ID" })
            newData['email'] = email
        }
        if (validator.isValidBody(phone)) {
            if (!validator.isValidName(phone)) return res.status(400).send({ status: false, message: "Please Enter a valid phone numbe" })
            newData['phone'] = phone
        }
        if (validator.isValidBody(password)) {
            if (!validator.isValidPass(password)) return res.status(400).send({ status: false, message: "Please Enter a valid Password, would have min 8 and max 15 characters" })
            newData['password'] = password
        }
        //-----------------address's Input and validation check-------------------
        if (validator.isValidBody(address)) {
            const parsedAddress = JSON.parse(address) // Parsing to object form

            if (parsedAddress.shipping.street) {
                newData.address.shipping['street'] = parsedAddress.shipping.street
            }
            if (parsedAddress.shipping.city) {
                if (!validator.isValidName(parsedAddress.shipping.city)) return res.status(400).send({ status: false, message: "Please Enter a valid City" })
                newData.address.shipping['city'] = parsedAddress.shipping.city
            }
            if (parsedAddress.shipping.pincode) {
                if (!validator.isValidPin(parsedAddress.shipping.pincode)) return res.status(400).send({ status: false, message: "Please Enter a valid Pin Code" })
                newData.address.shipping['pincode'] = parsedAddress.shipping.pincode
            }

            if (parsedAddress.billing.street) {
                newData.address.billing['street'] = parsedAddress.billing.street
            }
            if (parsedAddress.billing.city) {
                if (!validator.isValidName(parsedAddress.billing.city)) return res.status(400).send({ status: false, message: "Please Enter a valid City" })
                newData.address.billing['city'] = parsedAddress.billing.city
            }
            if (parsedAddress.billing.pincode) {
                if (!validator.isValidPin(parsedAddress.billing.pincode)) return res.status(400).send({ status: false, message: "Please Enter a valid Pin Code" })
                newData.address.billing['pincode'] = parsedAddress.billing.pincode
            }
        }
        //--------Authentication here-----------

        //---------Already Exixts for phone and email data --DB Check-----
        const doublicateCheck = await userModel.find({ $or: { email: email, phone: phone } })
        if (doublicateCheck) return res.status(400).send({ status: false, message: "Please Check wheather phone number and email Id already exists" })

        //---------updation perform in DB-------------
        const updatething = await findOneAndUpdate({ _id: userId }, newData, { new: true })
        return res.status(200).send({ status: true, message: "user profile updated", data: updatething })
    }
    catch (err) {
        res.status(500).send({ status: false, Error: err.message })
    }
}

//------------------Create User---------------------
const createUser = async function (req, res) {
    try {
        const requestBody = req.body;
        const requestFiles = req.files;
        //   IF  BODY  IS   EMPATY
        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, message: "Data should be provide" });
        }
        if (!validator.isValidBody(requestBody.address)) {
            return res.status(400).send({ status: false, message: "Enter Address Details" });
        }
        const address = JSON.parse(requestBody.address); // parsing  

        //   IF  FILE  IS   EMPTY
        if (!validator.isValidBody(requestFiles) || requestFiles.length === 0) {
            return res.status(400).send({ status: false, message: "Profile image Should be Provided" });
        }
        const { fname, lname, email, phone, password } = requestBody; // DESTRUCTURING
        // ===============================    VALIDATIONS    =====================================
        if (!validator.isValidBody(fname)) {
            return res.status(400).send({ status: false, message: "Enter Name first" });
        }
        if (!validator.isValidBody(lname)) {
            return res.status(400).send({ status: false, message: "Enter Last Name" })
        }
        if (!validator.isValidBody(email) || !validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Enter Email should be valid Formate" })
        }
        if (!validator.isValidBody(phone) || !validator.isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "Enter Phone No Should be Valid" })
        }
        if (!validator.isValidBody(password) || !validator.isValidPass(password)) {
            return res.status(400).send({ status: false, message: "Enter Password" });
        }
        // =============================     SHIPPING  ADDRESS  VALIDATIONS    ================================
        if (!validator.isValidBody(address.shipping)) {
            return res.status(400).send({ status: false, message: "Enter Shiping Address" })
        }
        if (!validator.isValidBody(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "Enter Shiping Street Address" })
        }
        if (!validator.isValidBody(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Enter Shiping city Address" })
        }
        if (!validator.isValidBody(address.shipping.pincode) || !validator.isValidPin(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Enter Shiping Address Pincode ,Should be 6 digits only" })
        }
        //  ===========================     BILLING  ADDRESS VALIDATION    ===============================
        if (!validator.isValidBody(address.billing)) {
            return res.status(400).send({ status: false, message: "Enter Billing Address" })
        }
        if (!validator.isValidBody(address.billing.street)) {
            return res.status(400).send({ status: false, message: "Enter Billing Street Address" })
        }
        if (!validator.isValidBody(address.billing.city)) {
            return res.status(400).send({ status: false, message: "Enter Billing city Address" })
        }
        if (!validator.isValidBody(address.billing.pincode) || !validator.isValidPin(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Enter Billing Address Pincode ,Should be 6 digits only" })
        }
        //  UNIQENESS  VALIDATIONS 
        const existEmail = await userModel.findOne({ email: email });
        if (existEmail) {
            return res.status(400).send({ status: false, message: " Email Allready Exist Use different" });
        }
        const existPhone = await userModel.findOne({ phone: phone });
        if (existPhone) {
            return res.status(400).send({ status: false, message: "Phone no Allready Exist Use Different" })
        }
        //   ================   PASSWORD  HASHING   ====================
        const hashPassword = await bcrypt.hash(password, 10);
        requestBody.password = hashPassword  //SAVING FOR  CREATE DOCS
        //   =================   AWS  S3  URL  CREATION  ADN  SAVING FILE  IN AWS  ===========================
        const uploadedURL = await saveFile.uploadFiles(requestFiles[0])
        // console.log(uploadedURL)
        requestBody.profileImage = uploadedURL //SAVING FOR  CREATE DOCS
        requestBody.address = address  //SAVING FOR  CREATE DOCS
        //   DOCS  CFREATION  IN DB
        const userCreated = await userModel.create(requestBody);
        res.status(201).send({ status: true, message: "Successfullly created", data: userCreated })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};

const loginUser = async function (req, res) {
    try {
        const loginDetails = req.body;
        //  if body is empty
        if (Object.keys(loginDetails).length == 0) {
            return res.status(400).send({ status: false, message: "Enter Login Cridentials" })
        }
        const { email, password } = loginDetails; // destructuring
        if (!validator.isValidBody(email) || !validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Enter Email should be valid" })
        }
        if (!validator.isValidBody(password) || !validator.isValidPass(password)) {
            return res.status(400).send({ status: false, message: "Enter Password Should be valid" })
        }
        const existUser = await userModel.findOne({ email: email });
        if (!existUser) {
            return res.status(401).send({ status: false, message: "Unautherize to Login Register First" })  // status code doubt
        }
        const matchPass = await bcrypt.compare(password, existUser.password);
        if (!matchPass) {
            return res.status(400).send({ status: false, message: "You Entered Wrong password" })
        }
        //   token creation
        const token = jwt.sign({
            userId: existUser._id,
            group: "group20",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, "weAreIndians")
        res.status(200).send({ status: true, message: " User Login Successfull", data: { userId: existUser._id, token: token } })
    }
    catch (error) {

    }
}

module.exports = { createUser, loginUser, updateUser }
