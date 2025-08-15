import ApiResponse from "@/utils/ApiResponse";
import connectDB from "@/lib/db/db";
import { NextResponse } from "next/server";
import { pitchValidationSchema } from "@/lib/validations/pitch.schema";
import pitchSchema from "@/models/pitchSchema";
import userModel from "@/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = pitchValidationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { title, description, founder, ...rest } = parsed.data;
    if (!founder) {
      return NextResponse.json(
        { success: false, message: "Founder ID is required" },
        { status: 400 }
      );
    }
    const newPitch = new pitchSchema({ title, description, founder, ...rest });
    await newPitch.save();
    return NextResponse.json(
      { success: true, message: "Pitch created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pitch:", error);
    return NextResponse.json(
      new ApiResponse(500, null, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter: any = {};

    // Founder by ID
    if (searchParams.get("founder")) {
      filter.founder = searchParams.get("founder");
    }

    // Founder by name
    if (searchParams.get("founderName")) {
      const founder = await userModel.findOne({
        username: searchParams.get("founderName"),
      });
      if (founder) {
        filter.founder = founder._id;
      } else {
        return Response.json(
          { success: false, message: "Founder not found" },
          { status: 404 }
        );
      }
    }

    if (searchParams.get("status")) {
      filter.status = searchParams.get("status");
    }

    const pitches = await pitchSchema.find(filter).sort({ createdAt: -1 });
    return Response.json({ success: true, data: pitches });
  } catch (error) {
    console.error("Fetch Pitches Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pitches" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const parsed = pitchValidationSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: parsed.error.issues,
        },
        { status: 400 }
      );
    }
    const pitch = await pitchSchema.findById(id);
    if (!pitch) {
      return NextResponse.json(
        { success: false, message: "Pitch not found" },
        { status: 404 }
      );
    }

    if (body.founder !== pitch.founder.toString()) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }
    Object.assign(pitch, parsed.data);
    await pitch.save();
    return NextResponse.json({
      success: true,
      message: "Pitch updated successfully",
      data: pitch,
    });
  } catch (error) {
    console.error("Update Pitch Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const pitch = await pitchSchema.findById(id);
    if (!pitch) {
      return NextResponse.json(
        { success: false, message: "Pitch not found" },
        { status: 404 }
      );
    }

    if (body.founder !== pitch.founder.toString()) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    await pitch.deleteOne();
    return NextResponse.json({
      success: true,
      message: "Pitch deleted successfully",
    });
  } catch (error) {
    console.error("Delete Pitch Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
