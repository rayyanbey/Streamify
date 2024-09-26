import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
    username:{
     type:String,
     required: true,
     min:[5,"Minimum 5 letters"],
     max:[8,"Maximum 8 letters"],
     lowercase: true,
     unqiue: true,
     trim: true,
     index: true
    },
    email:{
     type:String,
     required: true,
     lowercase: true,
     unqiue: true,
     trim: true,
    },
    FullName:{
     type:String,
     required:true,
     trim:true,
     index:true
    },
    avatar:{
     type: String, //cloudinaryURL
     required: true
    },
    coverImage:{
     type: String, //cloudinaryURL
     required: true
    },
    categories:{
     type: Array, // Array of strings to store user's favorite categories
     required: true,
     enum:["Motivation","AI","Religion","Science","Space","History","Web Development","Coding","Computer Science","Politics","News","Health","Food","Technology"],
     min:[5,"Please Select Minimum 5 Categories"]
    },
    watchHistory:[
     {
          type: mongoose.Schema.Types.ObjectId,
          ref:"Video"
     }
    ],
    password:{
     type: String,
     required: [true, 'Password is required']
    },
    refreshTokens:{
     type: String
    }
},{timestamps:true})

UserSchema.pre("save", async function (next) {    //Encrypt the password before saving info in the DB
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10)
    next()
})

UserSchema.methods.isPasswordCorrect = async function(password){  //Comparing the encrypted password with the passwrod entered by the user
  return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken = function(){  //Generating the access tokens
  return jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        FullName: this.FullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
UserSchema.methods.generateRefreshToken = function(){ ///Generating the refresh tokens
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
      )
}

export const User = mongoose.model("User",UserSchema)  //Exporting