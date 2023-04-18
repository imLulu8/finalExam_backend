import express from "express";
import { body, header, param, query } from "express-validator";
import { checkErrors } from "./utils";
import { Course } from "../models/Course";
import { isAuth } from "./utils";
const router = express.Router();

//GET ALL OR WITH FILTER
router.get(
  "/",
  query("name").optional().isString(),
  query("category").optional().isString(),
  query("duration").optional().isNumeric(),
  query("price").optional().isNumeric(),
  query("numMaxSub").optional().isNumeric(),
  checkErrors,
  async (req, res) => {
    const courses = await Course.find({ ...req.query });
    res.json(courses);
  }
);

//GET FOR ID
router.get("/:id", param("id").isMongoId(), checkErrors, async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  res.json(course);
});


//GET FOR CATEGORY
router.get("/:category", async (req, res) => {
  const { category } = req.params;
  const courses = await Course.find({ category });
  res.json(courses);
});




//ADD COURSE
router.post(
  "/",
  header("authorization").isJWT(),
  body("name").exists().isString(),
  body("category").exists().isString(),
  body("duration").isNumeric(),
  body("price").isNumeric(),
  body("numMaxSub").isNumeric(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { name, category, duration, price, numMaxSub } = req.body;
    const course = new Course({ name, category,duration, price, numMaxSub });
    const courseSaved = await course.save();
    res.status(201).json(courseSaved);
  }
);


//DELETE COURSE
router.delete(
  "/:id",
  header("authorization").isJWT(),
  param("id").isMongoId(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    await Course.findByIdAndDelete(id);
    res.json({ message: "Course deleted" });
  }
);


//MODIFY COURSE
router.put(
  "/:id",
  header("authorization").isJWT(),
  param("id").isMongoId(),
  body("name").exists().isString(),
  body("category").exists().isString(),
  body("duration").exists().isNumeric(),
  body("price").exists().isNumeric(),
  body("numMaxSub").exists().isNumeric(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { id } = req.params;
    const { name, category,duration, price, numMaxSub } = req.body;
    try {
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: "course not found" });
      }
      course.name = name;
      course.category = category;
      course.duration = duration;
      course.price = price;
      course.numMaxSub = numMaxSub;
      const courseSaved = await course.save();
      res.json(courseSaved);
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);







export default router;
