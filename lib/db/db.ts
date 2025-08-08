import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "@/utils/constants";
dotenv.config();

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function connectDB(): Promise<void> {
  const MONGODB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }
  if (connection.isConnected) {
    console.log("Already connected to Database.");
    return;
  }
  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI || "", {});
    connection.isConnected = connectionInstance.connections[0].readyState;
    console.log(`DB connection successfully`);
  } catch (error) {
    console.log("Database  connection failed", error);
    process.exit(1);
  }
}

export default connectDB;
