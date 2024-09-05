import connectDB from './database/index.js'
import dotenv from "dotenv"
import { app } from './app.js'
dotenv.config({
    path: '../.env'
})
//DATABASE CONNECTION
connectDB() 
.then(()=>{
 app.on("error",(err)=>{
   console.log("Error:", err)
   throw err
 })
 app.listen(process.env.PORT || 3000,()=>{
    console.log("SERVER RUNNING AT PORT: ",process.env.PORT)
 })
})
.catch((err)=>{
    console.log("DB CONNECTION FAILED!!", err)
})
