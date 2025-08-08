import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { BookingServices } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";


const createBooking = catchAsync(async (req: Request, res: Response) => {

    const decodeToken = req.user as JwtPayload
    const booking = await BookingServices.createBooking(req.body, decodeToken.userId);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Booking created success",
        data: booking

    })
})
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const bookings = await BookingServices.getAllBookings();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Bookings received success",
        data: bookings

    })
})
const getUsersBooking = catchAsync(async (req: Request, res: Response) => {
    const bookings = await BookingServices.getUsersBooking();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Bookings received success",
        data: bookings

    })
})
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
    const booking = await BookingServices.getBookingsById();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking received success",
        data: booking

    })
})
const updateBooking = catchAsync(async (req: Request, res: Response) => {
    const update = await BookingServices.updateBooking();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking created success",
        data: update

    })
})
// const deleteBooking = catchAsync(async (req: Request, res: Response) => {

// });

export const BookingController = {
    createBooking,
    getAllBookings,
    updateBooking,
    // deleteBooking,
    getUsersBooking,
    getSingleBooking
}