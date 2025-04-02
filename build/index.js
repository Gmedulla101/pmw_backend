"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
//ERROR MIDDLERWARE
const notfound_middleware_1 = __importDefault(require("./middleware/notfound-middleware"));
const err_handler_1 = __importDefault(require("./middleware/err-handler"));
//ROUTERS
const auth_route_1 = __importDefault(require("./routes/auth-route"));
const txn_route_1 = __importDefault(require("./routes/txn-route"));
const user_route_1 = __importDefault(require("./routes/user-route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
//BOILERPLATE MIDDLEWARE
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
//ROUTES
app.use('/api/v1/auth', auth_route_1.default);
app.use('/api/v1/txn', txn_route_1.default);
app.use('/api/v1/user', user_route_1.default);
//ERROR MIDDLEWARE
app.use(notfound_middleware_1.default);
app.use(err_handler_1.default);
//STARTING THE SERVER
const startServer = () => {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
};
startServer();
//# sourceMappingURL=index.js.map