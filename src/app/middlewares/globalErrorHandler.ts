/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/appError";
import { handleDuplicate } from "../helpers/handleDuplicate";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZodError";
import { handleValidationError } from "../helpers/handleValidationError";
import { TErrorSource } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        console.log(err);
    }
    let errorSources: TErrorSource[] = [];

    let statusCode = 500;
    let message = `something went wrong !! `

    // duplicate error
    if (err.code === 11000) {
        // console.log("duplicate error", err.message);
        const simplifyError = handleDuplicate(err)
        statusCode = simplifyError.statusCode
        message = simplifyError.message
    }
    // CastError---> object id error 
    else if (err.name === "CastError") {
        const simplifyError = handleCastError(err);
        statusCode = simplifyError.statusCode
        message = simplifyError.message
    }
    // zod error
    else if (err.name === "ZodError") {
        const simplifyError = handleZodError(err);
        statusCode = simplifyError.statusCode;
        message = simplifyError.message,
            errorSources = simplifyError.errorSources as TErrorSource[]
    }
    // mongoose validation error 
    else if (err.name === "ValidationError") {
        const simplifyError = handleValidationError(err);
        statusCode = simplifyError.statusCode,
            message = simplifyError.message,
            errorSources = simplifyError.errorSources as TErrorSource[]
    }

    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}