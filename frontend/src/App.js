import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css"; // Include custom styles

const socket = io("https://socket-io-test-xeii.onrender.com/todo", {
  transports: ["websocket"], // Use only WebSocket transport
});

const App = () => {
  const [todoList, setTodoList] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [editingTodo, setEditingTodo] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    socket.on("todoList", (list) => {
      setTodoList(list);
    });

    socket.on("notification", (message) => {
      showBrowserNotification(message);
      setNotification(message);
      setTimeout(() => setNotification(""), 5000);
    });

    return () => {
      socket.off("todoList");
      socket.off("notification");
    };
  }, []);

  const handleAddTodo = () => {
    if (todoInput.trim() === "") return;
    socket.emit("addTodo", todoInput);
    setTodoInput("");
  };

  const handleUpdateTodo = (id, newValue) => {
    if (newValue.trim() === "") return;
    socket.emit("updateTodo", { id, value: newValue });
  };

  const handleDeleteTodo = (id) => {
    socket.emit("deleteTodo", id);
  };

  const showBrowserNotification = (message) => {
    if (Notification.permission === "granted") {
      new Notification("Todo Notification", {
        body: message,
        icon: "/notification-icon.png",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl relative">
        {notification && (
          <div className="notification">
            <p>{notification}</p>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Todo List</h1>
        <div className="flex items-center mb-6">
          <input
            type="text"
            placeholder="Add a todo"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleAddTodo}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-4">
          {todoList.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow"
            >
              <input
                type="text"
                value={todo.value}
                onChange={(e) => setEditingTodo(e.target.value)}
                className="flex-grow px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={() => handleUpdateTodo(todo.id, editingTodo)}
                className="ml-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="ml-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
