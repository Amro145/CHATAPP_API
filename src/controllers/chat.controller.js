import { generateStreamToken } from "../../lib/stream.js";

export const getStreamToken = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const token = generateStreamToken(userId);

        if (!token) {
            return res.status(500).json({ message: "Failed to generate stream token" });
        }

        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}