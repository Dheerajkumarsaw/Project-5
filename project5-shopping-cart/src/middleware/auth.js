const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken")

// const authentication = async function (req, res, next) {
//     try {
//         const token = req.headers.authorization.split(" ")[1]
//         if (!token) {
//             return res.status(400).send({ status: false, message: "Token should be Presenet" })
//         }
//         const decode = jwt.verify(token, "weAreIndians");
//         if (!decode) {
//             return res.status(401).send({ status: false, message: "Unauthenticate to Make Changes" })
//         }
//         req.loggedIdUser = decode.userId
//         next()
//     }
//     catch (error) {

//     }
// };

// module.exports = { authentication }