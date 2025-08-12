import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { DivisionServices } from "./division.service";
import { IDivision } from "./division.interface";


const createDivision = catchAsync(async (req: Request, res: Response) => {

    const payload: IDivision = {
        ...req.body,
        thumbnail: req.file?.path
    }

    const result = await DivisionServices.createDivision(payload);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "Division created successfully",
        data: result,
        success: true
    })
});


const getAllDivision = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await DivisionServices.getAllDivision(query as Record<string, string>);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Divisions retrieved",
        data: result.data,
        meta: result.meta,
    });
});


const getSingleDivision = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await DivisionServices.getSingleDivision(slug);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "single division get success",
        data: result.data
    })

})

const updateDivision = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const payload: IDivision = {
        ...req.body,
        thumbnail: req.file?.path
    }

    const result = await DivisionServices.updateDivision(id, payload)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "division updated success",
        data: result
    })

})

const deleteDivision = catchAsync(async (req: Request, res: Response) => {

    const result = await DivisionServices.deleteDivision(req.params.id);

    sendResponse(res, {
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