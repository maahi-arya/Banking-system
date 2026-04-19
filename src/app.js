const express = require("express");
const cookieParser = require("cookie-parser")

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 Routes
 */
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRouter = require("./routes/transaction.routes");

/**
 * Use routes
 */

app.get("/",(req,res)=>{
    res.send("Ledger service is up and running")
})
app.get("/check",(req,res)=>{
    res.send("Api working fine");
})
app.use("/api/auth", authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transactions", transactionRouter)






// 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error("API error:", err);
    const message = err?.message || "Internal Server Error";
    res.status(500).json({ message });
});

module.exports = app;