import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentsSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    videos:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

CommentsSchema.plugin(mongooseAggregatePaginate)
export const Comments = mongoose.model("Comments",CommentsSchema)

