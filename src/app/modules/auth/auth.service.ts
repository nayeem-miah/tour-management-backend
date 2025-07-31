import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from 'bcryptjs';

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

    return {
        email: isUserExists.email
    }

};

// user ----> login-- token (email, role , _id ) ---booking

export const autLogin = {
    credentialsLogin
}