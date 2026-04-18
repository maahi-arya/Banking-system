const accountModal = require("../modals/account.modal");

async function createAccountController(req,res){
    const user = req.user;

    const account = await accountModal.create({        //user ki id ke sath ek account create hoga or use hum res me bhej denge
        user: user._id
    })      

    res.status(201).json({
      account
    })
}

async  function getUserAccountController(req,res){
    const accounts = await accountModal.find( {user: req.user._id} ); //user ki id ke sath jitne bhi accounts hai unhe find karenge or res me bhej denge

    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req,res){
    const {accountId} = req.params;

    const account = await accountModal.findOne({
        _id: accountId,
        user: req.user._id
    })

    if(!account){
        return res.status(404).json({
            message:"Account not found"
        })
    }

    const balance = await account.getBalance();
    res.status(200).json({
        accountId: account._id,
        balance: balance
    })

}

module.exports = {createAccountController, getUserAccountController , getAccountBalanceController }