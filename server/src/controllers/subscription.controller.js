import mongoose, {Aggregate, isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscriber = req.user._id

    if(!isValidObjectId(channelId)){
        return res.status(400)
        .json(new ApiResponse(400,"Invalid Channel Id"))
    }

    const subscriptionStatus = await Subscription.findOne({subscriber:subscriber,channel:channelId})

    if(subscriptionStatus){
        await Subscription.remove()

        return res.status(200)
        .json(new ApiResponse(200,"Unsubscribed Successfully"))
    }
    else{
        await Subscription.create({subscriber:subscriber,channel:channelId})
        return res.status(200)
        .json(new ApiResponse(200,"Subscribed Successfully"))
    }

    
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const list = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)  // Ensure channelId is an ObjectId
            }
        },
        {
            $lookup: {
                from: "users",  // The name of the collection you want to join with
                localField: "subscriber",  // The field in Subscription documents
                foreignField: "_id",  // The field in the User collection
                as: "subscriberDetails"  // The name of the array to store the joined documents
            }
        },
        {
            $unwind: "$subscriberDetails"  // Unwind the array to get the object directly
        },
        {
            $project: {
                "subscriberDetails._id": 1,  // Include the subscriber's ID
                "subscriberDetails.name": 1,  // Include the subscriber's name
                "subscriberDetails.email": 1  // Include the subscriber's email
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, "Subscribers retrieved successfully", list));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const list = await Subscription.aggregate([
        {
          $match:{
            subscriber: mongoose.Types.ObjectId(subscriberId)
          }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"userId",
                as:"subscribed_Channels"
            }
        },
        {
            $unwind: "subscribed_Channels"
        },
        {
            $project:{
                "subscribed_Channels._id":1,
                "subscribed_Channels.name":1
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200,list,"channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}