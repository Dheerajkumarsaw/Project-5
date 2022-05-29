const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")
const MW = require('../middleware/auth');
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")

//Feature I - User's Api
router.post("/register", userController.createUser);

router.post("/login", userController.loginUser)

router.get("/user/:userId/profile", MW.authentication, userController.getUser)

router.put("/user/:userId/profile", MW.authentication, userController.updateUser)


//Feature II - Product's Api
router.post("/products", productController.createProduct);

router.get("/products", productController.getProducts)

router.get("//products/:productId", productController.getListById)

// yahan  put api banao

router.delete("/products/:productId", productController.deleteProduct)


//Feature III - Cart's Api

router.post("/users/:userId/cart", cartController.createCart)

router.get("/users/:userId/cart", cartController.getCart)

// yahan  put api banao
// 

router.delete("/users/:userId/cart", cartController.deleteCart)

module.exports = router