import jwt from "jsonwebtoken";
import type { jwtpayload } from "../modules/types/jwt.types.js";

const access_secret = process.env.ACCESS_TOKEN_SECRET!;
if (!access_secret) throw new Error("ACCESS_TOKEN_SECRET is not defined");

const refresh_secret = process.env.REFRESH_TOKEN_SECRET!;
if (!refresh_secret) throw new Error("REFRESH_TOKEN_SECRET is not defined");
export type JwtPayloadWithMeta = jwtpayload & {
  iat: number;
  exp: number;
};

export function signAccessToken(payload: jwtpayload)
{
  return jwt.sign(payload, access_secret, {
    expiresIn: "15m"
  });
}

export function signRefreshToken(payload: jwtpayload)
{
  return jwt.sign(payload, refresh_secret, {
    expiresIn: "15d"
  });
}

export function verifyAccessToken(token: string): JwtPayloadWithMeta
{
  const decoded = jwt.verify(token, access_secret);
  if (typeof decoded === "string")
  {
    throw new Error("Invalid access token payload");
  }
  return decoded as JwtPayloadWithMeta;
}

export function verifyRefreshToken(token: string): JwtPayloadWithMeta
{
  const decoded = jwt.verify(token, refresh_secret);
  if (typeof decoded === "string")
  {
    throw new Error("Invalid refresh token payload");
  }
  return decoded as JwtPayloadWithMeta;
}