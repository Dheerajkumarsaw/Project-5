const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        ref:"product",
        required:true
    },
    items:[{
        productId:{
            type:ObjectId,
            ref:"product",
            required:true
        },
        quantity:{
            type:Number,
            min:1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    totalItems: {
        type: Number,
        required: true
    },
    totalQuantity:{
        type:Number,
        required:true
    },
    cancellable:{
        type:boolean, 
        default:true
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending", "completed", "cancled"]
    },
    deletedAt:{
        type:Date(),
        default:null
    },
    isDeleted:{
        type:boolean,
        defaultL:false
    }

},
{
    timestamps:true
})

module.exports = mongoose.Schema("order", orderSchema)