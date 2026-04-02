import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
    userId?: string;
}

export const validateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: "No token" });
        return;
    }

    try {
        const decoded = verifyToken(authHeader);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(403).json({ message: "Invalid token" });
    }
};