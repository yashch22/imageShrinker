const express = require('express');
const connectDB = require('./config/db');
const indexRouter = require('./routes/index');
const webhookRouter = require('./routes/webhook');

require('dotenv').config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', indexRouter);
app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
