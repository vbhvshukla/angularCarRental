import mongoose from "mongoose";

/**
 * DB Connection
 * @function connectDb();
 * @requires MONGODB_URI
 * @description Connecting to DB
 */

const connectDb = async function () {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB connected at DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Error in DB/INDEX.JS: ", error);
        process.exit(1);
    }
}

export default connectDb;