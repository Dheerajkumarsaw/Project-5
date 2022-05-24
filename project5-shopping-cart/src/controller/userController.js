const userModel = require("../model/userModel");
const validator = require("../validator/validator")
const bcrypt = require("bcrypt");
const saveFile = require("../aws/aws-s3")

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

module.exports = { createUser }