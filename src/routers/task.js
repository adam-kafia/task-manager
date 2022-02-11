const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const User = require("../models/user");

const router = express.Router();

//Get all tasks
router.get("/tasks", auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};
        const limit = req.query.limit;
        const skip = req.query.skip;
        const completed = req.query.completed;
        if (completed) match.completed = completed;
        //console.log(req.query.sortBy);
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split("_");
            sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
            //console.log(sort);
        }
        const tasks = await req.user.populate({
            path: "tasks",
            match,
            options: { limit, skip, sort },
        });

        //console.log(tasks.tasks);
        res.send(req.user.tasks);
        // console.log(req.user.tasks);
    } catch (err) {
        res.status(500).send(err.message);
        //console.log(err);
    }
});

//Get task by id
router.get("/tasks/:id", auth, async (req, res) => {
    const id_ = req.params.id;
    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, user: req.user._id });
        if (!task) return res.status(404).send("Task not found.");
        res.send(task);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//Add task
router.post("/tasks", auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,

            user: req.user._id,
        });
        task.save();
        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//Update task
router.patch("/tasks/:id", auth, async (req, res) => {
    const requiredFields = ["description", "completed"];
    const updatedFields = Object.keys(req.body);
    const isValid = updatedFields.every((field) => requiredFields.includes(field));

    if (!isValid) {
        return res.status(400).send("Invalid field(s)");
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).send("Task not found.");
        updatedFields.forEach((field) => (task[field] = req.body[field]));
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//Delete task
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!task) return res.status(404).send("Task not found.");
        res.send(task);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
