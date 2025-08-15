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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const passport_local_1 = require("passport-local");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password"
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isUserExists = yield user_model_1.User.findOne({ email });
        // user not found
        // if (!isUserExists) {
        //     return done(null, false, { message: "user not found" })
        // }
        if (!isUserExists) {
            return done("User does not exists");
        }
        if (!isUserExists.isVerified) {
            // throw new AppError(StatusCodes.BAD_REQUEST, "User is not verified");
            return done("User is not verified");
        }
        if (isUserExists.isActive === user_interface_1.IsActive.BLOCKED || isUserExists.isActive === user_interface_1.IsActive.INACTIVE) {
            // throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExists.isActive}`);
            return done(`User is ${isUserExists.isActive}`);
        }
        if (isUserExists.isDeleted) {
            // throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
            return done("User is deleted");
        }
        //  user auths
        const isGoogleAuthenticated = isUserExists === null || isUserExists === void 0 ? void 0 : isUserExists.auths.some(providerObj => providerObj.provider === "google");
        if (isGoogleAuthenticated && !isUserExists.password) {
            return done(null, false, { message: "You have authenticated thought google. Want to login to credential, then at first login with google and set a password your gmail and you can login with email and password" });
        }
        // if (isGoogleAuthenticated) {
        //     return done("You have authenticated thought google. Want to login to credential, then at first login with google and set a password your gmail and you can login with email and password")
        // }
        // check password
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, isUserExists.password);
        // incorrect password
        if (!isPasswordMatch) {
            return done(null, false, { message: "Invalid email or password" });
        }
        // success 
        return done(null, isUserExists);
    }
    catch (error) {
        console.log(error);
        return done(error);
    }
})));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            return done(null, false, { message: "no email found" });
        }
        let isUserExists = yield user_model_1.User.findOne({ email });
        if (isUserExists && !isUserExists.isVerified) {
            // throw new AppError(StatusCodes.BAD_REQUEST, "User is not verified");
            // done("User is not verified")
            return done(null, false, { message: "User is not verified" });
        }
        if (isUserExists && (isUserExists.isActive === user_interface_1.IsActive.BLOCKED || isUserExists.isActive === user_interface_1.IsActive.INACTIVE)) {
            // throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExists.isActive}`);
            return done(null, false, { message: `User is ${isUserExists.isActive}` });
        }
        if (isUserExists && isUserExists.isDeleted) {
            // throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
            return done(null, false, { message: "user is deleted" });
        }
        if (!isUserExists) {
            isUserExists = yield user_model_1.User.create({
                email,
                name: profile.displayName,
                picture: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
                role: user_interface_1.Role.USER,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerId: profile.id
                    }
                ]
            });
        }
        return done(null, isUserExists);
    }
    catch (error) {
        console.log("google staggy error", error);
        return done(error);
    }
})));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
}));
