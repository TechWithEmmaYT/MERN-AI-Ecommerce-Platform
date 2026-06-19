import UserModel from "../models/user.model";

export const findUserById = async (id: string) => {
  return UserModel.findById(id).select("-password");
};
