
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { generateId } from "./utils";

const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // or just "websocket" if you only want WebSockets
});

let todoList = [];

// Create a namespace for todo-related events
const todoListNameSpace = io.of("/todo");

todoListNameSpace.on("connection", (socket) => {
  console.log("A user connected");

  // Send the current todo list to the newly connected client
  socket.emit("todoList", todoList);

  // Handle adding a new todo
  socket.on("addTodo", (todo) => {
    try {
      if (!todo || typeof todo !== "string" || todo.trim() === "") {
        socket.emit("error", "Invalid todo value");
        return;
      }
      const id = generateId("TOD");
      const list = { id, value: todo.trim() };
      todoList.push(list);
      todoListNameSpace.emit("todoList", todoList);
      todoListNameSpace.emit("notification", `New todo added: ${todo}`);
    } catch (error) {
      console.error("Error adding todo:", error);
      socket.emit("error", "Failed to add todo");
    }
  });

  // Handle updating a todo
  socket.on("updateTodo", (todo) => {
    try {
      if (!todo || !todo.id || typeof todo.value !== "string") {
        socket.emit("error", "Invalid todo update data");
        return;
      }
      todoList = todoList.map((item) =>
        item.id === todo.id ? { ...item, value: todo.value } : item
      );
      todoListNameSpace.emit("todoList", todoList);
      todoListNameSpace.emit("notification", `Todo updated: ${todo.value}`);
    } catch (error) {
      console.error("Error updating todo:", error);
      socket.emit("error", "Failed to update todo");
    }
  });

  // Handle deleting a todo
  socket.on("deleteTodo", (id) => {
    try {
      if (!id) {
        socket.emit("error", "Invalid todo ID");
        return;
      }
      todoList = todoList.filter((item) => item.id !== id);
      todoListNameSpace.emit("todoList", todoList);
      todoListNameSpace.emit("notification", `Todo deleted with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting todo:", error);
      socket.emit("error", "Failed to delete todo");
    }
  });

  // Handle notification
  socket.on("notification", (message) => {
    try {
      if (!message || typeof message !== "string") {
        socket.emit("error", "Invalid notification message");
        return;
      }
      todoListNameSpace.emit("notification", message);
    } catch (error) {
      console.error("Error sending notification:", error);
      socket.emit("error", "Failed to send notification");
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Simple endpoint to test the server
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
