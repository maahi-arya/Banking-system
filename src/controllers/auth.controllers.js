const userModal = require("../modals/user.modal");
const emailService = require("../services/email.service")
const jwt = require("jsonwebtoken");
const tokenBlacklistModal = require("../modals/blacklist.modal")

//post /api/auth/register
async function userRegisterController(req,res){
    try{
    const { email, password, name } = req.body

    const isExists = await userModal.findOne({
        email: email
    })
    if(isExists){
        return res.status(422).json({
            message: "User already exists with email",
            status: "failed"
        })
    }
    const user = await userModal.create({
        email,password,name
    })
    const token = jwt.sign({userId: user._id},process.env.JWT_SECRET,{expiresIn: "3d"})

    res.cookie("token", token)

    return res.status(201).json({
       user:{
        _id: user._id,
        email: user.email,
        name: user.name
       },
       token
    })
}catch(err){
    console.error("Register error:", err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
}}

//post /api/auth/login
async function userLoginController(req,res){
    const { email, password } = req.body

    const user = await userModal.findOne({email}).select("+password")
    if(!user){
        return res.status(401).json({
            message: "Email or password is invalid"
        })
    }
    const isValidPassword = await user.comparePassword(password)
    if(!isValidPassword){
        res.status(401).json({
            message:"Email or password is invalid"
        })
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, { expiresIn: "3d"})
    res.cookie("token",token)

    res.status(200).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })

    await emailService.sendRegisterationEmail(user.email, user.name)


}

// post /api/auth/logout
async function userLogoutController(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1] //why write [1]
    if(!token){
        return res.status(200).json({
            message: "user logged out successfully"

        })
    }

    // res.cookie("token","")

    await tokenBlacklistModal.create({
        token: token
    })
    res.clearCookie("token") 
    
    res.status(200).json({
        message: "User logged out successfully"
    })

}


module.exports = { userRegisterController , userLoginController, userLogoutController} 