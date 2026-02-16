const mongoose = require('mongoose');

const tharunDbConnect = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Database connection failed: MONGODB_URI is not set');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, {
      // Recommended for MongoDB Atlas and Node 18+
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = tharunDbConnect;
