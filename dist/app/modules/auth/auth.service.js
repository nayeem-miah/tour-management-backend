"use strict";
/* eslint-disable @typescript-eslint/no-non-null-assertion */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userToken_1 = require("../../utils/userToken");
const env_1 = require("../../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../../utils/sendEmail");
const credentialsLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isUserExists = yield user_model_1.User.findOne({ email });
    if (!isUserExists) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User not found");
    }
    const isPasswordMatch = yield bcryptjs_1.default.compare(password, isUserExists.password);
    if (!isPasswordMatch) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "incorrect password ");
    }
    const userTokens = (0, userToken_1.createUserToken)(isUserExists);
    // delete password
    // delete isUserExists.password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = isUserExists.toObject(), { password: pass } = _a, rest = __rest(_a, ["password"]);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userToken_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken
    };
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetPassword = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.id != decodedToken.userId) {
        throw new appError_1.default(401, "You can not reset your password");
    }
    const isUserExist = yield user_model_1.User.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new appError_1.default(401, "User does not exist");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(env_1.envVars.BCRYPT_SLOT_ROUND));
    isUserExist.password = hashedPassword;
    yield isUserExist.save();
});
const changePassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Old Password does not match");
    }
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SLOT_ROUND));
    user.save();
});
const setPassword = (userId, plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    ;
    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You have already set your password. Now you can not change the password from your profile password updated");
    }
    const hashPassword = yield bcryptjs_1.default.hash(plainPassword, Number(env_1.envVars.BCRYPT_SLOT_ROUND));
    const credentialProvider = {
        provider: "credentials",
        providerId: user.email
    };
    const auths = [...user.auths, credentialProvider];
    user.password = hashPassword;
    user.auths = auths;
    yield user.save();
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.User.findOne({ email });
    if (!isUserExists) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User does not exist");
    }
    if (!isUserExists.isVerified) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is not verified");
    }
    if (isUserExists.isActive === user_interface_1.IsActive.BLOCKED || isUserExists.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `User is ${isUserExists.isActive}`);
    }
    if (isUserExists.isDeleted) {
        throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is deleted");
    }
    const jwtPayload = {
        userId: isUserExists._id,
        email: isUserExists.email,
        role: isUserExists.role
    };
    const resetToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    });
    const resetUILink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExists._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExists.email,
        subject: "Password Reset",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExists.name,
            resetUILink
        }
    });
});
/**
 * http://localhost:5173/reset-password?id=689b6380852465d9cb4e05fb&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODliNjM4MDg1MjQ2NWQ5Y2I0ZTA1ZmIiLCJlbWFpbCI6ImRldi5uYXllZW0wMUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NTAxNTY3NywiZXhwIjoxNzU1MDE2Mjc3fQ.Gu6UbCHD5RtYLS7lnqv_SN3VzBjZ-ltH2MuBxjMgCZ4
 */
// user ----> login-- token (email, role , _id ) ---booking / payment / booking / payment cancel  ---token 
exports.authServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword
};
