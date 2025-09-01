/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';
import { createNewAccessTokenWithRefreshToken, createUserToken } from "../../utils/userToken";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import jwt from "jsonwebtoken"
import { sendEmail } from "../../utils/sendEmail";

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


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {

    if (payload.id != decodedToken.userId) {
        throw new AppError(401, "You can not reset your password")
    }

    const isUserExist = await User.findById(decodedToken.userId)
    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const hashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(envVars.BCRYPT_SLOT_ROUND)
    )

    isUserExist.password = hashedPassword;

    await isUserExist.save()
}


const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user!.password as string)
    if (!isOldPasswordMatch) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Old Password does not match");
    }

    user!.password = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SLOT_ROUND))

    user!.save();


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

const forgotPassword = async (email: string) => {
    const isUserExists = await User.findOne({ email });

    if (!isUserExists) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist");
    }

    if (!isUserExists.isVerified) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is not verified");
    }

    if (isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE) {
        throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExists.isActive}`);
    }

    if (isUserExists.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
    }


    const jwtPayload = {
        userId: isUserExists._id,
        email: isUserExists.email,
        role: isUserExists.role
    };

    const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    })

    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExists._id}&token=${resetToken}`

    sendEmail({
        to: isUserExists.email,
        subject: "Password Reset",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExists.name,
            resetUILink
        }
    })
}

/**
 * http://localhost:3000/reset-password?id=689b6380852465d9cb4e05fb&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODliNjM4MDg1MjQ2NWQ5Y2I0ZTA1ZmIiLCJlbWFpbCI6ImRldi5uYXllZW0wMUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NTAxNTY3NywiZXhwIjoxNzU1MDE2Mjc3fQ.Gu6UbCHD5RtYLS7lnqv_SN3VzBjZ-ltH2MuBxjMgCZ4
 */

// user ----> login-- token (email, role , _id ) ---booking / payment / booking / payment cancel  ---token 

export const authServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword
}