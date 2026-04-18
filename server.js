require("dotenv").config()
const app = require("./src/app");
const connectDB = require("./src/config/db")

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

connectDB();


app.listen(3000, ()=>{
    console.log("server is running on port 3000")
})