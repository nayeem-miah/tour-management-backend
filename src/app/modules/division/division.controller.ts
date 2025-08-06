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
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSingleDivision = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params.slug;
    const result = await DivisionServices.getSingleDivision(slug);

    sameResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "single division get success",
        data: result.data
    })

})

const updateDivision = createAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await DivisionServices.updateDivision(id, req.body);

    sameResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "division updated success",
        data: result
    })

})

const deleteDivision = createAsync(async (req: Request, res: Response) => {

    const result = await DivisionServices.deleteDivision(req.params.id);

    sameResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division deleted",
        data: result,
    });
});


export const DivisionController = {
    createDivision,
    getAllDivision,
    getSingleDivision,
    updateDivision,
    deleteDivision
}