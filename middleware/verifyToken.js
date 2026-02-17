import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    let token = req.cookies.token;

    // Also check for Authorization header (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    try {
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized! No token provided.',
                user: null,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            message: 'Unauthorized! Invalid token.',
        });
    }
}