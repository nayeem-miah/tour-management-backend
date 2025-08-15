"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend --> from Data with image file ---> multer --> from data --> req(body + file)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryUpload = exports.deleteImageFromCloudinary = exports.uploadBufferCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const stream_1 = __importDefault(require("stream"));
// Our  folder --> image --> from data --> multer  -->ameder project na pc ta  nejer ekta folder(temporary) a image ta rkbe > req.file
//  req.file --> cloudinary(req.file) --> url --> mongoose --> mongodb
cloudinary_1.v2.config({
    cloud_name: env_1.envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env_1.envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
const uploadBufferCloudinary = (buffer, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream_1.default.PassThrough();
            bufferStream.end((buffer));
            cloudinary_1.v2.uploader.upload_stream({
                resource_type: "auto",
                public_id: public_id,
                folder: "pdf"
            }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }).end(buffer);
        });
    }
    catch (error) {
        console.log(error);
        throw new appError_1.default(401, `Error uploading file .Error : ${error.message}`);
    }
});
exports.uploadBufferCloudinary = uploadBufferCloudinary;
const deleteImageFromCloudinary = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // https://res.cloudinary.com/dgk8lgdzb/image/upload/v1754962548/o1vvymaxg2n-1754962541128-1700817964867-1-jpg.jpg.jpg
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = url.match(regex);
        if (match && match[1]) {
            const public_id = match[1];
            yield cloudinary_1.v2.uploader.destroy(public_id);
            console.log(`file ${public_id} is deleted from cloudinary`);
        }
    }
    catch (error) {
        throw new appError_1.default(401, "Cloudinary image deleted failed ", error.message);
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
exports.cloudinaryUpload = cloudinary_1.v2;
//  upload to image
// const uploadToCloudinary = cloudinary.uploader.upload()
//  Multer storage cloudinary
// Our folder --> image --> from data --> multer  --> multer storage cloudinary > req.file --> url --> req.file-->mongoose --> mongodb
