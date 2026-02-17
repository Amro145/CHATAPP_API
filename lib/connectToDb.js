import mongoose from 'mongoose';

let isConnected = false;

const connectToDb = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in the environment variables.');
    }

    const db = await mongoose.connect(dbUrl);
    isConnected = db.connections[0].readyState === 1;
    console.log('Connected to the database successfully.');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    throw error; // Let the caller handle the error
  }
};

export default connectToDb;
