const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const route = require("./route/route")

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any());

mongoose.connect("mongodb+srv://dheerubhai2000:gqG*2JVkTEt5T*G@cluster0.hk6qb.mongodb.net/group20Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDB is connected"))
    .catch(err => console.log(err.message))

app.use("/", route)

app.listen(process.env.PORT || 3000, function () {
    console.log("Express app is Running on port ", (process.env.PORT || 3000))
});