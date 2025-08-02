import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';
import { createNewAccessTokenWithRefreshToken, createUserToken } from "../../utils/userToken";


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

    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)
    return {
        accessToken: newAccessToken
    }

};

// user ----> login-- token (email, role , _id ) ---booking / payment / booking / payment cancel  ---token 

export const autServices = {
    credentialsLogin,
    getNewAccessToken
}