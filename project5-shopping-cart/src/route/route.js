const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")

router.get("/user/:userId/profile", userController.getUser)

module.exports = router