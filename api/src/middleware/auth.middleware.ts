import type { Request, NextFunction, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import pool from "../config/db.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided"
      });
    }
    
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || !parts[1]) {
      return res.status(401).json({
        error: "Invalid authorization header"
      });
    }
    
    const token = parts[1];
    const decoded = verifyAccessToken(token);
    
    const userRes = await pool.query(`
      select id, token_version from users where id = $1
    `, [decoded.userId]);
    
    const user = userRes.rows[0];
    
    if (!user) {
      return res.status(401).json({
        error: "User not found"
      });
    }
    
    if (user.token_version !== decoded.token_version) {
      return res.status(401).json({
        error: "Invalid token"
      });
    }
    
    req.user = {
      id: user.id
    };
    
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: err?.message || "Authentication failed"
    });
  }
}