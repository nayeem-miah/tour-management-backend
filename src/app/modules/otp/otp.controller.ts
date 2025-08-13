import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { OtpServices } from "./otp.service";

const sendOTP = catchAsync(async (req: Request, res: Response) => {

    const { name, email } = req.body;
    await OtpServices.sendOTP(email, name)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "otp send success",
        data: null
    })
})
const verifyOTP = catchAsync(async (req: Request, res: Response) => {

    const { email, otp } = req.body;
    await OtpServices.verifyOTP(email, otp);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "otp verify success",
        data: null
    })
})


export const OtpController = {
    sendOTP,
    verifyOTP
}