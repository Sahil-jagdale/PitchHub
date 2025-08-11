import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import UserModel from "@/models/user.model";
import dbConnect from "@/lib/db/db";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

const resendOtpSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const parsed = resendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

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
          message: "Email is already verified",
        },
        { status: 400 }
      );
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(newOtp, 10);

    user.verifyCode = hashedOtp;
    user.verifyCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
    await user.save();
    await sendVerificationEmail(email, user.username, newOtp);

    return NextResponse.json({
      success: true,
      message: "Verification code resent successfully",
    });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
