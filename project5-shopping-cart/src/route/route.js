const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")
const MW = require('../middleware/auth');
const productController = require("../controller/productController")


router.post("/register", userController.createUser);

router.post("/login", userController.loginUser)

router.get("/user/:userId/profile", MW.authentication, userController.getUser)

router.put("/user/:userId/profile", MW.authentication, userController.updateUser)

router.post("/products", productController.createProduct);

module.exports = router