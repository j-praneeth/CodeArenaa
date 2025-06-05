
import { connectToMongoDB } from './mongodb';
import { ObjectId } from 'mongodb';

export interface MongoUser {
  _id?: ObjectId;
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoContest {
  _id?: ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  maxParticipants?: number;
  createdBy: string;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoProblem {
  _id?: ObjectId;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoStorage {
  static async upsertUser(userData: Omit<MongoUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<MongoUser> {
    const db = await connectToMongoDB();
    const collection = db.collection<MongoUser>('users');
    
    const now = new Date();
    const user = await collection.findOneAndUpdate(
      { id: userData.id },
      {
        $set: {
          ...userData,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    return user!;
  }

  static async getUserById(id: string): Promise<MongoUser | null> {
    const db = await connectToMongoDB();
    const collection = db.collection<MongoUser>('users');
    return await collection.findOne({ id });
  }

  static async createContest(contestData: Omit<MongoContest, '_id' | 'createdAt' | 'updatedAt'>): Promise<MongoContest> {
    const db = await connectToMongoDB();
    const collection = db.collection<MongoContest>('contests');
    
    const now = new Date();
    const contest = {
      ...contestData,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await collection.insertOne(contest);
    return { ...contest, _id: result.insertedId };
  }

  static async getContests(status?: string): Promise<MongoContest[]> {
    const db = await connectToMongoDB();
    const collection = db.collection<MongoContest>('contests');
    
    const filter = status ? { status } : {};
    return await collection.find(filter).sort({ createdAt: -1 }).toArray();
  }

  static async createProblem(problemData: Omit<MongoProblem, '_id' | 'createdAt' | 'updatedAt'>): Promise<MongoProblem> {
    const db = await connectToMongoDB();
    const collection = db.collection<MongoProblem>('problems');
    
    const now = new Date();
    const problem = {
      ...problemData,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await collection.insertOne(problem);
    return { ...problem, _id: result.insertedId };
  }

  static async getProblems(): Promise<MongoProblem[]> {
    const db = await connectToMongoDB();
    const collection = db.collection<MongoProblem>('problems');
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async getProblemById(id: string): Promise<MongoProblem | null> {
    const db = await connectToMongoDB();
    const collection = db.collection<MongoProblem>('problems');
    return await collection.findOne({ _id: new ObjectId(id) });
  }
}
