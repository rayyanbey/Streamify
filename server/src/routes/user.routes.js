import { Router } from "express";
import { changePassword, getCurrentuser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserDetails } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {changeAvatar, changeCoverImage} from "../controllers/changeImages.controllers.js";

const router = Router()

router.route("/register").post(upload.fields([{name: "avatar",maxCount:1},{name: "coverImage", maxCount:1}]),registerUser)  //Register User
router.route("/login").post(loginUser)  //Login

//secured routes
router.route("/change-avatar").post(verifyJWT,upload.fields([{name: "avatar",maxCount:1}]),changeAvatar)
router.route("/change-cover-image").post(verifyJWT,upload.fields([{name: "coverImage",maxCount:1}]),changeCoverImage)
router.route("/get-current-user").get(verifyJWT,getCurrentuser)
router.route("/update-details").patch(verifyJWT,updateUserDetails)
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)
router.route("/get-watchHistory").get(verifyJWT,getWatchHistory)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)

export default router