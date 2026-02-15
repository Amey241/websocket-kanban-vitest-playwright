import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  column: String,
  priority: String,
  category: String,
});

export default mongoose.model("Task", taskSchema);
