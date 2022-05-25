const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")

router.put("/user/:userId/profile",userController.updateUser)

router.post("/register", userController.createUser);

module.exports = router