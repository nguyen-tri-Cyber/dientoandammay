import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  // 1. Lấy token từ Header Authorization (Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Kiểm tra nếu không có token
  if (!token) {
    return res.status(401).json({ message: "No token provided!" });
  }

  // 3. Xác thực token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ message: "Unauthorized! Invalid or expired token." });
    }

    // 4. Lưu thông tin user vào request để các controller sau có thể sử dụng
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // 5. Chuyển sang controller tiếp theo
    next();
  });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Forbidden! You do not have permission." });
    }
    next();
  };
};