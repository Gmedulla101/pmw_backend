"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
/* interface ModifiedErr extends Error {
  statusCode: number;
  errors: any;
  value: any;
  code: any;
  keyValue: any;
} */
const errorHandlerMiddleware = (err, req, res, next) => {
    var _a;
    let customError = {
        statusCode: err.statusCode || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong, please try again later',
    };
    //VALIDATION ERROR
    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors)
            .map((items) => items.message)
            .join(', also, ');
        customError.statusCode = 400;
    }
    //CAST ERROR
    if (err.name === 'CastError') {
        customError.msg = `No item found with an id of ${err.value}`;
        customError.statusCode = 404;
    }
    // DUPLICATE ERROR
    if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field: Email already exists`;
        customError.statusCode = 400;
    }
    //INVALID PROVISIONING
    if (err.code === 'P2003') {
        customError.msg = 'Invalid seller or buyer ID provided';
        customError.statusCode = 400;
    }
    //PAYSTACK INVALIDITY ERROR
    if (err.response.data.type === 'validation_error') {
        customError.msg = err.response.data.message;
        customError.statusCode = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status;
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    res.status(customError.statusCode).json({ msg: customError.msg });
    return;
};
exports.default = errorHandlerMiddleware;
//# sourceMappingURL=err-handler.js.map