app.post("/chat", async (req, res) => {
    const { message, botType } = req.body;

    // Define system messages for different chatbots
    const botPersonalities = {
        "Sales Bot": "You are a helpful sales assistant who suggests products.",
        "Support Bot":
            "You are a customer support agent, helping with common issues.",
        "HR Bot": "You are an HR assistant helping employees with HR policies.",
        "Finance Bot":
            "You are a finance assistant providing financial guidance.",
        "E-commerce Bot":
            "You help customers track their orders and suggest products.",
        "Healthcare Bot": "You provide basic health advice and tips.",
        "Education Bot": "You are a tutor helping students with their studies.",
    };

    const systemMessage =
        botPersonalities[botType] || "You are a helpful assistant.";

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: message },
            ],
        });

        const botReply = response.choices[0].message.content;

        // Save chat history in MongoDB
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
