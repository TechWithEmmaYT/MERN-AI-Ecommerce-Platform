import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { NextFunction, Request, Response } from "express";
import { envConfig } from "./env.config";
import passport from "passport";
import { findUserById } from "../services/user.service";
import { generateGuestCartId } from "../utils/helper";
import { setGuestCartCookie } from "../utils/cookie.util";
import { any } from "zod";

const cookieExtractor = (req: Request) => {
  return req?.cookies?.instant_access_token ?? null;
};

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: envConfig.JWT_SECRET,
  audience: ["user"],
};

passport.use(
  new JwtStrategy(options, async (payload: { userId: string }, done) => {
    try {
      const user = await findUserById(payload.userId);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }),
);

export default passport;

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});

export const optionalCartAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req?.cookies?.instant_access_token;

  if (!token) {
    const guestCartId =
      req?.cookies?.instant_guest_cart_id ?? generateGuestCartId();
    req.user = undefined;
    req.guestCartId = guestCartId;
    if (!req.cookies?.instant_guest_cart_id)
      setGuestCartCookie(res, guestCartId);
    return next();
  }
  passport.authenticate("jwt", { session: false }, (_err: any, user: any) => {
    req.user = user;
    req.guestCartId = null;
    return next();
  })(req,res, next)
};
