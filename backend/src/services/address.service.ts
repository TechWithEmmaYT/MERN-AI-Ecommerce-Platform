import AddressModel from "../models/address.model";
import { CreateAddressInput } from "../validators/address.validator";

export const createAddressService = async (
  userId: string,
  data: CreateAddressInput
) => {
  await AddressModel.updateMany(
    { userId, isDefault: true },
    { $set: { isDefault: false } }
  );

  const address = await AddressModel.create({
    ...data,
    userId,
    isDefault: true,
  });
  return address;
};

export const getUserAddressesService = async (userId: string) => {
  const addresses = await AddressModel.find({ userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
  return { addresses };
};
