const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      bufferCommands: false, // Disable buffering to fail fast
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if your MongoDB Atlas cluster is ACTIVE (not paused)');
    console.error('2. Verify IP whitelist includes 0.0.0.0/0 or your current IP');
    console.error('3. Confirm your connection string is correct');
    console.error('4. Check your internet connection\n');
    
    // Don't exit process, let server run without DB for now
    return null;
  }
};

module.exports = connectDB;
