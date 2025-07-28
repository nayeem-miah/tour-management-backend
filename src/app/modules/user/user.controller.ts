/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { User } from "./user.model";
import StatusCodes from "http-status-codes";


const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        const user = await User.create({
            name,
            email
        })
        res.status(StatusCodes.CREATED).json({
            message: "User created successfully",
            user
        })
    } catch (err: any) {
        console.log(err);
        res.status(StatusCodes.BAD_REQUEST).json({
            message: `something went wrong !! err: ${err.message}`,
            err
        })
    }
};

export const UserController = {
    createUser
}