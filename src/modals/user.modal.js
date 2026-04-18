const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required: [true, "Email is required to create a user"],
        trim: true,       //we dont want spaces
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
        unique: [true, "Email already exists"]
    },
    name:{
        type: String,
        required: [true, "Name is required for creating an account"]
    },
    password:{
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6,"password should be contain more than 6 characters"],
        select: false        //By default, this field will NOT be returned when you fetch data from the database.
    },
    systemUser:{     //why we need this feild? because we want to differentiate between normal users and system users (like admin, support staff, etc..) that can perform system level operations.
        type:Boolean,          //why
        default: false,    // we write fALSE because by default every user will be normal user, if we want to create system user then we can set this field to TRUE while creating the user.
        immutable: true,      // it should be set only at the time of user creation and after that it should not be changed. this is important for security reasons, if we allow this field to be changed later on then it can lead to security issues, for example if a normal user is able to change this field to true then he can perform system level operations which can lead to data breach or other security issues.
        select: false             //we dont want to return this field when we fetch data from the database because it is not relevant for normal users and it can be a security risk if it is exposed to normal users.
    }

},{
    timestamps: true             //user kab create hua tha and last time kab update hua tha
})

// Hash password before saving the user document.
// Use a promise-based middleware (no `next`) so it always completes.
userSchema.pre("save", async function () {
    // If password is NOT changed, skip hashing.
    if (!this.isModified("password")) return;

    this.password = await bcryptjs.hash(this.password, 10);
});


//Every user object created from this schema will have this function
userSchema.methods.comparePassword = async function (password){         //This function takes password entered by user (login time)
    // Jo database me password save hai (hash) use compare krti hai new password se.
    return bcryptjs.compare(password, this.password);     // bcryptjs.compare returns true or false
}



const userModal = mongoose.model("user", userSchema)   //model will be cretaed on the basis of userSchema
module.exports = userModal