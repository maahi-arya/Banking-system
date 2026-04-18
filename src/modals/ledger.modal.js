const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger entry must be associated with an account"],
        index: true,
        immutable: true //
    },
    amount:{
        type:Number,
        required: [true, "Amount is required for creating a ledger entry"],
        immutable: true,
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "ledger entry must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type:{
        type:String,
        enum:{
            values: ["DEBIT", "CREDIT"],
            message: "Type can be either DEBIT or  CREDIT",
        },
        required: [true, "Ledger type is required"],
        immutable: true,
    }
})

function preventLedgerModification(){       //if anyone tries to update or delete a ledger entry, this function will be called to prevent the operation
    throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

ledgerSchema.pre("findOneAndUpdate",preventLedgerModification)       //A pre-hook(also called middleware) that prevents modification of ledger entries before update happens. findOneAndUpdate is a mongoose builtin method used to find a document and update it.
ledgerSchema.pre("updateOne",preventLedgerModification)
ledgerSchema.pre("deleteOne",preventLedgerModification)
ledgerSchema.pre("remove",preventLedgerModification)
ledgerSchema.pre("deleteMany",preventLedgerModification)
ledgerSchema.pre("updateMany",preventLedgerModification)
ledgerSchema.pre("findOneAndDelete",preventLedgerModification)
ledgerSchema.pre("findOneAndReplace",preventLedgerModification)

const ledgerModal = mongoose.model("ledger",ledgerSchema);

module.exports = ledgerModal;