/**
 * TEMPORARY IN-MEMORY USER STORAGE
 * This allows testing authentication without MongoDB connection
 * Remove this file once MongoDB Atlas is working
 */

const bcrypt = require('bcryptjs');

// In-memory user storage
const users = new Map();

// Add a default demo user
const initDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('Prospera123!', 10);
  users.set('demo@prospera.lk', {
    _id: 'demo-user-001',
    name: 'Demo User',
    email: 'demo@prospera.lk',
    password: hashedPassword,
    role: 'farmer',
    phone: '+94771234567',
    createdAt: new Date(),
  });
  console.log('✅ Demo user initialized: demo@prospera.lk / Prospera123!');
};

const memoryDB = {
  // Find user by email
  findOne: async (email) => {
    return users.get(email) || null;
  },

  // Create new user
  create: async (userData) => {
    if (users.has(userData.email)) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      _id: `user-${Date.now()}`,
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.set(userData.email, newUser);
    return newUser;
  },

  // Match password
  matchPassword: async (inputPassword, hashedPassword) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
  },

  // Get all users (for debugging)
  getAllUsers: () => {
    return Array.from(users.values()).map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  },

  // Check if using memory DB
  isMemoryMode: () => true,
};

// Initialize demo user
initDemoUser();

module.exports = memoryDB;
