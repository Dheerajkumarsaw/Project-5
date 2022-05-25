const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")
const MW = require('../middleware/auth')

router.put("/user/:userId/profile",userController.updateUser)

router.post("/register", userController.createUser);

router.post("/login", userController.loginUser)

router.get('/auth', MW.authentication)

module.exports = router