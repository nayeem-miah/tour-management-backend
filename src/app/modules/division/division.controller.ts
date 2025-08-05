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
        message: "Division created successfully",
        data: newDivision,
        success: true
    })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllDivision = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DivisionServices.getAllDivision();
    sameResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Divisions retrieved",
        data: result.data,
        meta: result.meta,
    });
})

export const DivisionController = {
    createDivision,
    getAllDivision
}