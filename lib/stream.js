import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET;

if (!apiKey || !apiSecret) {
  console.warn("Warning: Stream API key or Secret is missing in environment variables. Stream Chat features will not work.");
}

const streamClient = (apiKey && apiSecret) ? StreamChat.getInstance(apiKey, apiSecret) : null;

export const upsertStreamUser = async (userData) => {
  if (!streamClient) {
    console.warn("Stream client not initialized. Skipping user upsert.");
    return;
  }
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error; // Re-throw to let caller handle it
  }
};

export const generateStreamToken = (userId) => {
  if (!streamClient) {
    console.warn("Stream client not initialized. Cannot generate token.");
    return null;
  }
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
