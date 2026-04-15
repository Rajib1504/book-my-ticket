import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import { generateAccessToken } from "../../common/utils/jwt.utils.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

const register = async (req, res) => {
  try {
    // Validate input with Joi
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({ success: false, message: messages.join(" | ") });
    }

    const user = await authService.register(value);
    ApiResponse.created(res, "User registered successfully", user);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    // Validate input with Joi
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({ success: false, message: messages.join(" | ") });
    }

    const user = await authService.login(value);

    const accessToken = generateAccessToken({ id: user.id, email: user.email });

    ApiResponse.ok(res, "Login successful", {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export { register, login };
