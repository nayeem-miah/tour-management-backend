import { NextFunction, Request, Response } from "express";
import { createAsync } from "../../utils/catchAsync";
import { StatusCodes } from "http-status-codes";
import { sameResponse } from "../../utils/sameResponse";
import { DivisionServices } from "./division.service";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createDivision = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newDivision = await DivisionServices.createDivision(req.body);
    sameResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "user created successfully",
        data: newDivision,
        success: true
    })
})

export const DivisionController = {
    createDivision
}