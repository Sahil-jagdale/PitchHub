import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPitch extends Document {
  title: String;
  description: String;
  tags?: String[];
  fundingRequired: number;
  founder: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const pitchSchema = new Schema<IPitch>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
    },
    fundingRequired: {
      type: Number,
      required: true,
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
  },
  { timestamps: true }
);

export default mongoose.models.Pitch ||
  mongoose.model<IPitch>("Pitch", pitchSchema);
