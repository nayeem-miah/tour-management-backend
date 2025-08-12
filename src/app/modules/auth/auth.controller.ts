import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authServices } from "./auth.service";
import AppError from "../../errorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserToken } from "../../utils/userToken";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";


const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {
        if (err) {
            // console.log("from error");
            // return next(err)
            return next(new AppError(err.statusCode, err.message))
        };
        if (!user) {
            // console.log("from not user");
            return next(new AppError(401, info.message))
        }

        const userToken = await createUserToken(user)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: pass, ...rest } = user.toObject()

        setAuthCookie(res, userToken)


        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "User login successfully",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            }
        })
    })(req, res, next)


    //  manually system--------------------------------

    // const loginInfo = await authServices.credentialsLogin(req.body);

    // res.cookie("accessToken", loginInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    // setAuthCookie(res, loginInfo)


    // sameResponse(res, {
    //     success: true,
    //     statusCode: StatusCodes.OK,
    //     message: "User login successfully",
    //     data: loginInfo
    // })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "new access token retrieved successfully",
        data: tokenInfo
    })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

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

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User logout successfully",
        data: null
    })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;


    await authServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User password changed successfully",
        data: null
    })
});
const changePassword = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;


    await authServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User password changed successfully",
        data: null
    })
});

const setPassword = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;
    const { password } = req.body;

    await authServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User password changed successfully",
        data: null
    })
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : "";

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice()
    }
    const user = req.user;

    // console.log("google login user", user);

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "USer not found");
    }
    const tokenInfo = createUserToken(user)
    setAuthCookie(res, tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
});



export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    changePassword,
    setPassword,
    googleCallbackController
}