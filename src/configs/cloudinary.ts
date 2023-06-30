import  Cloudinary from 'cloudinary'
const cloudinary = Cloudinary.v2
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_SECRET!
})

export default cloudinary