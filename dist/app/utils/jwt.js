"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokens = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload, secret, expiresIn) => {
    const token = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn
    });
    return token;
};
exports.generateToken = generateToken;
const verifyTokens = (token, secret) => {
    const verifyToken = jsonwebtoken_1.default.verify(token, secret);
    return verifyToken;
};
exports.verifyTokens = verifyTokens;
