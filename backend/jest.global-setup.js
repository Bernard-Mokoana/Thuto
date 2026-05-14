import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export default async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  global.__MONGOD__ = mongoServer;

  await mongoose.connect(uri);
  global.__MONGOOSE__ = mongoose;

  process.env.TEST_MODE = "true";
};
