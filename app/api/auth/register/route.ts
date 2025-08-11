import connectDB from "@/lib/db/db";
import { userSignupSchema } from "@/lib/validations/userSignup.schema";
import userModel from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = userSignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const { username, email, password, role } = parsed.data;

    const existingVerifiedUsername = await userModel.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUsername) {
      return NextResponse.json(
        { success: false, message: "Username already taken" },
        { status: 400 }
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerifyCode = await bcrypt.hash(verifyCode, 10);
    const expiryDate = new Date(Date.now() + 3600000);

    const existingUserByEmail = await userModel.findOne({ email });

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          { success: false, message: "User already exists with this email" },
          { status: 400 }
        );
      }

      existingUserByEmail.password = await bcrypt.hash(password, 10);
      existingUserByEmail.verifyCode = hashedVerifyCode;
      existingUserByEmail.verifyCodeExpiry = expiryDate;
      await existingUserByEmail.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new userModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: hashedVerifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        role,
      });
      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return NextResponse.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully. Please verify your email" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
