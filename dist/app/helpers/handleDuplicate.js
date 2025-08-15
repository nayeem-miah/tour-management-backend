"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicate = void 0;
const handleDuplicate = (err) => {
    const matchArray = err.message.match(/"([^"]*)"/);
    return {
        statusCode: 400,
        message: `${matchArray[1]} already exists`
    };
};
exports.handleDuplicate = handleDuplicate;
