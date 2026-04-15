import AppError from "../utils/api-error.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw AppError.unauthorized("Authentication required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(AppError.unauthorized("Invalid or expired token"));
  }
};

export default authMiddleware;
