import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import { generateAccessToken, generateRefreshToken } from "../../common/utils/jwt.utils.js";

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    ApiResponse.created(res, "User registered successfully", user);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    ApiResponse.ok(res, "Login successful", {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

export { register, login };
