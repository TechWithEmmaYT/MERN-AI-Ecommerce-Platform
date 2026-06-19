import bcrypt from "bcryptjs";

export const hashValue = async (value: string, saltRounds = 10): Promise<string> => {
  return bcrypt.hash(value, saltRounds);
};

export const compareValue = async (value: string, hashedValue: string): Promise<boolean> => {
  return bcrypt.compare(value, hashedValue);
};
