"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.default = CustomApiError;
//# sourceMappingURL=custom-error.js.map