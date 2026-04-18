const transactionModal = require("../modals/transaction.modal")
const ledgerModal = require("../modals/ledger.modal");
const accountModal = require("../modals/account.modal");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");
const transactionModel = require("../modals/transaction.modal");


/**
 * -create a new transaction
 * 1. validate request
 * 2. validate idempotencyKey
 * 3. check account status
 * 4. DErive sender balance from ledger
 * 5. create transaction(PENDING)
 * 6. create DEBIT ledger entry
 * 7. create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. commit MONGODB session
 * 10. Send email notification
 */

    /** VAlidate requets */
async function createTransaction(req,res){

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body
    
    if(!fromAccount || !toAccount || !amount || !idempotencyKey ){
        return res.status(400).json({              //if return is not written then after sending the response the code will continue to execute and it may cause error
            message: "FromAccount, toAccount, amount, idempotencyKey are required"
        })
    }
    const fromUserAccount = await accountModal.findOne({
        _id: fromAccount,     
    })
    const toUserAccount = await accountModal.findOne({
        _id: toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /** Validate idempotencyKey */

    const isTransactionAlreadyExists = await transactionModal.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists  //we can return the transaction details to the client if the transaction is already processed
            })
        }
        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }
        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction processing failed , please try again",
            })
        }
        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "transaction was reversed",
            })

        }
    }

    /** Check Account status */
     if( fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process the transaction"
        })
     }
    
    /**Derive sender balance from ledger */                  //means how much balance sender has in his account
    const balance = await fromUserAccount.getBalance()
    if(balance < amount ){
        return res.status(400).json({
            message: `Insufficiant Balance. Current balance is ${balance}. Requested balance is ${amount}`
        })
    }
    
    let transaction;
    try{
    /**Create Transaction */
    const session = await mongoose.startSession()  // what is session in mongoose?   A session is a way to manage and coordinate multiple operations in mongodb. It allows you to execute multiple operations as asingle unit of work
    session.startTransaction()     // why use startTransaction because we want to execute multiple operations as asingle unit of work, if any operation fails the entire transaction willnot be set as completed and this leads to data inconsistency.

     transaction  = new transactionModal({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })
    
    const debitLedgerEntry = await ledgerModal.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session})


    await (()=>{         // why use await because we want to simulate a delay in processing the transaction to test the idempotencykey functionality, if a user sends multiple request with same idempotencyKey while the first request is still processing then we should return thw response , we can simulate the delay using setTimeOut function and we can wrap it in a promise to use await with it.
        return new Promise((resolve)=> setTimeout(resolve, 15 * 1000))
    })()

    const creditLedgerEntry = await ledgerModal.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type:"CREDIT"
    }], { session})
    console.log("Transaction:", transaction);

    transaction.status = "COMPLETED"
    await transaction.save({ session})   //what .save does is it saves the changes made to the transaction document in the database. In this case, we are updating the status of the transaction to " COMPLETED" and saving it to databse.

    await session.commitTransaction()    // all the changes made in the transaction will be applied to the database
    session.endSession()          //it is important to call the endSession to prevent memory leaks .

}catch(error){
        return res.status(400).json({
            message: "Transaction is pending due to some issue, please retry after sometime",
        })
    }
    /**Send email notification */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
    return res.status(201).json({
        message: "transaction completed successfully",
        transaction: transaction
    })




}
async function createInitialFundsTransaction(req,res){
    /** this function is used to create an initial funds transaction from a system user because system users have the privilege to add initial funds to accoounts. when a new user is created, they can be credited with initial funds by a sytem user.
     */
    const { toAccount, amount, idempotencyKey } = req.body

    if( !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModal.findOne({
        _id: toAccount,
    })

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModal.findOne({
        user: req.user._id
    })

    if(!fromUserAccount){
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModal.create( [{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type:"DEBIT"
    } ], {session})

    const creditLedgerEntry = await ledgerModal.create( [{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type:"CREDIT"
    } ], {session})

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })
}

module.exports = { createTransaction, createInitialFundsTransaction }