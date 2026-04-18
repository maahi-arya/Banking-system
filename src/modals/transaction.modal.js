const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true,"transaction must be associated with a from account"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true,"transaction must be associated with a from account"],
        index: true

    },
    status:{
        type:String,
        enum:{
            values:[ "PENDING", "COMPLETED", "FAILED", "REVERSED" ],
            message: "status can be either PENDING, COMPLETED, FAILED OR REVERSED",
        },
        default:"PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for a transaction"],
        min: [0, "Transaction cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required: [true, "IdempotencyKey is required for a transaction"],
        unique: true,
        index: true,
    }
},{
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel