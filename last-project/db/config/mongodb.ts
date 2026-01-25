import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export const database = client.db("P3_LAST_PROJECT_AuliaFHanif_DB");