/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend --> from Data with image file ---> multer --> from data --> req(body + file)

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/appError";
import stream from "stream"

// Our  folder --> image --> from data --> multer  -->ameder project na pc ta  nejer ekta folder(temporary) a image ta rkbe > req.file

//  req.file --> cloudinary(req.file) --> url --> mongoose --> mongodb

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});


export const uploadBufferCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse | undefined> => {
    try {
        return new Promise((resolve, reject) => {

            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream.PassThrough();
            bufferStream.end((buffer))

            cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    public_id: public_id,
                    folder: "pdf"
                },
                (error, result) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve(result)
                }
            ).end(buffer)


        })

    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `Error uploading file .Error : ${error.message}`)
    }
}

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        // https://res.cloudinary.com/dgk8lgdzb/image/upload/v1754962548/o1vvymaxg2n-1754962541128-1700817964867-1-jpg.jpg.jpg


        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = url.match(regex);

        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id);
            console.log(`file ${public_id} is deleted from cloudinary`);
        }


    } catch (error: any) {
        throw new AppError(401, "Cloudinary image deleted failed ", error.message)
    }
}


export const cloudinaryUpload = cloudinary
//  upload to image
// const uploadToCloudinary = cloudinary.uploader.upload()


//  Multer storage cloudinary
// Our folder --> image --> from data --> multer  --> multer storage cloudinary > req.file --> url --> req.file-->mongoose --> mongodb
