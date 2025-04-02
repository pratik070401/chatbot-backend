require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Chat Schema
const ChatSchema = new mongoose.Schema({
    userMessage: String,
    botMessage: String,
    timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

// Chat Endpoint
app.post("/chat", async (req, res) => {
    const { message } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });

        const botReply = response.choices[0].message.content;

        // Save chat to MongoDB
        const chat = new Chat({ userMessage: message, botMessage: botReply });
        await chat.save();

        res.json({ botReply });
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({
            error: "Failed to fetch response from OpenAI.",
        });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
