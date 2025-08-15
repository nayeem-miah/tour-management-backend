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
exports.UserControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_service_1 = require("./user.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
// import AppError from "../../errorHelpers/appError";
// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // throw new Error("fake error");
//         // throw new AppError(StatusCodes.BAD_REQUEST, "fake Error ")
//         const user = await userServices.createUser(req.body);
//         res.status(StatusCodes.CREATED).json({
//             message: "User created successfully",
//             user
//         })
//     } catch (err: any) {
//         console.log(err);
//         next(err)
//     }
// };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.userServices.createUser(req.body);
    // res.status(StatusCodes.CREATED).json({
    //     message: "user created success",
    //     user
    // })
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        message: "user created successfully",
        data: user,
        success: true
    });
}));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifyToken = verifyTokens(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload
    const verifyToken = req.user;
    const payload = req.body;
    const user = yield user_service_1.userServices.updateUser(userId, payload, verifyToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        message: "user updated successfully",
        data: user,
        success: true
    });
}));
// const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const users = await userServices.getAllUsers();
//         res.status(StatusCodes.ACCEPTED).json({
//             message: "users find success",
//             users
//         })
//     } catch (err: any) {
//         console.log(err);
//         next(err)
//     }
// }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield user_service_1.userServices.getAllUsers(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "all users retrieved  successfully",
        data: result.data,
        meta: result.meta
    });
}));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSingleUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield user_service_1.userServices.getSingleUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "user retrieved successfully",
        data: result.data
    });
}));
//  users profile 
const getMe = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const result = yield user_service_1.userServices.getMe(decodedToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "your profile retrieved successfully",
        data: result.data
    });
}));
exports.UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe
};
/**
 * route matching --> controller ---> services --> model ---> db
 */ 
