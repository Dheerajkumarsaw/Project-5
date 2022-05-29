const jwt = require("jsonwebtoken")
const userModel = require('../model/userModel')


const authentication = async function (req, res, next) {
    try {
        let token = req.headers.authorization
        if (!token) return res.status(400).send({ status: false, message: "Token not found! " })
        token = token.split(" ")[1]
         token = req.headers.authorization.split(" ")[1]
        // console.log(token)

        const decodedToken = jwt.verify(token, "weAreIndians", function (err, payload) {
            if (err) {
                return res.status(401).send({ status: false, message: err })
            } else {
                req.loggedInUser = payload.userId
                next();
            }
        })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { authentication }
