import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z.string()
        .min(2, { message: "Name too short. Minimum 2 characters." })
        .max(50, { message: "Name too long. Maximum 50 characters." }),

    email: z.string()
        .nonempty({ message: "Email is required" })
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email too short" })
        .max(100, { message: "Email too long" }),

    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),

    phone: z.string()
        .regex(/^(\+8801|8801|01)[0-9]{9}$/, {
            message: "Invalid Bangladeshi phone number"
        })
        .optional(),

    address: z.string().optional(),

    role: z.enum(Object.values(Role) as [string]).optional(),

    IsActive: z.enum(Object.values(IsActive) as [string]).optional(),

    isDeleted: z.boolean({ message: "isDeleted must be true or false" }).optional(),

    isVerified: z.boolean({ message: "isVerified must be true or false" }).optional()


});

export const updatedUserZodSchema = z.object({
    name: z.string()
        .min(2, { message: "Name too short. Minimum 2 characters." })
        .max(50, { message: "Name too long. Maximum 50 characters." }).optional(),

    // password: z.string()
    //     .min(8, { message: "Password must be at least 8 characters long" })
    //     .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    //     .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }).optional(),

    phone: z.string()
        .regex(/^(\+8801|8801|01)[0-9]{9}$/, {
            message: "Invalid Bangladeshi phone number"
        })

        .optional(),
    address: z.string().optional()
});