const mongoose = require("mongoose");
const ledgerModal = require("../modals/ledger.modal")

const accountSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: [true, "Account must be associated with a user"],
        index: true            //there can be many users in database and each user can have multiple accounts so for fast searching we use index(based on b+ tree)
    },
    status:{
        type:String,
        enum: {
            values:["ACTIVE", "FROZEN", "CLOSED"],       //frozen means didnt closed account but not using
            message: "status can be either ACTIVE, FROZEN or CLOSED", 
        },
        default: "ACTIVE"
    },
    currency:{
        type:String,
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    },
    // balance:{     //why balance cant be used in databases

    // }
}, {
    timestamps: true
})

accountSchema.index({user:1, status:1})               //we can easily find user on the basis of status---> when we create index on the basis of 2 fields we called as compound index --->why we write accountSchema.index because we want to create index on the basis of user and status to find acctive accounts of user

accountSchema.methods.getBalance = async function(){        //meaning of this line is every account created from this schema will have this function and we can call this function on any account to get balance of that account
    const balanceData = await ledgerModal.aggregate([
        {$match: {account: this._id}},     //match means we want to find all the ledger entried for this account
        {
            $group:{      //group means we want to group the data of ledger entries based on the type of transaction( DEBIT OR CREDIT)
                _id: null,                //why we dont want to group the data on the basis of any feild because we want to get the total balance of account not any specific type of transaction thats why we write null
                totalDebit:{  //amount hum sirf unka sum karenge jinka type debit hai
                    $sum:{
                        $cond: [
                            {$eq: ["$type", "DEBIT"]},
                            "$amount", 0  //otherwise amount is considered as 0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond: [
                            { $eq: ["$type", "CREDIT"]},
                            "$amount", 0
                        ]
                    }
                }

            }
        }, 
        {
            $project: {
                _id: 0,
                balance: { $subtract: [ "$totalCredit", "$totalDebit"]}
            }
        }
    ])

    if(balanceData.length === 0){
        return 0
    }
   console.log(balanceData);
    return balanceData[ 0 ].balance     //why set 0 because balanceData is an array and we wnat to get the balance from the first object.

}       

const accountModal = mongoose.model("account", accountSchema) 

module.exports = accountModal