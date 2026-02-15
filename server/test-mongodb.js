require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Atlas Connection...\n');
console.log('Connection String:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@')); // Hide password
console.log('\nAttempting to connect...\n');

const testConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    console.log('✅ SUCCESS! MongoDB Connected to:', conn.connection.host);
    console.log('📊 Database name:', conn.connection.name);
    console.log('🎉 Your MongoDB Atlas connection is working!\n');
    
    await mongoose.connection.close();
    console.log('Connection closed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('\n🔧 TROUBLESHOOTING:\n');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('Issue: Cannot resolve MongoDB cluster DNS');
      console.error('Solutions:');
      console.error('  1. Check if cluster is ACTIVE in MongoDB Atlas');
      console.error('  2. Verify cluster URL: prospera.xcskpxc.mongodb.net');
      console.error('  3. Try pausing and resuming the cluster');
      console.error('  4. Create a new cluster if this one is corrupted\n');
    } else if (error.message.includes('timed out')) {
      console.error('Issue: Connection timeout');
      console.error('Solutions:');
      console.error('  1. Add 0.0.0.0/0 to Network Access IP whitelist');
      console.error('  2. Check your internet connection');
      console.error('  3. Disable VPN if active');
      console.error('  4. Check firewall settings\n');
    } else if (error.message.includes('authentication')) {
      console.error('Issue: Username or password incorrect');
      console.error('Solutions:');
      console.error('  1. Verify database username: nethminalakshan2018_db_user');
      console.error('  2. Reset password in MongoDB Atlas');
      console.error('  3. Check for special characters in password\n');
    }
    
    process.exit(1);
  }
};

testConnection();
