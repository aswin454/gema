const mongoose = require('mongoose');

let useInMemoryDb = false;

// Shared in-memory data store for fallback execution
const inMemoryStore = {
  users: [],
  students: [],
  courses: [],
  attendance: [],
  assignments: [],
  complaints: [],
  placements: [],
  notifications: [],
  chatHistory: []
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusone';
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    
    // We set serverSelectionTimeoutMS to 3000ms so it fails fast and triggers the fallback
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    useInMemoryDb = false;
  } catch (error) {
    console.warn(`\n=============================================================`);
    console.warn(`WARNING: Failed to connect to MongoDB: ${error.message}`);
    console.warn(`FALLBACK TRIGGERED: CampusOne AI will run in IN-MEMORY DATABASE mode.`);
    console.warn(`All data will be managed in-memory and will reset upon server restart.`);
    console.warn(`=============================================================\n`);
    useInMemoryDb = true;
  }
};

const getDBMode = () => useInMemoryDb;
const getStore = () => inMemoryStore;

module.exports = {
  connectDB,
  getDBMode,
  getStore
};
