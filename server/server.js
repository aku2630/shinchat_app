const express = require("express");
const colors = require("colors");
const dbConnect = require("./db.js");
require("dotenv").config();
const { errorHandler, routeNotFound } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const path = require("path");
const axios = require("axios");
const Message = require("./models/message.js");
const cors = require("cors");

dbConnect();
const app = express();
app.use(express.json());
app.use(cors());

// Main routes
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);

// -----------------------------------------------------------------------------

const __dirname$ = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname$, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname$, "client", "build", "index.html"));
  });
} else {
  // First route
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Hello from Chat-app server",
    });
  });
}

// -----------------------------------------------------------------------------

// Error handling routes
app.use(routeNotFound);
app.use(errorHandler);

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(
    colors.green(`\nServer is UP on PORT ${process.env.SERVER_PORT}`)
  );
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Sockets are in action");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData.name, "connected");
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });
  socket.on("new message", async (newMessage) => {
    var chat = newMessage.chatId;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });
  socket.on("new ai message", (newMessage) => {
    const chat = newMessage.chatId;
    if (!chat.users) return console.log("ai chat.users not defined");
    const sender = newMessage.sender;
    // console.log(sender);

    socket.emit("ai typing", chat._id);

    const aiMessage = {
      sender: {
        _id: process.env.AI_CHAT_USER_ID,
        name: "Shinchan",
        image: "",
      },
      content: "Hey, hey! It's Shinchan! 😜 Ready for some mischief? Let's have fun!",
      chatId: chat,
    };

    const promptMessage = `
You are Shinchan and I am ${sender.name} and you've to reply in his words, in hinglish, for the given message.

${newMessage.content}
    `;

    const data = {
      model: "google/gemma-2-2b-it",
      messages: [{ role: "user", content: promptMessage }],
      max_tokens: 100,
      stream: false
    };

    const getAiMessage = (res) => {
      return res.data.choices[
        Math.floor(Math.random() * res.data.choices.length)
      ].message.content || "I have no response for this. Please try something else on me.";
    }

    axios.post('https://api-inference.huggingface.co/models/google/gemma-2-2b-it/v1/chat/completions', data, {
      headers: {
        'Authorization': `Bearer ${process.env.AI_CHAT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        aiMessage.content = getAiMessage(res)
        io.to(socket.id).emit("message received", aiMessage);
        socket.emit("ai stop typing", chat._id);
        Message.create({
          sender: process.env.AI_CHAT_USER_ID,
          content: aiMessage.content,
          chatId: chat._id,
        });
      })
      .catch((err) => {
        console.log(err);
        aiMessage.content =
          // "Something went wrong while processing your query. Please try again.";
          "Servers are temporarily down. Please try again later."
        aiMessage.error = true;
        io.to(socket.id).emit("message received", aiMessage);
        socket.emit("ai stop typing", chat._id);
        Message.create({
                sender: process.env.AI_CHAT_USER_ID,
                content: aiMessage.content,
                chatId: chat._id,
              });
      });
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    socket.leave(socket.id);
  });
});
