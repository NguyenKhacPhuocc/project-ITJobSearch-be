# IT Job Search - Backend (be)

Backend cho dự án IT Job Search, xây dựng bằng Node.js + Express + TypeScript, kết nối với MongoDB.
Ứng dụng cung cấp API cho frontend để quản lý việc làm, ứng viên và nhà tuyển dụng.

---

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Cách sử dụng](#cách-sử-dụng)
- [Cấu trúc thư mục dự án](#cấu-trúc-thư-mục-dự-án)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Deploy on Render](#deploy-on-render)
- [Tác giả](#tác-giả)

---

## Giới thiệu
- Đây là phần **Backend** của dự án IT Job Search.  
- Cung cấp RESTful API cho frontend (Next.js).
- Tích hợp xác thực JWT, upload file Cloudinary, Redis caching, MongoDB database.
- Viết bằng TypeScript, hỗ trợ dễ mở rộng và bảo trì.  

---

## Tính năng

**Xác thực**: JWT cho người dùng và nhà tuyển dụng.
**Quản lý người dùng**: đăng ký, đăng nhập, quản lý hồ sơ.
**Quản lý công ty & tin tuyển dụng**: CRUD với MongoDB.
**Upload file (CV, logo công ty, banner)**: Cloudinary + Multer.
**Validation dữ liệu**: Joi.
**Caching**: Redis.
**Bảo mật**: bcryptjs, cookie-parser, cors.

---

## Yêu cầu hệ thống
- Node --version: **v22.11.0**
- npm / yarn 
- MongoDB (local hoặc Atlas)

---

## Cài đặt
Clone dự án và cài đặt dependencies:

```bash
git clone https://github.com/NguyenKhacPhuocc/project-ITJobSearch-be.git
cd project-ITJobSearch-be #tên thư mục chứa be
yarn install
```
Chạy ở môi trường dev
```bash
yarn dev
```
Build TypeScript:
```bash
yarn build
```
Chạy production:
```bash
yarn start
```

---

## Biến môi trường
Tạo file .env tại thư mục gốc:
```env
DATABASE = "mongodb+srv://user:password@cluster0.dhfg9nn.mongodb.net/db-name"
JWT_SECRET = "random-string"
NODE_ENV = "" # môi trường dev
CLOUDINARY_NAME = ""
CLOUDINARY_API_KEY = ""
CLOUDINARY_API_SECRET = ""

GOOGLE_API_KEY = "your_api_key"
```
---

## Cách sử dụng
Sau khi chạy yarn dev, fe có thể kết nối api ở:
```bash
http://localhost:8000/
```

---

## Cấu trúc thư mục dự án
```bash
project-ITJobSearch-fe/
│   .env
│   .env.example
│   .gitignore
│   index.ts
│   package.json
│   README.md
│   tree.txt
│   tsconfig.json
│   yarn.lock
│   
├───config
│       DBconnect.ts
│       variable.ts
│       
├───controllers
│       ai.controller.ts
│       auth.controller.ts
│       city.controller.ts
│       company.controller.ts
│       job.controller.ts
│       search.controller.ts
│       upload.controller.ts
│       user.controller.ts
│               
├───helpers
│       cloudinary.helper.ts
│       
├───interfaces
│       request.interface.ts
│       
├───middlewares
│       auth.middleware.ts
│       
├───models
│       account-company.model.ts
│       account-user.model.ts
│       city.model.ts
│       cv.model.ts
│       job.model.ts
│
├───routes
│       ai.route.ts
│       auth.route.ts
│       city.route.ts
│       company.route.ts
│       index.route.ts
│       job.route.ts
│       search.route.ts
│       upload.route.ts
│       user.route.ts
│       
└───validates
        company.validate.ts
        job.validate.ts
        user.validate.ts
        
```

---

## Công nghệ sử dụng
Dự án Backend được xây dựng với các công nghệ chính sau:  

- **Runtime & Framework**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)  
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/)  
- **Cơ sở dữ liệu**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)  
- **Xác thực & Bảo mật**: [JWT](https://jwt.io/), [bcryptjs](https://www.npmjs.com/package/bcryptjs), [cookie-parser](https://www.npmjs.com/package/cookie-parser), [cors](https://www.npmjs.com/package/cors)  
- **Upload & Quản lý file**: [Cloudinary](https://cloudinary.com/), [Multer](https://github.com/expressjs/multer)  
- **Bộ nhớ đệm (Caching)**: [Redis](https://redis.io/) + [ioredis](https://github.com/redis/ioredis)  
- **Validation dữ liệu**: [Joi](https://joi.dev/)  
- **Dev Tools**: [Nodemon](https://nodemon.io/), [ts-node](https://typestrong.org/ts-node/), [TypeScript](https://www.typescriptlang.org/)

---

## Deploy on Render
Deploy link: [it-job-search-be](https://itjobsearch-be.onrender.com)

---

## Tác giả
Nguyễn Khắc Phước – GitHub: [NguyenKhacPhuocc](https://github.com/NguyenKhacPhuocc)
