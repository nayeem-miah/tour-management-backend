/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenicErrorResponse } from "../interfaces/error.types"

export const handleDuplicate = (err: any): TGenicErrorResponse => {
    const matchArray = err.message.match(/"([^"]*)"/)

    return {
        statusCode: 400,
        message: `${matchArray[1]} already exists`
    }
}