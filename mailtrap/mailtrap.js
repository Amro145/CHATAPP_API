// const { MailtrapClient } = require("mailtrap");
import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;
if (!TOKEN) {
    console.warn("MAILTRAP_API_TOKEN is not defined in .env file. Email features will not work.");
}

export const client = TOKEN ? new MailtrapClient({
    token: TOKEN,
}) : null;

export const sender = {
    email: "hello@demomailtrap.co",
    name: "Amro Altayeb",
};