import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const TweetsSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

TweetsSchema.plugin(mongooseAggregatePaginate)
export const Tweets = mongoose.model("Tweets",TweetsSchema)

