import {asyncHandler} from "../utils/asynchandler.js"
import { APIError } from "../utils/ApiError.js"; 
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { APiresponse } from "../utils/APiresponse.js";

const registerUser = asyncHandler(async (req , res) => {
  // get user details from frontend
  //validation-not empty
// check if the user already exists: we have to check with both email and username
// check for images , check for avatar
// upload them to cloudinary , avatar
// create user object - create entry in db
// remove password and refresh token field from response
//check for user creation
// return res
const  {fullName , email , username , password} = req.body
console.log("email:" , email)

if(
    [fullName , email , username , password].some((field) => field?.trim() === "")
)
{
    throw new APIError(400 , "all fields are required")
}

const existedUser = User.findOne({
  $or: [{username} , {email}]
})

if(existedUser){
  throw new APIError(409 , "User with email or username already exists" )
}

 const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if(!avatarLocalPath){
  throw new APIError(400 , "Avatar file is required")
  }

 const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

if(!avatar){
  throw new APIError(400 , "Avatar file is required")
}

  const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username: username.toLowerCase()
})

 const createdUser = await User.findById(user._id).select(
  "-password -refresh token"
 )
if(!createdUser){
  throw new APIError(500 , "something went wrong")
}

return res.status(201).json(
  new APiresponse(200 , createdUser , "User registered sucessfully")
)

});



export {
    registerUser
};