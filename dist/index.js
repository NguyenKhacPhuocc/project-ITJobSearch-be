"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const DBconnect_1 = require("./config/DBconnect");
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// load biến môi trường
dotenv_1.default.config();
const app = (0, express_1.default)();
// kết nối DB
(0, DBconnect_1.connectDB)();
// cấu hình CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // domain frontend
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // cho phép gửi cookie từ backend -> frontend (domain khác nhau)
}));
// cho phép data gửi lên dạng json
app.use(express_1.default.json());
// cấu hình lấy cookie
app.use((0, cookie_parser_1.default)());
// thiết lập đường dẫn
app.use("/", index_route_1.default);
app.listen(process.env.PORT || 8000, () => {
    console.log(`website đang chạy trên cổng ${process.env.PORT || 8000}`);
});
