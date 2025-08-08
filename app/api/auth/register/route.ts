import connectDB from "@/lib/db/db";
import { userSignupSchema } from "@/lib/validations/userSignup.schema";
import userModel from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

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
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
