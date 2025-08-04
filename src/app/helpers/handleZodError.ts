/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSource, TGenicErrorResponse } from "../interfaces/error.types";

export const handleZodError = (err: any): TGenicErrorResponse => {
    const errorSources: TErrorSource[] = [];

    // console.log(err.issues);
    err.issues.forEach((issue: any) => {
        errorSources.push({
            path: issue.path[issue.path.length - 1],
            // path: issue.length > 1 && issue.path.reverse().join(" inside "),
            message: issue.message
        })
    });

    return {
        statusCode: 400,
        message: "zod Error",
        errorSources
    }
};