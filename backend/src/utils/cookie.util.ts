import { Response } from "express";
import { envConfig } from "../config/env.config";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_COOKIE = "instant_access_token";
const GUEST_CART_TOKEN_COOKIE = "instant_guest_cart_id";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const GUEST_CART_EXPIRY_DAYS = 14 * 24 * 60 * 60 * 1000;


type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;
type Cookie = {
  res: Response;
  userId: string;
};

export const setJwtAuthCookie = ({res, userId}:Cookie) => {
  const payload = {userId}
  const expiresIn = envConfig.JWT_EXPIRES_IN as Time;
  const token = jwt.sign(payload, envConfig.JWT_SECRET,{
    audience:["user"],
    expiresIn,
  })
  return res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: envConfig.NODE_ENV === "production" ? "strict":"lax",
    maxAge: SEVEN_DAYS,
  });
};

export const clearJwtAuthCookie = (res: Response) => {
  return res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
  });
};


export function setGuestCartCookie(res: Response, guestCartId: string) {
  return res.cookie(GUEST_CART_TOKEN_COOKIE, guestCartId, {
    maxAge: GUEST_CART_EXPIRY_DAYS,
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
  });
}

export function clearGuestCartCookie(res: Response) {
  return res.clearCookie(GUEST_CART_TOKEN_COOKIE,{
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
  });
}