import bcrypt from "bcrypt";
import connectDB from "@/lib/db/db";
import { userLoginSchema } from "@/lib/validations/userLogin.schema";
import userModel from "@/models/user.model";
import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth/setAuthCookies";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = userLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!existingUser.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email before logging in" },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Login successful",
      data: {
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role, // return role
      },
    });
    try {
      return setAuthCookie(response, existingUser._id, existingUser.role);
    } catch (jwtError) {
      console.error("JWT Error:", jwtError);
      return NextResponse.json(
        { message: "Failed to generate authentication token" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
