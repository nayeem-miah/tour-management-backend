"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default.string()
        .min(2, { message: "Name too short. Minimum 2 characters." })
        .max(50, { message: "Name too long. Maximum 50 characters." }),
    email: zod_1.default.string()
        .nonempty({ message: "Email is required" })
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email too short" })
        .max(100, { message: "Email too long" }),
    password: zod_1.default.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    phone: zod_1.default.string()
        .regex(/^(\+8801|8801|01)[0-9]{9}$/, {
        message: "Invalid Bangladeshi phone number"
    })
        .optional(),
    address: zod_1.default.string().optional(),
    role: zod_1.default.enum(Object.values(user_interface_1.Role)).optional(),
    IsActive: zod_1.default.enum(Object.values(user_interface_1.IsActive)).optional(),
    isDeleted: zod_1.default.boolean({ message: "isDeleted must be true or false" }).optional(),
    isVerified: zod_1.default.boolean({ message: "isVerified must be true or false" }).optional()
});
exports.updatedUserZodSchema = zod_1.default.object({
    name: zod_1.default.string()
        .min(2, { message: "Name too short. Minimum 2 characters." })
        .max(50, { message: "Name too long. Maximum 50 characters." }).optional(),
    // password: z.string()
    //     .min(8, { message: "Password must be at least 8 characters long" })
    //     .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    //     .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }).optional(),
    phone: zod_1.default.string()
        .regex(/^(\+8801|8801|01)[0-9]{9}$/, {
        message: "Invalid Bangladeshi phone number"
    })
        .optional(),
    address: zod_1.default.string().optional()
});
