const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('PostgreSQL connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
