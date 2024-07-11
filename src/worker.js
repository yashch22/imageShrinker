const imageQueue = require('./tasks');
const connectDB = require('./config/db');

// Connect to the database
connectDB();

console.log('Worker is running');
