const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set in environment variables');
      console.warn('⚠️  Server will start but database operations will fail');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.error('\n📝 To fix this:');
      console.error('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
      console.error('2. Navigate to Network Access');
      console.error('3. Add your current IP address (or use 0.0.0.0/0 for development)');
      console.error('4. Wait a few minutes for changes to propagate');
    }
    
    // In development, allow server to start even if DB fails
    // This allows testing API endpoints without DB connection
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.warn('\n⚠️  Continuing without database connection (development mode)');
      console.warn('⚠️  Database operations will fail until connection is established\n');
      return;
    }
    
    // In production, exit if DB connection fails
    console.error('❌ Exiting due to database connection failure');
    process.exit(1);
  }
};

module.exports = connectDB;

