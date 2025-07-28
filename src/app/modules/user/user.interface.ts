import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    GUIDE = "GUIDE"
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}


//  auth providers
/**
 * email, password
 * google authentication
 */
export interface IAuthProvider {
    provider: string; // "google , credential provider"
    providerId: string
};

export interface IUser {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    address?: string;
    isDeleted?: string;
    isActive?: IsActive;
    isVerified?: string
    role: Role;
    auths: IAuthProvider[];
    booking?: Types.ObjectId[]
    guides?: Types.ObjectId[]
}