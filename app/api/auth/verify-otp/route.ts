import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import UserModel from "@/models/user.model";
import dbConnect from "@/lib/db/db";

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already verified",
        },
        { status: 400 }
      );
    }

    if (!user.verifyCodeExpiry || user.verifyCodeExpiry < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired",
        },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(otp, user.verifyCode || "");
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
