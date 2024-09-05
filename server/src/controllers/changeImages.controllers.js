import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";


const changeAvatar = asyncHandler(async(req,res)=>{
    
    const avatarFilePath = req.files?.avatar[0]?.path

    if(!avatarFilePath){
        throw new ApiError(400,"Avatar is Required")
    }

    const avatarResponse = await uploadOnCloudinary(avatarFilePath)

    if(!avatarResponse){
        throw new ApiError(400,"Avatar is Required")
    }
    await deleteFromCloudinary()
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatarResponse.url
            }
        },
        {new: true}
    ).select("-password")
    user.save({validateBeforeSave: false})
    
    console.log(user.avatar)
    return res.status(200)
    .json(new ApiResponse(200,user.avatar,"Avatar image is updated"))
    
})

const changeCoverImage = asyncHandler(async(req,res)=>{
    
    const coverFilePath = req.files?.coverImage[0]?.path

    if(!coverFilePath){
        throw new ApiError(400,"Cover Image is Required")
    }

    const coverResponse = await uploadOnCloudinary(coverFilePath)

    if(!coverResponse){
        throw new ApiError(400,"Cover Image is Required")
    }
    await deleteFromCloudinary()
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverResponse.url
            }
        },
        {new: true}
    ).select("-password")
    user.save({validateBeforeSave: false})
    user.coverImage = coverResponse.url
    user.save({validateBeforeSave: false})

    console.log(user.coverImage)
    return res.status(200)
    .json(new ApiResponse(200,{},"Cover image is updated"))
})


export {
    changeAvatar,
    changeCoverImage
}