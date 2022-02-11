/* The above code is creating a schema for a Task model. */
const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
    {
        description: {
            required: true,
            type: "string",
            trim: true,
            minLength: 10,
        },
        completed: {
            default: false,
            type: "boolean",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
