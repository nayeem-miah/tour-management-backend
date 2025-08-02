import { NextFunction, Request, Response } from "express";
import { createAsync } from "../../utils/catchAsync";
import { sameResponse } from "../../utils/sameResponse";
import { StatusCodes } from "http-status-codes";
import { autServices } from "./auth.service";
import AppError from "../../errorHelpers/appError";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const credentialsLogin = createAsync(async (req: Request, res: Response, next: NextFunction) => {

    const loginInfo = await autServices.credentialsLogin(req.body);

    res.cookie("accessToken", loginInfo.accessToken, {
        httpOnly: true,
        secure: false
    })

    res.cookie("refreshToken", loginInfo.refreshToken, {
        httpOnly: true,
        secure: false
    })

    sameResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User login successfully",
        data: loginInfo
    })
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(StatusCodes.BAD_REQUEST, "no refresh token received cookies")
    }
    const tokenInfo = await autServices.getNewAccessToken(refreshToken as string);

    sameResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User login successfully",
        data: tokenInfo
    })
});


export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken
}