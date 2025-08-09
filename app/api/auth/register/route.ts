import connectDB from "@/lib/db/db";
import { userSignupSchema } from "@/lib/validations/userSignup.schema";
import userModel from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { setAuthCookie } from "@/lib/auth/setAuthCookies";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = userSignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { username, email, password, role } = parsed.data;
    const existedUser = await userModel.findOne({ email });
    if (existedUser) {
      return NextResponse.json(
        {
          message: "User already exists with this email",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    const userData = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    const response = NextResponse.json(
      { message: "User registered successfully", user: userData },
      { status: 201 }
    );
    setAuthCookie(response, newUser._id.toString());
    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
