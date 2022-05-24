const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController")

router.put('/user/:userId/profile',UserController.updateUser )

module.exports = router