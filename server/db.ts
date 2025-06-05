
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URL) {
  throw new Error(
    "MONGODB_URL must be set. Using the provided MongoDB connection string.",
  );
}

const MONGODB_URL = "mongodb+srv://bandarin29:meritcurve@meritcurve.73u7fr7.mongodb.net/";

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    db = client.db('meritcurve');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToMongoDB first.');
  }
  return db;
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
  }
}
