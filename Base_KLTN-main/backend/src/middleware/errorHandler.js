export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { message, statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/*
GIẢI THÍCH FILE
=====================

Mục đích:
File này chứa middleware xử lý lỗi toàn cục cho ứng dụng Express.

Các function chính:
- errorHandler(): Xử lý tất cả các lỗi phát sinh trong ứng dụng.
  Bao gồm các loại lỗi:
  - CastError: Khi ObjectId không hợp lệ
  - 11000 (Duplicate): Khi trùng unique field (email, username)
  - ValidationError: Khi dữ liệu không hợp lệ schema
- notFound(): Xử lý khi route không tồn tại.

Cách hoạt động:
1. ErrorHandler là middleware có 4 tham số (err, req, res, next)
2. Tự động được gọi khi có lỗi trong chain
3. Trả về JSON response với status code và message phù hợp

Luồng hoạt động:
Error → Middleware Chain → errorHandler → JSON Response

Ghi chú:
File này được sử dụng trong src/index.js ở cuối middleware chain.
Trong môi trường development, stack trace được trả về để debug.
*/
