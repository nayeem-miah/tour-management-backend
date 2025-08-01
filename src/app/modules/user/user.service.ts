import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs"
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const IsUserExist = await User.findOne({ email });

    if (IsUserExist) {
        throw new AppError(StatusCodes.BAD_REQUEST, "user already exist")
    };

    const hashPassword = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SLOT_ROUND));
    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };

    const user = await User.create({
        email,
        password: hashPassword,
        auths: [authProvider],
        ...rest
    })
    return user

};


const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const IsUserExist = await User.findById(userId);

    if (!IsUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found")
    }

    // if (IsUserExist.isDeleted || IsUserExist.isActive === IsActive.BLOCKED) {
    //     throw new AppError(StatusCodes.FORBIDDEN, "This user can not be updated")
    // }

    /**
     * email --------> can not updated
     * name , phone , address , password ---> updated
     * password ------ re hashing 
     * only admin and super admin ---> role, isDeleted, isVerified ...... 
     * 
     * promoting to super admin ----> super admin
     */

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized")
        }

        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(StatusCodes.FORBIDDEN, "you are not authorized")
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized")
        }
    }

    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, envVars.BCRYPT_SLOT_ROUND)
    };

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true })
    return newUpdatedUser;

}

const getAllUsers = async () => {

    const users = await User.find({});

    const totalUsers = await User.countDocuments()

    return {
        data: users,
        meta: {
            total: totalUsers
        }
    }
}

export const userServices = {
    createUser,
    getAllUsers,
    updateUser
}