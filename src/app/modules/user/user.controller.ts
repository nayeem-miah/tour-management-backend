/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { createUserServices } from "./user.service";


const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
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