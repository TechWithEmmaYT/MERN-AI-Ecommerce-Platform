import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      guestCartId?: string | null;
    }
  }
}
