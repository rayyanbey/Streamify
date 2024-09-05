const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error)
    })
  }
}

// const asyncHandler = (fn)=>{async(req,res,next)=>{
//   try{
//      let func = await fn(req,res,next)
//      return func
//   }catch(error){
//     res.status(error.code || 500).json({success:false,message: error.message})
//   }
// }}

export { asyncHandler }
