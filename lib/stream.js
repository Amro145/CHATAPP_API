import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key or Secret is missing in environment variables");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error; // Re-throw to let caller handle it
  }
};

export const generateStreamToken = (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to generate stream token");
    }
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return null; // Return null instead of undefined, or throw
  }
};
