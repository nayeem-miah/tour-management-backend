
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
    const query = req.query
    const result = await userServices.getAllUsers(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "all users retrieved  successfully",
        data: result.data,
        meta: result.meta

    })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const result = await userServices.getSingleUser(id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "user retrieved successfully",
        data: result.data

    })
})

//  users profile 
const getMe = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;

    const result = await userServices.getMe(decodedToken.userId)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "your profile retrieved successfully",
        data: result.data

    })
})


export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe
};

/**
 * route matching --> controller ---> services --> model ---> db
 */