"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "no token received");
        }
        // const verifyToken = jwt.verify(accessToken, "secret");
        const verifyToken = (0, jwt_1.verifyTokens)(accessToken, env_1.envVars.JWT_ACCESS_SECRET);
        const isUserExists = yield user_model_1.User.findOne({ email: verifyToken.email });
        if (!isUserExists) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User does not exist");
        }
        if (isUserExists.isActive === user_interface_1.IsActive.BLOCKED || isUserExists.isActive === user_interface_1.IsActive.INACTIVE) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `User is ${isUserExists.isActive}`);
        }
        if (isUserExists.isDeleted) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is deleted");
        }
        if (!isUserExists.isVerified) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is not verified");
        }
        if (!authRoles.includes(verifyToken.role)) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "you are not permeated to view this route");
        }
        req.user = verifyToken;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkAuth = checkAuth;
