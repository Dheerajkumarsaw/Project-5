const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")
const MW = require('../middleware/auth');
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")

//Feature I - User's Api
router.post("/register", userController.createUser);

router.post("/login", userController.loginUser)

router.get("/user/:userId/profile", MW.authentication, userController.getUser)

router.put("/user/:userId/profile", MW.authentication, userController.updateUser)


//Feature II - Product's Api
router.post("/products", productController.createProduct);

router.get("/products", productController.getByQueryFilter)

router.get("/products/:productId", productController.getProductById)

router.put("/products/:productId", productController.updateProduct)

router.delete("/products/:productId", productController.deleteProduct)


//Feature III - Cart's Api

router.post("/users/:userId/cart", MW.authentication, cartController.createCart)

router.get("/users/:userId/cart", MW.authentication, cartController.getCart)

router.put('/users/:userId/cart', MW.authentication, cartController.updateCart)

router.delete("/users/:userId/cart", MW.authentication, cartController.deleteCart)

//Feature IV - Order's Api

router.post("/users/:userId/orders", MW.authentication, orderController.createOrder)

router.put("/users/:userId/orders", MW.authentication, orderController.updateOrder)

module.exports = router