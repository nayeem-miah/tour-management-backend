import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TourServices } from "./tour.service";

const createTour = catchAsync(async (req: Request, res: Response) => {
    const result = await TourServices.createTour(req.body);
    res.send(result)
})



export const TourController = {
    createTour,

}