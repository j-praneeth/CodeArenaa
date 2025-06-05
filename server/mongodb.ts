
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://bandarin29:meritcurve@meritcurve.73u7fr7.mongodb.net/';
const DATABASE_NAME = 'meritcurve';

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
  }
  
  if (!db) {
    db = client.db(DATABASE_NAME);
  }
  
  return db;
}

export async function disconnectFromMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

export { db };
