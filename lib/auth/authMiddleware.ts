import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const verifyAuth = (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return { error: "Not authenticated" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role?: string;
    };

    return { userId: decoded.id, role: decoded.role || "startup" };
  } catch (err) {
    return { error: "Invalid or expired token" };
  }
};
