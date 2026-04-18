require("dotenv").config()
const userModal = require("../modals/user.modal")
const jwt = require("jsonwebtoken");
const tokenBlacklistModal = require("../modals/blacklist.modal")


async function authMiddleware(req,res,next){      //this middleware function allow the requests to go forward only if the user has valid token
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    console.log("Authorization Header:", req.headers.authorization);
    console.log("Token:", token);

    if(!token) {
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }
    const isBlacklisted = await tokenBlacklistModal.findOne({token})
    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("SECRET:", process.env.JWT_SECRET);
        const user = await userModal.findById(decoded.userId)
        req.user = user
        next()

    }catch(err){
        console.log("JWT ERROR:", err.message);
        return res.status(401).json({
            message:"Unauthorized access, token is invalid"
        })

    }
}

async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    console.log("Authorization Header:", req.headers.authorization)
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access. token is missing"
        })
    }
    
    const isBlacklisted = await tokenBlacklistModal.findOne({token})
    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Decoded userId:", decoded.userId);
        const user = await userModal.findById(decoded.userId).select("+systemUser")
        console.log("User from DB:", user);
        if(!user.systemUser){
            return res.status(403).json({
                message: "forbidden access. not a system user"
            })
        }
        req.user = user
        return next()
    }catch(err){
        return res.status(401).json({
            message: "unauthorized access, token is invalid"
        })

    }

}
module.exports = { authMiddleware,
                   authSystemUserMiddleware
 }