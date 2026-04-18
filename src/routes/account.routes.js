const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router();

const accountController = require("../controllers/account.controller")

/**create a new account post /api/accounts/ */
router.post("/", authMiddleware.authMiddleware,   accountController.createAccountController)         //authMiddleware se user ki authentication check karenge or account create krenge 

/**GET /api/accounts/ get all accounts of the logged-in user */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountController)

/**Get /api/accounts/balance/:accountId */

router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)

module.exports = router;
