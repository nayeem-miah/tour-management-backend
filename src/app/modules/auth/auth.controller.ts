import { NextFunction, Request, Response } from "express";
import { createAsync } from "../../utils/catchAsync";
import { sameResponse } from "../../utils/sameResponse";
import { StatusCodes } from "http-status-codes";
import { autLogin } from "./auth.service";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const credentialsLogin = createAsync(async (req: Request, res: Response, next: NextFunction) => {

    const loginInfo = await autLogin.credentialsLogin(req.body);

    sameResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User login successfully",
        data: loginInfo
    })
});


export const AuthControllers = {
    credentialsLogin,
}