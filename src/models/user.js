const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        age: {
            type: Number,
            validate(value) {
                if (value < 18) {
                    throw new Error("age must be greater than 18");
                }
            },
            default: 18,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is not valid");
                }
            },
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("Invalid password");
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    }
);

/* This is a virtual field. It is not a real field in the database. It is a field that is not stored in
the database but is used to create a relationship between the user and the task. */
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "user",
});

/* A static method. It is a method that is not attached to an instance of a model. It is attached to
the model itself. */
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Wrong Password");

    return user;
};

/* This is a method that is attached to the userSchema. It is a method that is not attached to an
instance of a model. It is attached to the model itself. */
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

/* A method that is attached to the userSchema. It is a method that is not attached to an instance of a
model. It is attached to the model itself. */
userSchema.methods.generateAuthToken = async function (user) {
    const token = jwt.sign({ _id: this.id.toString() }, process.env.JWT_SECRET);
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
};

//hash password
/* This is a pre-hook. It is a method that is called before the model is saved. */

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

//delete tasks when user is deleted
/* Deleting all the tasks that are associated with the user that is being deleted. */

userSchema.pre("remove", async function (next) {
    await Task.deleteMany({ user: this._id });
    // console.log(this);
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
