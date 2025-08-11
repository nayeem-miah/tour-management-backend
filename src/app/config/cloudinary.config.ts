// frontend --> from Data with image file ---> multer --> from data --> req(body + file)

import { v2 as cloudinary } from "cloudinary";

// Our  folder --> image --> from data --> multer  --> nejer ekta folder(temporary) a image ta rkbe > req.file

//  req.file --> cloudinary(req.file) --> url --> mongoose --> mongodb

cloudinary.config({
    cloud_name: "",
    api_key: "",
    api_secret: ""
})