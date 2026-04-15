import bcrypt from "bcrypt";
import AppError from "../../common/utils/api-error.js";
import authModel from "./auth.model.js";

const register = async (userdata) => {
  const { name, email, password } = userdata;
  const userCheck = await authModel.findUserByEmail(email);
  if (userCheck) {
    throw AppError.conflict("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  return await authModel.createUser(name, email, passwordHash);
};

const login = async (userdata) => {
  const { email, password } = userdata;
  const user = await authModel.findUserByEmail(email);
  
  if (!user) {
    throw AppError.notFound("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid password");
  }

  return user;
};

export { register, login };
