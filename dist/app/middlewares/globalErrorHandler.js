"use strict";
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
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const handleDuplicate_1 = require("../helpers/handleDuplicate");
const handleCastError_1 = require("../helpers/handleCastError");
const handleZodError_1 = require("../helpers/handleZodError");
const handleValidationError_1 = require("../helpers/handleValidationError");
const cloudinary_config_1 = require("../config/cloudinary.config");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (env_1.envVars.NODE_ENV === "development") {
        console.log(err);
    }
    // single file deleted
    if (req.file) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(req.file.path);
    }
    // multiple files deleted
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map(file => file.path);
        yield Promise.all(imageUrls.map((url) => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    let errorSources = [];
    let statusCode = 500;
    let message = `something went wrong !! `;
    // duplicate error
    if (err.code === 11000) {
        // console.log("duplicate error", err.message);
        const simplifyError = (0, handleDuplicate_1.handleDuplicate)(err);
        statusCode = simplifyError.statusCode;
        message = simplifyError.message;
    }
    // CastError---> object id error 
    else if (err.name === "CastError") {
        const simplifyError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifyError.statusCode;
        message = simplifyError.message;
    }
    // zod error
    else if (err.name === "ZodError") {
        const simplifyError = (0, handleZodError_1.handleZodError)(err);
        statusCode = simplifyError.statusCode;
        message = simplifyError.message,
            errorSources = simplifyError.errorSources;
    }
    // mongoose validation error 
    else if (err.name === "ValidationError") {
        const simplifyError = (0, handleValidationError_1.handleValidationError)(err);
        statusCode = simplifyError.statusCode,
            message = simplifyError.message,
            errorSources = simplifyError.errorSources;
    }
    else if (err instanceof appError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: env_1.envVars.NODE_ENV === "development" ? err : null,
        stack: env_1.envVars.NODE_ENV === "development" ? err.stack : null
    });
});
exports.globalErrorHandler = globalErrorHandler;
