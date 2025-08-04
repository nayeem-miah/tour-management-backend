import mongoose from "mongoose";
import { TGenicErrorResponse } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleCastError = (err: mongoose.Error.CastError): TGenicErrorResponse => {

    return {
        statusCode: 400,
        message: "Invalid Mongodb objectId ...please provide a valid id"
    }
};