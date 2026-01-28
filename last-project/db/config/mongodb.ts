import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
    throw new Error("Please add your MongoDB URI to .env");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export const database = client.db("test");
export { clientPromise };