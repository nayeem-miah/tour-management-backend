import { NextFunction, Request, Response } from "express";
import { createAsync } from "../../utils/catchAsync";
import { sameResponse } from "../../utils/sameResponse";
import { StatusCodes } from "http-status-codes";
import { authServices } from "./auth.service";
import AppError from "../../errorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserToken } from "../../utils/userToken";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const credentialsLogin = createAsync(async (req: Request, res: Response, next: NextFunction) => {

    const loginInfo = await authServices.credentialsLogin(req.body);

    // res.cookie("accessToken", loginInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, loginInfo)


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
    const tokenInfo = await authServices.getNewAccessToken(refreshToken as string);

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, tokenInfo)

    sameResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "new access token retrieved successfully",
        data: tokenInfo
    })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logout = createAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sameResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User logout successfully",
        data: null
    })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;


    await authServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sameResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User password changed successfully",
        data: null
    })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const googleCallbackController = createAsync(async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    // console.log("google login user", user);

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "USer not found");
    }
    const tokenInfo = createUserToken(user)
    setAuthCookie(res, tokenInfo)

    res.redirect(envVars.FRONTEND_URL)
});



export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController
}