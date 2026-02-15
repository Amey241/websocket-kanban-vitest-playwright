import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import Task from "./models/Task.js";

const app = express();
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/kanban");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", async (socket) => {
  console.log("Client connected");

  const tasks = await Task.find();
  socket.emit("sync:tasks", tasks);

  socket.on("task:create", async (data) => {
    const task = await Task.create(data);
    io.emit("task:create", task);
  });

  socket.on("task:update", async (data) => {
    const updated = await Task.findByIdAndUpdate(data._id, data, { new: true });
    io.emit("task:update", updated);
  });

  socket.on("task:delete", async (id) => {
    await Task.findByIdAndDelete(id);
    io.emit("task:delete", id);
  });
});

server.listen(5000, () => console.log("Backend running on 5000"));
