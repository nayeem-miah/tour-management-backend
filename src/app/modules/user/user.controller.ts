
import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { userServices } from "./user.service";
import { createAsync } from "../../utils/catchAsync";
import { sameResponse } from "../../utils/sameResponse";
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
const createUser = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userServices.createUser(req.body);

    // res.status(StatusCodes.CREATED).json({
    //     message: "user created success",
    //     user
    // })

    sameResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "user created successfully",
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
const getAllUsers = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.getAllUsers();

    sameResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "all users retrieved  successfully",
        data: result.data,
        meta: result.meta

    })
})


export const UserControllers = {
    createUser,
    getAllUsers
};

/**
 * route matching --> controller ---> services --> model ---> db
 */