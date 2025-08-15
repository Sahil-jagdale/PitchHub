import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPitch extends Document {
  title: string;
  description: string;
  tags?: string[];
  fundingRequired: number;
  equityOffered?: number;
  valuation?: number;
  founder: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  stage?: "idea" | "MVP" | "growth" | "scaling";
  industry?: string;
  pitchDeckUrl?: string;
  images?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pitchSchema = new Schema<IPitch>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
    },
    fundingRequired: {
      type: Number,
      required: true,
    },
    equityOffered: {
      type: Number, // percentage (e.g., 10 for 10%)
    },
    valuation: {
      type: Number,
    },
    founder: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    stage: {
      type: String,
      enum: ["idea", "MVP", "growth", "scaling"],
    },
    industry: {
      type: String,
    },
    pitchDeckUrl: {
      type: String, // link to PDF/Google Slides
    },
    images: {
      type: [String], // array of image URLs
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Pitch ||
  mongoose.model<IPitch>("Pitch", pitchSchema);
