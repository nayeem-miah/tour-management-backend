import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs"
const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const IsUserExist = await User.findOne({ email });

    if (IsUserExist) {
        throw new AppError(StatusCodes.BAD_REQUEST, "user already exist")
    };

    const hashPassword = await bcrypt.hash(password as string, 10);
    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };

    const user = await User.create({
        email,
        password: hashPassword,
        auths: [authProvider],
        ...rest
    })
    return user

};

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
    getAllUsers
}