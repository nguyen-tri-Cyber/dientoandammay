import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = parts[1];

  if (process.env.INTERNAL_SERVICE_TOKEN && token === process.env.INTERNAL_SERVICE_TOKEN) {
    req.user = { id: null, role: "service" };
    req.userId = null;
    req.userRole = "service";
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ message: "Unauthorized! Invalid or expired token." });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  });
};
