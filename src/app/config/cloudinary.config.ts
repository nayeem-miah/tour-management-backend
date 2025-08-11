// frontend --> from Data with image file ---> multer --> from data --> req(body + file)

import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";

// Our  folder --> image --> from data --> multer  -->ameder project na pc ta  nejer ekta folder(temporary) a image ta rkbe > req.file

//  req.file --> cloudinary(req.file) --> url --> mongoose --> mongodb

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});

export const cloudinaryUpload = cloudinary
//  upload to image
// const uploadToCloudinary = cloudinary.uploader.upload()


//  Multer storage cloudinary
// Our folder --> image --> from data --> multer  --> multer storage cloudinary > req.file --> url --> req.file-->mongoose --> mongodb
