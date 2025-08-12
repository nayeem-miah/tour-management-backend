
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';
import { createNewAccessTokenWithRefreshToken, createUserToken } from "../../utils/userToken";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";


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

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId);
    if (!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "user not found ")
    }

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password as string);

    if (!isOldPasswordMatch) {
        throw new AppError(StatusCodes.BAD_REQUEST, "old password does't match")
    }

    user.password = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SLOT_ROUND));
    user.save()
    return true
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    return {}
}
const setPassword = async (userId: string, plainPassword: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    };

    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You have already set your password. Now you can not change the password from your profile password updated");
    }

    const hashPassword = await bcrypt.hash(plainPassword, Number(envVars.BCRYPT_SLOT_ROUND))

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }

    const auths: IAuthProvider[] = [...user.auths, credentialProvider];
    user.password = hashPassword;

    user.auths = auths

    await user.save()
}

// user ----> login-- token (email, role , _id ) ---booking / payment / booking / payment cancel  ---token 

export const authServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword
}