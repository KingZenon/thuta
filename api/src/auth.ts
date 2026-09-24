import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export type SessionUser = { id: string; email: string; role: "USER" | "ADMIN" };

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function signToken(user: SessionUser) {
  return jwt.sign(user, config.JWT_ACCESS_SECRET, { expiresIn: "8h" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sign in required." } });
  try {
    req.user = jwt.verify(token, config.JWT_ACCESS_SECRET) as SessionUser;
    next();
  } catch {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Session expired or invalid." } });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Administrator access required." } });
  }
  next();
}
