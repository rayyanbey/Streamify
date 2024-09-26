import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new mongoose.Schema({
   videoFile:{
    type: String, //cloudinary
    required: true,
   },
   thumbnail:{
    type: String, //cloudinary
    required: true,
   },
   title:{
    type:String,
    required:true
   },
   description:{
    type:String,
    required:true
   },
   Duration:{
    type:Number,  //cloudinary
    required:true
   },
   views:{
    type:Number,
    default:0,
    required: true
   },
   isPublished:{
    type:Boolean,
    required: true,
    default: true
   },
   category:{
      type: [String], // Array of strings to store user's favorite categories
      required: true,
      enum:["Motivation","AI","Religion","Science","Space","History","Web Development","Coding","Computer Science","Politics","News","Health","Food","Technology"]
   },
   owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
   }
},{timestamps:true})


VideoSchema.plugin(mongooseAggregatePaginate)   //using aggregation piplines for complex queries

export const Video = mongoose.model("Video",VideoSchema)