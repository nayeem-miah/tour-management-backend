
import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { userServices } from "./user.service";
import { createAsync } from "../../utils/catchAsync";
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

    res.status(StatusCodes.CREATED).json({
        message: "user created success",
        user
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
    const users = await userServices.getAllUsers();
    res.status(StatusCodes.OK).json({
        success: true,
        message: "all received success",
        data: users
    })
})


export const UserControllers = {
    createUser,
    getAllUsers
};

/**
 * route matching --> controller ---> services --> model ---> db
 */