import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/appError";
import { verifyTokens } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { StatusCodes } from "http-status-codes";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError(StatusCodes.BAD_REQUEST, "no token received")
        }

        // const verifyToken = jwt.verify(accessToken, "secret");
        const verifyToken = verifyTokens(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExists = await User.findOne({ email: verifyToken.email });

        if (!isUserExists) {
            throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist");
        }

        if (isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE) {
            throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExists.isActive}`);
        }

        if (isUserExists.isDeleted) {
            throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
        }

        if (!authRoles.includes(verifyToken.role)) {
            throw new AppError(StatusCodes.BAD_REQUEST, "you are not permeated to view this route")
        }
        req.user = verifyToken
        next()
    } catch (error) {
        next(error)
    }
}
