import express from 'express';
import connectToDb from './lib/connectToDb.js';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from "cors";
import userRoutes from "./src/routes/user.route.js";
import chatRoutes from "./src/routes/chat.route.js";
import authRoutes from "./src/routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow both development and production origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);

// Helper to support Vercel function locally
app.get("/api/test", async (req, res) => {
    const handler = (await import("./api/test.js")).default;
    return handler(req, res);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// For local development
if (process.env.NODE_ENV !== 'production' && import.meta.url === `file://${process.argv[1]}`) {
    connectToDb()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error('Failed to connect to database:', error.message);
        });
}

export default app;