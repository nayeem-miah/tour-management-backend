import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs"
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    // const IsUserExist = await User.findOne({ email });

    // if (IsUserExist) {
    //     throw new AppError(StatusCodes.BAD_REQUEST, "user already exist")
    // };

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

const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)

    const users = await queryBuilder
        .search(["email", "name"])
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ])
    return {
        data: data,
        meta: meta
    }
}
const getSingleUser = async (id: string) => {
    const result = await User.findById(id)

    return {
        data: result

    }
}

export const userServices = {
    createUser,
    getAllUsers,
    updateUser,
    getSingleUser
}