import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import  jwt  from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshTokens = refreshToken
      await user.save({validateBeforeSave: false})  ///saving the user with refresh token

      return {accessToken,refreshToken}
    }catch(error){
      throw new ApiError(500,"")
    }
}

const registerUser = asyncHandler(async (req, res) => {
  //Get User Details
  const { FullName, username, email, password } = req.body

  //Validation : Empty
  // if(
  //   [FullName,email,username,password].some((field)=>
  //     field?.trim() === ""
  //   )
  // ){
  //   throw new ApiError(400,"All fields are required")
  // }

  //Check if User Already Exists
  let FoundUser = await User.findOne({
    $or: [{ username }, { email }],
  })
  console.log(FoundUser)
  if (FoundUser) {
    throw new ApiError(409, "User Already Exists")
  }
  // console.log(req.files)
  // console.log(req.body)
  //Check for images
  const AvatarLocalPath = req.files?.avatar[0]?.path
  const CoverImageLocalPath = req.files?.coverImage[0]?.path
  console.log(AvatarLocalPath)
  console.log(CoverImageLocalPath)

  if (!AvatarLocalPath) {
    throw new ApiError(400, "Avatar File is required")
  }
  if (!CoverImageLocalPath) {
    throw new ApiError(400, "Cover Image File is required")
  }

  //Upload images to cloudinary
  let AvatarRes = await uploadOnCloudinary(AvatarLocalPath)
  let CoverImageRes = await uploadOnCloudinary(CoverImageLocalPath)

  console.log(AvatarRes)
  console.log(CoverImageRes)

  if (!AvatarRes) {
    throw new ApiError(409, "Avatar is required")
  }

  //Create User Object - create entry in DB
  const user = await User.create({
    FullName,
    avatar: AvatarRes.url,
    coverImage: CoverImageRes.url,
    email,
    password,
    username,
  })

  //remove password and refresh token from response
  const createdUser = await User.findById(user._id)?.select(
    "-password -refreshTokens"
  )
  console.log(createdUser)
  //check user creation
  if (!createdUser) {
    throw new ApiError(500, "Problem in Registering User")
  }
  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered"))
})


const loginUser = asyncHandler(async (req,res)=>{
  //Get password and username from req.body
  const {username,password,email} = req.body
  console.log(username,password,email)
  if(!(username || email)){
    throw new ApiError(400,"username or Email is required")
  }
  //validate user
  const user = await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"User doesnot exist")
  }
  //check password
  const isValidPassword = await user.isPasswordCorrect(password)
  if(!isValidPassword){
    throw new ApiError(401,"Password incorrect")
  }
  //generate access token and refresh token
  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
  //send cookies 
  const loggedInUser = await User.findById(user._id)
  .select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200, {
    user: loggedInUser,accessToken,refreshToken
  },'User logged in successfully'))
})

const logoutUser = asyncHandler(async (req,res)=>{
  //find user again but how?? use middleware

  await User.findByIdAndUpdate(req.user._id,
    {
      $set: {refreshTokens: undefined}
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken  || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized Request")
  }

  try {
    const token = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
    if(!token){
      throw new ApiError(401,"Invalid Request")
    }
  
    const newUser = await User.findById(token?._id)
    if(!newUser){
      throw new ApiError(401,"Invalid Refresh Token")
    }
  
    if(newUser?.refreshTokens !== incomingRefreshToken){
      throw new ApiError(401,"Refresh Token is expired or used")
    }
  
    const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(newUser._id)
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json( new ApiResponse(200,{
      accessToken, refreshToken: newrefreshToken,
      message: "Tokens Refreshed"
    }))
  } catch (error) {
    throw new ApiError(401,"Invalid Refresh Token")
  }
})

const changePassword = asyncHandler(async(req,res)=>{
  const {oldPassword, newPassword, confirmPassword} = req.body
  const user = await User.findById(req.user?._id)
  const isCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isCorrect){
     throw new ApiError(400,"Invalid Password")
  }
  if(newPassword !== confirmPassword){
    throw new ApiError(400,"Passwords Don't Match")
  }
  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res.status(200)
  .json(new ApiResponse(200,{},"Password Changes Successfully"))
})

const getCurrentuser = asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(new ApiResponse(200,req.user,"Current User Fetched Successfully"))
})

const updateUserDetails = asyncHandler(async(req,res)=>{
  const {FullName,email} = req.body

  if(!FullName|| !email){

  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
      FullName: FullName,
      email: email
      }
    },
    {new: true}
  ).select("-password")

  user.save()
  return res.status(200)
  .json(new ApiResponse(200,req.user,"Updated Successfully"))

})


const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params || req.body

    if(!username?.trim()){
      //error 400
    }

  const channel = await User.aggregate([
      {  //Stage 1
        $match:{
          username: username
        }
      },
      { //Stage 2
        $lookup:{
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers"
        }
      },
      { //Stage 3
        $lookup:{
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo"
        }
      },
      {
        $addFields:{
          subscribersCount : {
            $size:"$subscribers"
          },
          channelSubscribedToCount:{
            $size:"$subscribedTo"
          },
          isSubscribed:{
            $cond:{
              if:{
                $in: [req.user?._id,"$subscribers.subscriber"]
              },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project:{
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelSubscribedToCount: 1,
          isSubscribed: 1,
          avatar:1,
          coverImage: 1,
          email:1,
        }
      }
  ])

  if(!channel?.length){
    //throw error
  }

  return res.status(200)
  .json(new ApiResponse(200,channel[0],"Information regarding user fetcheds"))
})

//Aggregate piplines are direct with mongoDB they don't go through mongoose
const getWatchHistory = asyncHandler(async (req,res)=>{
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from: "videos",
        localField:"watchHistory",
        foreignField: "_id",
        as: "WatchHistory",
        pipeline:[
          {
            $lookup:{
              from: "users",
              localField: "owner",
              foreignField:"_id",
              as:"owner",
              pipeline:{
                $project:{
                  FullName: 1,
                  email: 1,
                  avatar:1
                }
              }
            }
          },
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res.status(200)
  .json(new ApiResponse(200,user[0].WatchHistory,"Watch History Fetched Successfully"))
})


export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentuser,
  updateUserDetails,
  getUserChannelProfile,
  getWatchHistory
 }
