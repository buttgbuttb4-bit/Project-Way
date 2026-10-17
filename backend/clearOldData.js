import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudentIdea from './models/StudentIdea.js';
import StudentProgress from './models/StudentProgress.js';

dotenv.config();

const clearOldData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all StudentIdea documents
    const ideasDeleted = await StudentIdea.deleteMany({});
    console.log(`✅ Deleted ${ideasDeleted.deletedCount} ideas from StudentIdea collection`);

    // Clear all StudentProgress documents
    const progressDeleted = await StudentProgress.deleteMany({});
    console.log(`✅ Deleted ${progressDeleted.deletedCount} progress records from StudentProgress collection`);

    console.log('\n✅ All old data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

clearOldData();
