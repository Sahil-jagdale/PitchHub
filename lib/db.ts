import mongoose from 'mongoose'


type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}


async function connectDB(): Promise<void> { 
    if(connection.isConnected){
        console.log("Already connected to Database.");
        return;
    }
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI ||  '', {});
        connection.isConnected = connectionInstance.connections[0].readyState
        console.log(`DB connection successfully`);
    } catch (error) {
        console.log('Database  connection failed', error);
        process.exit(1);
    }
}

export default connectDB;

