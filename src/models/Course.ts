import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true},
  category: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  numMaxSub: { type : Number , required: true}
});

export const Course = mongoose.model("Course", CourseSchema);
