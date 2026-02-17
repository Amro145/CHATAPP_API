import app from '../app.js';
import connectToDb from '../lib/connectToDb.js';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        await connectToDb();
        isConnected = true;
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        throw error;
    }
};

export default async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
