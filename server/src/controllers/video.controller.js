import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js"

const getUserChannelVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination

  const sortStage = {}
  sortStage[sortBy] = sortType === "desc" ? -1 : 1

  const videoArray = await Video.aggregatePaginate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $limit: 10,
    },
    {
      $sort: sortStage,
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        views: 1,
        Duration: 1,
        isPublished: 1,
      },
    },
  ])

  if (videoArray.length === 0) {
    throw new ApiError(401, "Vides Not Found")
  }

  return res.status(200).json(new ApiResponse(200, videoArray, "Videos Found"))
})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body

  const videoFilePath = req.files?.videoFile[0]?.path
  const thumbnailPath = req.files?.thumbnail[0]?.path

  if (!videoFilePath) {
    throw new ApiError(401, "Video is required")
  }
  if (!thumbnailPath) {
    throw new ApiError(401, "Thumbnail is required")
  }

  const videoFileResponse = await uploadOnCloudinary(videoFilePath)
  const thumbnailResponse = await uploadOnCloudinary(thumbnailPath)

  if (!videoFileResponse) {
    throw new ApiError(401, "Video is required")
  }

  if (!thumbnailResponse) {
    throw new ApiError(401, "Thumbnail is required")
  }
  console.log(videoFileResponse)

  const userId = req.user?._id

  const video = await Video.create({
    title,
    description,
    videoFile: videoFileResponse.url,
    thumbnail: thumbnailResponse.url,
    isPublished: status,
    Duration: videoFileResponse.duration,
    views: 0,
    owner: userId,
  })

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Created Successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(401, "Invalid Id")
  }

  return res.status(200).json(new ApiResponse(200, video, "Video Found"))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body
  const thumbnailPath = req.files?.thumbnail[0]?.path

  if (!thumbnailPath) {
    throw new ApiError(401, "Thumbnail is required")
  }

  const thumbnailResponse = await uploadOnCloudinary(thumbnailPath)
  if (!thumbnailResponse) {
    throw new ApiError(401, "Thumbnail is required")
  }

  const video = await Video.findByIdAndUpdate(videoId, {
    $set: {
      thumbnail: thumbnailResponse.url,
      title,
      description,
    },
  })

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Updated Successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(401, "Invalid Id")
  }

  deleteFromCloudinary(videoId)

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Deleted Successfully"))

  //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  const video = await Video.findById(videoId)

  if (video.isPublished === false) {
    video.isPublished = true
    await video.save({ validateBeforeSave: false })
  } else {
    video.isPublished = false
    await video.save({ validateBeforeSave: false })
  }
  console.log(video)
  return res
    .status(200)
    .json(new ApiResponse(200, video.isPublished, "Status Updated"))
})

const getUserSpecificVideos = asyncHandler(async (req, res) => {
  const userFavCategory = req.user.categories

  const videoArray = Video.aggregatePaginate([
    {
      $match: {
        category: {
          $in: userFavCategory,
        },
      },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        category: 1,
        views: 1,
        duration: 1,
      },
    },
  ])

  if(videoArray.length === 0){
    throw new ApiError(401,"Videos Not Found");
  }

    return res.status(200)
    .json(new ApiResponse(200, videoArray, "Videos Found"))
})

const getGeneralVideos = asyncHandler(async (req, res) => {
  const videosArray = await Video.aggregatePaginate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        category: 1,
        views: 1,
        duration: 1,
      },
    },
  ])

  if (videosArray.length === 0) {
    throw new ApiError(401, "Videos Not Found")
  }

  return res.status(200).json(new ApiResponse(200, videosArray, "Videos Found"))
})

export {
  getUserChannelVideos as getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getGeneralVideos,
  getUserSpecificVideos,
}
