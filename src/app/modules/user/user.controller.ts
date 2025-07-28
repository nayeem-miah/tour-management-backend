/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { createUserServices } from "./user.service";
// import AppError from "../../errorHelpers/appError";


const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // throw new Error("fake error");
        // throw new AppError(StatusCodes.BAD_REQUEST, "fake Error ")
        const user = await createUserServices.createUser(req.body);
        res.status(StatusCodes.CREATED).json({
            message: "User created successfully",
            user
        })
    } catch (err: any) {
        console.log(err);
        next(err)
    }
};

export const UserControllers = {
    createUser
};

/**
 * route matching --> controller ---> services --> model ---> db
 */