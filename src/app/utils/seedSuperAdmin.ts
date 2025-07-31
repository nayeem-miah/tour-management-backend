import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model"
import bcrypt from "bcryptjs"
export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExists = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL })

        if (isSuperAdminExists) {
            console.log("super admin is exists");
            return
        }


        // hash password 
        const hasPassword = await bcrypt.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SLOT_ROUND))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL
        }
        const payload: IUser = {
            name: "super admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hasPassword,
            isVerified: true,
            auths: [authProvider]
        }

        const superAdmin = await User.create(payload);

        console.log(superAdmin);
    } catch (error) {
        console.log(error)
    }
}