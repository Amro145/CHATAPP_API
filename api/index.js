import express from 'express';
import bodyParser from 'body-parser';
import connectToDb from '../lib/connectToDb.js';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from '../src/routes/user.route.js';
import chatRoutes from '../src/routes/chat.route.js';
import authRoutes from '../src/routes/auth.route.js';

dotenv.config();

const app = express();

// CORS configuration - allow both development and production origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL, // Add your production frontend URL to .env
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);

// Connect to database once
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        await connectToDb();
        isConnected = true;
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        throw error;
    }
};

// Serverless function handler
export default async (req, res) => {
    try {
        // Connect to database on first invocation
        await connectDB();

        // Handle the request
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
