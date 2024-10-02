import { Router } from "express"
import {
  deleteVideo,
  getUserChannelVideos,
  getGeneralVideos,
  getUserSpecificVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()
//router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file



//Public Routes For Getting random videos on front page of the application

router.route("/").get(getGeneralVideos)

// Secured Routes
router.route("/get-user-channel-videos").get(verifyJWT,getUserChannelVideos) //to get channel videos of the user
router.route("/").get(verifyJWT,getUserSpecificVideos) //to get videos according to the recommendation system
router.route("/").post(verifyJWT,
    upload.fields([
        {
          name: "videoFile",
          maxCount: 1,
        },
        {
          name: "thumbnail",
          maxCount: 1,
        },
      ]),
      publishAVideo
)

router
  .route("/:videoId")
  .get(verifyJWT,getVideoById)
  .delete(verifyJWT,deleteVideo)
  .patch(verifyJWT,upload.fields([{name: "thumbnail", maxCount:1}]), updateVideo)

router.route("/toggle/publish/:videoId").patch(verifyJWT,togglePublishStatus)

export default router
