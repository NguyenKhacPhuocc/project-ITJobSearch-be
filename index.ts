import express from 'express';
import cors from "cors";
import routes from "./routes/index.route";
import { connectDB } from './config/DBconnect';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

// load biến môi trường
dotenv.config();

const app = express();
const port = 8000;

// kết nối DB
connectDB();

// cấu hình CORS
app.use(cors({
  origin: "http://localhost:3000", // domain frontend
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // cho phép gửi cookie từ backend -> frontend (domain khác nhau)
}))

// cho phép data gửi lên dạng json
app.use(express.json());

// cấu hình lấy cookie
app.use(cookieParser());

// thiết lập đường dẫn
app.use("/", routes);



app.listen(port, () => {
  console.log(`website đang chạy trên cổng ${port}`);
});
