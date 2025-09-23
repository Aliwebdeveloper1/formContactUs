const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contactform';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    const connection = await mongoose.connect(mongoURI, options);
    
    console.log(`🔗 MongoDB Connected: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
function handleDisconnection() {
  mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
  });

  // Handle app termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('Error during MongoDB disconnection:', error);
      process.exit(1);
    }
  });
}

module.exports = { connectDB, handleDisconnection };
