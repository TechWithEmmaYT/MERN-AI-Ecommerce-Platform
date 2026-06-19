import UserModel from "../models/user.model";
import { BadRequestException, UnauthorizedException } from "../utils/app-error";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { mergeGuestCartService } from "./cart.service";

export const registerService = async (data: RegisterInput) => {
  const existingUser = await UserModel.findOne({ 
    email: data.email });
  if (existingUser) {
    throw new BadRequestException("Email already in use");
  }
  const user = await UserModel.create(data);
  return user;
};

export const loginService = async ({ email, password }: LoginInput) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new UnauthorizedException("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  return user;
};


export const registerAndMergeGuestCart = async (
  data: RegisterInput,
  guestCartId: string | null
) => {
  const user = await registerService(data);
  await mergeGuestCartService(user._id.toString(), guestCartId);
  return user;
};


export const loginAndMergeGuestCart = async (
  email: string,
  password: string,
  guestCartId: string | null
) => {
  const user = await loginService({ email, password });
  await mergeGuestCartService(user._id.toString(), guestCartId);
  return user;
};
