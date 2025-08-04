/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/appError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    /**
     * mongoose 
     * Zod
     */

    /**
     * mongoose error ----> duplicate error , CastError ,  validation error
     */
    const errorSources: any = [
        // {
        //     path: "isDeleted",
        //     message: "Cast failed"
        // }
    ];

    let statusCode = 500;
    let message = `something went wrong !! `

    // duplicate error
    if (err.code === 11000) {
        // console.log("duplicate error", err.message);
        const matchArray = err.message.match(/"([^"]*)"/)
        statusCode = 400
        message = `${matchArray[1]} already exists`
    }
    // CastError---> object id error 
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid Mongodb objectId ...please provide a valid id"
    }
    else if (err.name === "ValidationError") {
        statusCode = 400;
        const errors = Object.values(err.errors);

        errors.forEach((errorObject: any) => errorSources.push({
            path: errorObject.path,
            message: errorObject.message
        }))

        message = err.message
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        // err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}