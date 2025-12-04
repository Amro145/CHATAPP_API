import { generateStreamToken } from "../../lib/stream.js";

export const getStreamToken = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const token = generateStreamToken(userId);
        res.status(200).json(token);
    } catch (error) {
        console.error("Error generating Stream token:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}