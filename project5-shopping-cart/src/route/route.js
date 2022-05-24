const express = require("express");
const router = express.Router();
//<<<<<<< HEAD
const UserController = require("../controller/userController")

router.put('/user/:userId/profile',UserController.updateUser )
//=======
const userController = require("../controller/userController");


router.post("/register", userController.createUser);

//>>>>>>> 7818793279185d0458a444147f7fa1302c9e090a

module.exports = router