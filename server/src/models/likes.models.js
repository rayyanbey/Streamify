import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const LikesSchema = new mongoose.Schema({
    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
    },
    videos:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweets"
    }
},{timestamps: true})

LikesSchema.plugin(mongooseAggregatePaginate)
export const Likes = mongoose.model("Likes",LikesSchema)

