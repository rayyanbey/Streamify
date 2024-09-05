import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({

    subscriber:{
        type: mongoose.Schema.Types.ObjectId,  //Who subscribes
        ref: "User"
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId, //Who is subscribed
        ref: "User"
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription",SubscriptionSchema)