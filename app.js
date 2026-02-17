import express from 'express';
import connectToDb from './lib/connectToDb.js';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from "cors";
import userRoutes from "./src/routes/user.route.js";
import chatRoutes from "./src/routes/chat.route.js";
import authRoutes from "./src/routes/auth.route.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow both development and production origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
    'https://chatapp-api-ecru.vercel.app',
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

// Swagger Documentation
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css";
app.use('/api-docs', (req, res, next) => {
    // Ensure trailing slash for proper asset loading
    if (req.originalUrl === '/api-docs' || (req.originalUrl.includes('?') && req.originalUrl.split('?')[0] === '/api-docs')) {
        const query = req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '';
        return res.redirect('/api-docs/' + query);
    }
    next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCssUrl: CSS_URL }));

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
                console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs/`);
            });
        })
        .catch((error) => {
            console.error('Failed to connect to database:', error.message);
        });
}

export default app;