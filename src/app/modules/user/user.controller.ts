
import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

// import AppError from "../../errorHelpers/appError";

// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // throw new Error("fake error");
//         // throw new AppError(StatusCodes.BAD_REQUEST, "fake Error ")

//         const user = await userServices.createUser(req.body);
//         res.status(StatusCodes.CREATED).json({
//             message: "User created successfully",
//             user
//         })
//     } catch (err: any) {
//         console.log(err);
//         next(err)
//     }
// };


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userServices.createUser(req.body);

    // res.status(StatusCodes.CREATED).json({
    //     message: "user created success",
    //     user
    // })

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "user created successfully",
        data: user,
        success: true
    })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id

    // const token = req.headers.authorization;
    // const verifyToken = verifyTokens(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload
    const verifyToken = req.user
    const payload = req.body
    const user = await userServices.updateUser(userId, payload, verifyToken as JwtPayload)


    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "user updated successfully",
        data: user,
        success: true
    })
})

// const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const users = await userServices.getAllUsers();
//         res.status(StatusCodes.ACCEPTED).json({
//             message: "users find success",
//             users
//         })
//     } catch (err: any) {
//         console.log(err);
//         next(err)
//     }
// }


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.getAllUsers();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "all users retrieved  successfully",
        data: result.data,
        meta: result.meta

    })
})


export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser
};

/**
 * route matching --> controller ---> services --> model ---> db
 */