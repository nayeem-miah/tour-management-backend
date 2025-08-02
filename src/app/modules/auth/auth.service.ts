import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';
import { createUserToken } from "../../utils/userToken";
import { generateToken, verifyTokens } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const isUserExists = await User.findOne({ email });

    if (!isUserExists) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User not found");
    }

    const isPasswordMatch = await bcrypt.compare(password as string, isUserExists.password as string);

    if (!isPasswordMatch) {
        throw new AppError(StatusCodes.BAD_REQUEST, "incorrect password ")
    }

    const userTokens = createUserToken(isUserExists);

    // delete password
    // delete isUserExists.password

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExists.toObject()

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }

};

const getNewAccessToken = async (refreshToken: string) => {
    const verifyRefreshToken = verifyTokens(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload


    const isUserExists = await User.findOne({ email: verifyRefreshToken.email });

    if (!isUserExists) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist");
    }

    if (isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE) {
        throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExists.isActive}`);
    }

    if (isUserExists.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
    }

    const jwtPayload = {
        userId: isUserExists.id,
        email: isUserExists.email,
        role: isUserExists.role
    };

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return {
        accessToken
    }

};

// user ----> login-- token (email, role , _id ) ---booking / payment / booking / payment cancel  ---token 

export const autServices = {
    credentialsLogin,
    getNewAccessToken
}