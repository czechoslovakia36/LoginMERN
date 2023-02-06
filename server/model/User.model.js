import mongoose from "mongoose";

 export const userSchema= new mongoose.Schema(
    {
        username : {
            type: String,
            required :[true, "Please provide unique Username"],
            unique: [true,"Username Exist"]
        },
        password:{
            type: String,
            required: [true,"Please provide a password"],
            unique: false
        },
        email : {
            type: String,
            required: [true , "Please provide a unique email"],
            unique : true,
        },
        firstName:{type: String},
        lastName:{type: String },
        mobile : {type:Number},
        address : {type:String },
        profile :{type:String }
    
    }
)

// module.exports = mongoose.model("Users",userSchema)

export default mongoose.model("Users",userSchema)