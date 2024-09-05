import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config({
  path: "../.env",
})
//Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
  console.log("Local File Path:", localFilePath)
  try {
    if (!localFilePath) {
      return null
    }

    // Upload on Cloudinary
    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })

    // Uploaded on Cloudinary
    console.log("Uploaded on Cloudinary", response.url)
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    fs.unlinkSync(localFilePath) // Remove the file from local server as the upload failed
    return null
  }
}

const deleteFromCloudinary = async () => {
  cloudinary.uploader.destroy("sample", (result) => {
    console.log(result)
  })
}

export { uploadOnCloudinary, deleteFromCloudinary
}
